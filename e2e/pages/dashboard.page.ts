import { Page, Locator, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from '../fixtures/test-data';

/**
 * Page Object Model for the Dashboard page
 */
export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the dashboard
   */
  async goto() {
    await this.page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Wait for the dashboard to load
   */
  async waitForLoad() {
    await this.page.waitForSelector('body', { timeout: TEST_TIMEOUTS.NAVIGATION });
  }

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get all project items
   */
  getProjectItems(): Locator {
    // Look for project list items - adjust selector based on actual implementation
    return this.page.locator('[data-testid="project-item"], [class*="project"]');
  }

  /**
   * Get project list
   */
  getProjectList(): Locator {
    return this.page.locator('[data-testid="project-list"], [class*="project-list"]').first();
  }

  /**
   * Check if projects are loaded
   */
  async areProjectsLoaded(): Promise<boolean> {
    try {
      // Wait for either projects or empty state
      await Promise.race([
        this.page.waitForSelector('[data-testid="project-item"]', { timeout: 5000 }),
        this.page.waitForSelector('text=/no projects|empty/i', { timeout: 5000 }),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get number of projects
   */
  async getProjectCount(): Promise<number> {
    const projects = this.getProjectItems();
    return await projects.count();
  }

  /**
   * Click on a project by index
   */
  async openProject(index: number = 0) {
    const projects = this.getProjectItems();
    await projects.nth(index).click();
  }

  /**
   * Click on a project by name
   */
  async openProjectByName(name: string) {
    const project = this.page.locator(`text="${name}"`).first();
    await project.click();
  }

  /**
   * Check if "new project" button exists
   */
  async hasNewProjectButton(): Promise<boolean> {
    try {
      const newButton = this.page.locator('button, a').filter({ hasText: /new|create/i }).first();
      return await newButton.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Click new project button
   */
  async clickNewProject() {
    const newButton = this.page.locator('button, a').filter({ hasText: /new|create/i }).first();
    await newButton.click();
  }

  /**
   * Check if authentication is required
   */
  async isAuthRequired(): Promise<boolean> {
    try {
      // Look for sign in or login text
      const authText = this.page.locator('text=/sign in|log in|authenticate/i').first();
      return await authText.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/${name}.png`, 
      fullPage: true 
    });
  }
}
