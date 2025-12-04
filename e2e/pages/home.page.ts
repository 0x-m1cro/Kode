import { Page, Locator, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from '../fixtures/test-data';

/**
 * Page Object Model for the Home/IDE page
 */
export class HomePage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForLoad() {
    // Wait for the main layout to be visible
    await this.page.waitForSelector('body', { timeout: TEST_TIMEOUTS.NAVIGATION });
  }

  /**
   * Check if the page is loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForLoad();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  /**
   * Check for required headers (COOP/COEP for WebContainer)
   */
  async checkRequiredHeaders(): Promise<{ hasCoep: boolean; hasCoop: boolean }> {
    const response = await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    
    if (!response) {
      throw new Error('No response received from server');
    }

    const headers = response.headers();
    const hasCoep = headers['cross-origin-embedder-policy'] === 'require-corp';
    const hasCoop = headers['cross-origin-opener-policy'] === 'same-origin';

    return { hasCoep, hasCoop };
  }

  /**
   * Wait for a specific selector with custom timeout
   */
  async waitForSelector(selector: string, timeout: number = TEST_TIMEOUTS.ELEMENT_VISIBLE) {
    return await this.page.waitForSelector(selector, { timeout });
  }
}
