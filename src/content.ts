
interface DepopListing {
    title?: string;        
    description: string;   
    price: number;         
    images: string[];      
    condition: string;     
    size: string;        
    category: string;      
}

class DepopListingCapture {
    private observer: MutationObserver;
    private lastUpdate: number = 0; // To prevent too frequent updates
    private updateDelay: number = 500; // Milliseconds to wait between updates

    private readonly selectors = {
        description: '[data-testid="description__input"]', //works
        price: '[data-testid="price__input"]', //works
        size: '[data-testid="createProductSizes__sizeRow0__size"]', // works
        images: 'img[alt="Uploaded Product"][src^="blob:"]',
        condition: '[data-testid="listingSelect__listing__condition"]', //works
        category: '[data-testid="listingCategories__category"]' //works
    };

    constructor() {
        console.log('DepopListingCapture initialized');
        // Set up observer for DOM changes
        this.observer = new MutationObserver(this.handleDOMChanges.bind(this));
        this.startObserving();
        // Add input event listeners
        this.setupInputListeners();
    }

    private startObserving(): void {
        console.log('Started observing DOM');
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    // Set up listeners for all form inputs
    private setupInputListeners(): void {
        if (!window.location.href.includes('/products/create')) {
            return;
        }

        // Watch for any input changes
        document.addEventListener('input', (event) => {
            const target = event.target as HTMLElement;
            if (this.isFormElement(target)) {
                this.throttledCapture();
            }
        });

        // Watch for changes in dropdowns and selects
        document.addEventListener('change', (event) => {
            const target = event.target as HTMLElement;
            if (this.isFormElement(target)) {
                this.throttledCapture();
            }
        });
    }

    // Check if element is a form input
    private isFormElement(element: HTMLElement): boolean {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.tagName === 'SELECT';
    }

    // Throttle updates to prevent too frequent captures
    private throttledCapture(): void {
        const now = Date.now();
        if (now - this.lastUpdate >= this.updateDelay) {
            this.lastUpdate = now;
            this.captureListing();
        }
    }

    private handleDOMChanges(mutations: MutationRecord[]): void {
        if (!window.location.href.includes('/products/create')) {
            return;
        }
    
        // Check if mutations affect our target elements
        const relevantChange = mutations.some(mutation => {
            const target = mutation.target as HTMLElement;
            // Updated to use new image selector
            return this.isFormElement(target) || 
                   target.querySelector('img[alt="Uploaded Product"][src^="blob:"]');
        });
    
        if (relevantChange) {
            this.throttledCapture();
        }
    }

    // Add a method to handle select values specifically
private getSelectValue(selector: string): string {
    // Try multiple approaches to get the selected value
    const element = document.querySelector(selector);
    if (!element) return '';

    // Try different ways to get the value
    const approaches = [
        // Try to get the visible text
        () => element.querySelector('.select__single-value')?.textContent,
        // Try to get the actual select value
        () => (element as HTMLSelectElement).value,
        // Try to get aria-selected option
        () => element.querySelector('[aria-selected="true"]')?.textContent,
        // Try to get data value attribute
        () => element.getAttribute('data-value')
    ];

    for (const approach of approaches) {
        const value = approach();
        if (value) return value;
    }

    return '';
}

private async captureListing(): Promise<void> {
    try {
        console.log('Attempting to capture listing data including images...');
        
        // Try to capture images first
        const capturedImages = this.captureImages();
        console.log('Captured images result:', capturedImages);
    } catch (error) {
        console.error('❌ Error capturing images:', error);
    }

    try {
        const listing: DepopListing = {
            title: document.querySelector<HTMLInputElement>('[name="title"]')?.value || '',
            description: document.querySelector<HTMLTextAreaElement>(this.selectors.description)?.value || '',
            price: parseFloat(document.querySelector<HTMLInputElement>(this.selectors.price)?.value || '0'),
            images: this.captureImages(),
            // Use the new method for selects
            condition: this.getSelectValue(this.selectors.condition),
            size: this.getSelectValue(this.selectors.size),
            category: this.getSelectValue(this.selectors.category)
        };

        console.log('📦 Current listing data:', listing);
    
        chrome.runtime.sendMessage({
            type: 'NEW_LISTING',
            data: listing
        });
    } catch (error) {
        console.error('❌ Error capturing listing:', error);
    }
}

private captureImages(): string[] {
    console.log('Starting image capture...');
    
    // Using the new selector that looks for blob URLs
    const imageElements = document.querySelectorAll('img[alt="Uploaded Product"][src^="blob:"]');
    console.log('Found image elements:', imageElements);

    const images = Array.from(imageElements)
        .map(img => {
            const src = (img as HTMLImageElement).src;
            console.log('Image source found:', src);
            return src;
        })
        .filter(src => src && src.startsWith('blob:'));

    console.log('Final captured images:', images);
    return images;
}

}

console.log('Content script loaded');
new DepopListingCapture();