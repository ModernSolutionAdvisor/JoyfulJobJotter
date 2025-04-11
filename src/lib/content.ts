// src/content.ts

// --- Interfaces (assuming these are defined or imported) ---
// @TODO Add country and state to the JobData interface
interface JobData {
	companyName?: string;
	jobPosition?: string;
	jobUrl?: string; // URL will be added universally later
}

interface BackgroundMessage {
	action: 'getJobData';
}

// --- Site-Specific Extraction Logic ---

// LinkedIn
function extractLinkedInData(): Omit<JobData, 'jobUrl'> { // Return type excludes jobUrl initially
	console.log('Using LinkedIn Extraction Logic');
	// SELECTORS SPECIFIC TO LINKEDIN JOB PAGES (these might change!)
	const companyName =
		document.querySelector<HTMLAnchorElement>('a.topcard__org-name-link')?.innerText.trim() ??
		document.querySelector<HTMLAnchorElement>(
			'.job-details-jobs-unified-top-card__company-name a' // Newer selector?
		)?.innerText.trim() ??
        document.querySelector<HTMLSpanElement>('.job-details-jobs-unified-top-card__primary-description-container > div:first-child > span:first-child')?.innerText.split('·')[0].trim() ?? // Another possible location
		undefined;

	const jobPosition =
		document.querySelector<HTMLHeadingElement>('h1.topcard__title')?.innerText.trim() ??
		document.querySelector<HTMLHeadingElement>('.job-details-jobs-unified-top-card__job-title')?.innerText.trim() ??
		undefined;

	return { companyName, jobPosition };
}

// Indeed
function extractIndeedData(): Omit<JobData, 'jobUrl'> {
	console.log('Using Indeed Extraction Logic');
	// SELECTORS SPECIFIC TO INDEED JOB PAGES (these WILL change!)
    // Indeed often uses dynamically generated class names, making it harder.
    // Look for data attributes or stable parent elements.
	const companyName =
        document.querySelector<HTMLElement>('[data-testid="jobsearch-CompanyInfoContainer"] [data-testid="inlineHeader-companyName"] a')?.innerText.trim() ??
		document.querySelector<HTMLDivElement>('div[data-company-name="true"]')?.innerText.trim() ?? // Older?
		undefined;

	const jobPosition =
        document.querySelector<HTMLHeadingElement>('h1.jobsearch-JobInfoHeader-title')?.innerText.trim() ??
        document.querySelector<HTMLHeadingElement>('.jobsearch-JobInfoHeader-title > span')?.innerText.trim() ?? // Sometimes wrapped in a span
		undefined;

	return { companyName, jobPosition };
}

// Glassdoor
function extractGlassdoorData(): Omit<JobData, 'jobUrl'> {
    console.log("Using Glassdoor Extraction Logic");
    // SELECTORS SPECIFIC TO GLASSDOOR JOB PAGES (these might change!)
    const companyName =
        document.querySelector<HTMLDivElement>('[data-test="employer-name"]')?.innerText.trim() ??
        document.querySelector<HTMLDivElement>('#EmployerName')?.innerText.trim() ?? // Older ID?
        undefined;

    const jobPosition =
        document.querySelector<HTMLDivElement>('[data-test="job-title"]')?.innerText.trim() ??
        document.querySelector<HTMLDivElement>('#JobTitle')?.innerText.trim() ?? // Older ID?
        undefined;

    return { companyName, jobPosition };
}


// Generic Fallback (e.g., using Title Tag)
function extractGenericData(): Omit<JobData, 'jobUrl'> {
	console.log('Using Generic Fallback Logic (Title Tag)');
	const title = document.title;
	let companyName: string | undefined = undefined;
	let jobPosition: string | undefined = undefined;

	// Try common title patterns like "Job Title - Company Name | Site" or "Job Title at Company Name"
	const separators = [' - ', ' | ', ' at ', ' | ']; // Order matters sometimes
	let parts: string[] = [title];

	for (const sep of separators) {
		if (title.includes(sep)) {
			parts = title.split(sep);
			break;
		}
	}

    if (parts.length >= 2) {
        // Basic assumption: first part is title, second is company
        jobPosition = parts[0].trim();
        companyName = parts[1].trim();
        // Refine: Remove site name if present (e.g., " | LinkedIn")
        if (companyName.includes(' | ')) {
             companyName = companyName.split(' | ')[0].trim();
        }
    } else {
        // If no separator found, maybe just use the whole title as the job position?
        jobPosition = title.trim();
    }


	return { companyName, jobPosition };
}

// --- Mapping Hostnames to Extraction Functions ---
// Using RegExp for potentially more specific matching (e.g., avoid blog.linkedin.com)
// Keys are RegExp patterns to match against window.location.hostname
const siteExtractors: { [key: string]: () => Omit<JobData, 'jobUrl'> } = {
	'linkedin\\.com': extractLinkedInData,
	'indeed\\.com': extractIndeedData,
    'glassdoor\\.com': extractGlassdoorData,
	// Add more entries here for other job sites:
	// 'ziprecruiter\\.com': extractZipRecruiterData,
	// 'jobs\\.lever\\.co': extractLeverData, // Example for ATS
    // 'boards\\.greenhouse\\.io': extractGreenhouseData, // Example for ATS
};


// --- Message Listener ---
chrome.runtime.onMessage.addListener(
	(
		request: BackgroundMessage | any,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: JobData) => void
	): boolean => { // Return value indicates async response capability
		if (request.action === 'getJobData') {
			const hostname = window.location.hostname;
			let data: JobData = {}; // Initialize empty data object

			// Find the correct extractor based on hostname RegExp keys
			let extractorFound = false;
			for (const pattern in siteExtractors) {
				if (new RegExp(pattern, 'i').test(hostname)) { // Case-insensitive match
					data = siteExtractors[pattern](); // Execute the site-specific function
					extractorFound = true;
					break;
				}
			}

			// If no specific extractor was found, use the generic fallback
			if (!extractorFound) {
				data = extractGenericData();
			}

			// Always add the current URL
			data.jobUrl = window.location.href;

			console.log('Content script extracted data:', data);
			sendResponse(data); // Send the combined data back

			// Return true only if you were to make sendResponse asynchronous,
            // but in this pattern, it's called synchronously within the handler.
            // However, returning true is often safer in complex listeners.
            return true;
		}
        // If the message action doesn't match, return false or undefined.
        return false;
	}
);

// Optional: Log to confirm the script is injected
console.log('Job Journal content script injected and listening.');