"use strict";
//handles data storage
console.log("BACKGROUND SCRIPT LOADED - TEST"); // This should show in the background page console
// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if message is a new listing
    if (message.type === 'NEW_LISTING') {
        handleNewListing(message.data);
    }
});
// Handle storing new listing data
async function handleNewListing(listingData) {
    try {
        // Get currently stored listings from Chrome storage
        const result = await chrome.storage.local.get('listings');
        const listings = result.listings || [];
        // Add new listing with additional metadata
        listings.push({
            ...listingData,
            capturedAt: new Date().toISOString(),
            crossPosted: false // Track if it's been posted elsewhere
        });
        // Save updated listings back to Chrome storage
        await chrome.storage.local.set({ listings });
        // Log success for debugging
        console.log('Listing saved:', listingData);
    }
    catch (error) {
        // Log any errors that occur during storage
        console.error('Error saving listing:', error);
    }
}
