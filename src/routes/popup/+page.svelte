<script>
    import { onMount } from 'svelte';

    let companyName = '';
    let jobPosition = '';
    let showPopup = true;

    function addToJournal() {
        if (companyName && jobPosition) {
            const jobEntry = { 
                companyName, 
                jobPosition, 
                dateAdded: new Date().toISOString() 
            };
            
            chrome.storage.local.get(['jobJournal'], (result) => {
                const existingEntries = result.jobJournal || [];
                existingEntries.push(jobEntry);
                chrome.storage.local.set({ jobJournal: existingEntries }, () => {
                    resetForm();
                    showPopup = false;
                    alert('Job added to the journal!');
                });
            });
        } else {
            alert('Please fill out all fields.');
        }
    }
    function closePopup() {
        showPopup = false;
    }
    function openPopup() {
        showPopup = true;
    }
    function resetForm() {
        companyName = '';
        jobPosition = '';
    }

    onMount(() => {
        // Initialize storage if needed
        chrome.storage.local.get(['jobJournal'], (result) => {
            if (!result.jobJournal) {
                chrome.storage.local.set({ jobJournal: [] });
            }
        });
    });
</script>

{#if showPopup}
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-50 w-96">
        <h2 class="text-xl font-semibold mb-4">Add Job to Journal</h2>
        <form on:submit|preventDefault={addToJournal} class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">
                    Company Name:
                    <input 
                        type="text" 
                        bind:value={companyName} 
                        placeholder="Enter company name" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700">
                    Job Position:
                    <input 
                        type="text" 
                        bind:value={jobPosition} 
                        placeholder="Enter job position" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </label>
            </div>

            <div class="flex space-x-3">
                <button 
                    type="submit" 
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Add to Journal
                </button>
                <button 
                    type="button" 
                    on:click={closePopup} 
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
{/if}