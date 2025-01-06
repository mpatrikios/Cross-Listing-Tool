// import puppeteer from 'puppeteer';

import puppeteer from "puppeteer";

// Interface for login credentials and platform settings
interface PlatformConfig {
    username: string;
    password: string;
    // Can add more platform-specific settings here
}

// Base class that all platform automations will extend
class BaseAutomation {
    // Declare but don't initialize browser and page
    protected browser: puppeteer.Browser;  // The Chrome browser instance
    protected page: puppeteer.Page;        // The current page we're working with

    constructor(protected config: PlatformConfig) {
        // Store configuration for use in child classes
    }

    // Initialize browser and create new page
    async init() {
        // Launch browser with specific settings
        this.browser = await puppeteer.launch({
            headless: false,     // Show browser while running (good for testing)
            defaultViewport: null, // Use default viewport size
            args: ['--start-maximized'], // Start with maximized window
            slowMo: 50  // Add delay between actions (helpful during testing)
        });
        
        // Create new page/tab
        this.page = await this.browser.newPage();
        
        // Optional: Set default navigation timeout
        this.page.setDefaultNavigationTimeout(30000); // 30 seconds
    }

    // Helper method to handle loading delays
    protected async waitForLoad(delay = 2000) {
        await this.page.waitForTimeout(delay);
    }

    // Helper method for typing text with random delays (more human-like)
    protected async typeWithDelay(selector: string, text: string) {
        await this.page.type(selector, text, {
            delay: Math.random() * 100 + 50 // Random delay between keystrokes
        });
    }

    // Clean up by closing browser
    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export { BaseAutomation, PlatformConfig };