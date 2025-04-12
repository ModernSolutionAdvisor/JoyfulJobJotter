// content.ts

// Prevent multiple injections
if (!(window as any).jobJournalInjected) {
    (window as any).jobJournalInjected = true;

    // --- Interfaces ---
    interface JobData {
        companyName?: string;
        jobPosition?: string;
        jobUrl?: string;
    }

    interface BackgroundMessage {
        action: 'getJobData';
    }

    // --- Utility Functions ---
    function extractWithRetry(
        extractorFn: () => Omit<JobData, 'jobUrl'>, 
        maxRetries = 3, 
        delay = 1000
    ): Promise<Omit<JobData, 'jobUrl'>> {
        return new Promise((resolve) => {
            let attempts = 0;

            const tryExtract = () => {
                const data = extractorFn();
                // Consider extraction successful if we have either company name or position
                if ((data.companyName || data.jobPosition) && attempts < maxRetries) {
                    resolve(data);
                } else if (attempts < maxRetries) {
                    attempts++;
                    console.log(`Retry attempt ${attempts} for data extraction`);
                    setTimeout(tryExtract, delay);
                } else {
                    console.log('Max retries reached, returning available data');
                    resolve(data);
                }
            };

            tryExtract();
        });
    }

    function createObserver(callback: () => void) {
        const observer = new MutationObserver((mutations) => {
            // Filter significant changes to avoid unnecessary processing
            const significantChanges = mutations.some(mutation => 
                mutation.addedNodes.length > 0 || 
                mutation.removedNodes.length > 0
            );

            if (significantChanges) {
                callback();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style'] // Watch for specific attribute changes
        });

        // Cleanup after 10 seconds to prevent memory leaks
        setTimeout(() => {
            observer.disconnect();
            console.log('DOM observer disconnected after timeout');
        }, 10000);

        return observer;
    }

    // --- Site-Specific Extraction Logic ---

    // LinkedIn
    function extractLinkedInData(): Omit<JobData, 'jobUrl'> {
        console.log('Using LinkedIn Extraction Logic');
        
        const companyName = 
            document.querySelector<HTMLAnchorElement>('a.topcard__org-name-link')?.innerText.trim() ??
            document.querySelector<HTMLAnchorElement>('.job-details-jobs-unified-top-card__company-name a')?.innerText.trim() ??
            document.querySelector<HTMLSpanElement>('.job-details-jobs-unified-top-card__primary-description-container > div:first-child > span:first-child')?.innerText.split('·')[0].trim() ??
            undefined;

        const jobPosition =
            document.querySelector<HTMLHeadingElement>('h1.topcard__title')?.innerText.trim() ??
            document.querySelector<HTMLHeadingElement>('.job-details-jobs-unified-top-card__job-title')?.innerText.trim() ??
            undefined;

        console.log('LinkedIn extraction result:', { companyName, jobPosition });
        return { companyName, jobPosition };
    }

    // Indeed
    function extractIndeedData(): Omit<JobData, 'jobUrl'> {
        console.log('Using Indeed Extraction Logic');
        
        const companyName =
            document.querySelector<HTMLElement>('[data-testid="jobsearch-CompanyInfoContainer"] [data-testid="inlineHeader-companyName"] a')?.innerText.trim() ??
            document.querySelector<HTMLDivElement>('div[data-company-name="true"]')?.innerText.trim() ??
            document.querySelector<HTMLElement>('.jobsearch-CompanyInfoContainer .jobsearch-InlineCompanyRating div')?.innerText.trim() ??
            undefined;

        const jobPosition =
            document.querySelector<HTMLHeadingElement>('h1.jobsearch-JobInfoHeader-title')?.innerText.trim() ??
            document.querySelector<HTMLHeadingElement>('.jobsearch-JobInfoHeader-title > span')?.innerText.trim() ??
            document.querySelector<HTMLHeadingElement>('[data-testid="jobTitle"]')?.innerText.trim() ??
            undefined;

        console.log('Indeed extraction result:', { companyName, jobPosition });
        return { companyName, jobPosition };
    }

    // Glassdoor
    function extractGlassdoorData(): Omit<JobData, 'jobUrl'> {
        console.log('Using Glassdoor Extraction Logic');
        
        const companyName =
            document.querySelector<HTMLDivElement>('[data-test="employer-name"]')?.innerText.trim() ??
            document.querySelector<HTMLDivElement>('#EmployerName')?.innerText.trim() ??
            document.querySelector<HTMLDivElement>('.employerName')?.innerText.trim() ??
            undefined;

        const jobPosition =
            document.querySelector<HTMLDivElement>('[data-test="job-title"]')?.innerText.trim() ??
            document.querySelector<HTMLDivElement>('#JobTitle')?.innerText.trim() ??
            document.querySelector<HTMLHeadingElement>('.job-title')?.innerText.trim() ??
            undefined;

        console.log('Glassdoor extraction result:', { companyName, jobPosition });
        return { companyName, jobPosition };
    }

    // Generic Fallback
    function extractGenericData(): Omit<JobData, 'jobUrl'> {
        console.log('Using Generic Fallback Logic');
        
        const title = document.title;
        let companyName: string | undefined = undefined;
        let jobPosition: string | undefined = undefined;

        // Common title patterns
        const separators = [' - ', ' | ', ' at ', ' @ '];
        let parts: string[] = [title];

        for (const sep of separators) {
            if (title.includes(sep)) {
                parts = title.split(sep);
                break;
            }
        }

        if (parts.length >= 2) {
            jobPosition = parts[0].trim();
            companyName = parts[1].trim();
            
            // Remove site name if present
            if (companyName.includes(' | ')) {
                companyName = companyName.split(' | ')[0].trim();
            }
        } else {
            // Fallback to using meta tags
            jobPosition = 
                document.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
                document.querySelector('meta[name="title"]')?.getAttribute('content') ??
                title.trim();
            
            companyName = 
                document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ??
                undefined;
        }

        console.log('Generic extraction result:', { companyName, jobPosition });
        return { companyName, jobPosition };
    }

    // --- Site Extractors Mapping ---
    const siteExtractors: { [key: string]: () => Omit<JobData, 'jobUrl'> } = {
        'linkedin\\.com': extractLinkedInData,
        'indeed\\.com': extractIndeedData,
        'glassdoor\\.com': extractGlassdoorData,
        // Add more job sites here as needed
    };

    // --- Message Handler ---
    chrome.runtime.onMessage.addListener(
        (
            request: BackgroundMessage | any,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response: JobData) => void
        ): boolean => {
            if (request.action === 'getJobData') {
                const hostname = window.location.hostname;
                
                // Find the appropriate extractor
                let extractorFn: () => Omit<JobData, 'jobUrl'> = extractGenericData;
                for (const pattern in siteExtractors) {
                    if (new RegExp(pattern, 'i').test(hostname)) {
                        extractorFn = siteExtractors[pattern];
                        break;
                    }
                }

                // Create an observer for dynamic content
                const observer = createObserver(() => {
                    console.log('Significant DOM changes detected');
                    // You could potentially re-extract data here if needed
                });

                // Extract data with retry mechanism
                extractWithRetry(extractorFn)
                    .then(data => {
                        const fullData: JobData = {
                            ...data,
                            jobUrl: window.location.href
                        };
                        
                        console.log('Final extracted data:', fullData);
                        sendResponse(fullData);
                        
                        // Cleanup
                        observer.disconnect();
                    })
                    .catch(error => {
                        console.error('Error during data extraction:', error);
                        sendResponse({
                            jobUrl: window.location.href
                        });
                    });

                return true; // Indicates async response
            }
            return false;
        }
    );

    // --- Initialization Log ---
    console.log('Job Journal content script initialized:', {
        url: window.location.href,
        timestamp: new Date().toISOString()
    });
}