"use strict";
//handles data storage
let currentListingId = null;
// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background script received message:', message);
    if (message.type === 'NEW_LISTING') {
        handleListingUpdate(message.data);
        sendResponse({ status: 'received' });
    }
});
async function handleListingUpdate(listingData) {
    try {
        // If no currentListingId exists, create a new one
        if (!currentListingId) {
            currentListingId = generateListingId();
            console.log('Created new listing ID:', currentListingId);
        }
        // Update existing listing data
        const enhancedListing = {
            ...listingData,
            id: currentListingId,
            lastUpdated: new Date().toISOString(),
            status: {
                facebook: 'pending',
                ebay: 'pending'
            }
        };
        await chrome.storage.local.set({
            currentListing: enhancedListing
        });
        console.log('Listing updated:', enhancedListing);
    }
    catch (error) {
        console.error('Error updating listing:', error);
    }
}
function generateListingId() {
    return 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
// Reset currentListingId when navigating away from create page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && !changeInfo.url.includes('/products/create')) {
        currentListingId = null;
        console.log('Reset listing ID - left create page');
    }
});
console.log('Background script loaded');
