<script>
    import { onMount } from 'svelte';

    let companyName = '';
    let jobPosition = '';
    let showPopup = true;

    function addToJournal() {
        if (companyName && jobPosition) {
            const jobEntry = { companyName, jobPosition, dateAdded: new Date().toISOString() };
            const existingEntries = JSON.parse(localStorage.getItem('jobJournal') || '[]');
            existingEntries.push(jobEntry);
            localStorage.setItem('jobJournal', JSON.stringify(existingEntries));
            resetForm();
            showPopup = false;
            alert('Job added to the journal!');
        } else {
            alert('Please fill out all fields.');
        }
    }

    function resetForm() {
        companyName = '';
        jobPosition = '';
    }

    onMount(() => {
        // Optional: Initialize local storage if not already set
        if (!localStorage.getItem('jobJournal')) {
            localStorage.setItem('jobJournal', JSON.stringify([]));
        }
    });
</script>

{#if showPopup}
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-50">
        <h2 class="text-xl font-semibold mb-4">Add Job to Journal</h2>
        <form on:submit|preventDefault={addToJournal}>
            <label class="block mb-2">
                <span class="block text-sm font-medium">Company Name:</span>
                <input 
                    type="text" 
                    bind:value={companyName} 
                    placeholder="Enter company name" 
                    class="w-full p-2 mt-1 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>
            <label class="block mb-2">
                <span class="block text-sm font-medium">Job Position:</span>
                <input 
                    type="text" 
                    bind:value={jobPosition} 
                    placeholder="Enter job position" 
                    class="w-full p-2 mt-1 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </label>
            <div class="flex space-x-3">
                <button 
                    type="submit" 
                    class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    Add to Journal
                </button>
                <button 
                    type="button" 
                    on:click={() => (showPopup = false)} 
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
{/if}

<style lang="postcss">
    @reference "tailwindcss";

</style>