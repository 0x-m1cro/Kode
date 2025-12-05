import { Page, Locator, expect } from '@playwright/test';
import { TEST_TIMEOUTS, TEST_SELECTORS } from '../fixtures/test-data';

/**
 * Page Object Model for the IDE/Main workspace
 */
export class IDEPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the IDE page
   */
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // ============ WebContainer Methods ============

  /**
   * Get the WebContainer status element
   */
  getStatusElement(): Locator {
    // Look for status text in the header
    return this.page.locator('header').first();
  }

  /**
   * Wait for WebContainer to be ready
   */
  async waitForWebContainerReady(timeout: number = TEST_TIMEOUTS.WEBCONTAINER_BOOT) {
    console.log('Waiting for WebContainer to be ready...');
    
    // Wait for the "Ready" status to appear in the header
    await this.page.waitForSelector('text=/Ready|🟢/', { 
      timeout,
      state: 'visible' 
    });
    
    console.log('✓ WebContainer is ready');
  }

  /**
   * Check if WebContainer is booting
   */
  async isWebContainerBooting(): Promise<boolean> {
    try {
      const bootingText = await this.page.locator('text=/Booting|🟡/').first();
      return await bootingText.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if WebContainer has an error
   */
  async hasWebContainerError(): Promise<boolean> {
    try {
      const errorText = await this.page.locator('text=/Error|Failed|🔴/').first();
      return await errorText.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Get WebContainer status text
   */
  async getWebContainerStatus(): Promise<string> {
    const statusElement = this.getStatusElement();
    return await statusElement.textContent() || '';
  }

  // ============ Chat Methods ============

  /**
   * Get the chat input element
   */
  getChatInput(): Locator {
    return this.page.locator('textarea, input[type="text"]').last();
  }

  /**
   * Get the send button
   */
  getSendButton(): Locator {
    return this.page.locator('button').filter({ hasText: /send/i }).or(
      this.page.locator('button[type="submit"]').last()
    );
  }

  /**
   * Type a message in the chat input
   */
  async typeMessage(message: string) {
    const input = this.getChatInput();
    await input.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.ELEMENT_VISIBLE });
    await input.fill(message);
  }

  /**
   * Send a chat message
   */
  async sendMessage(message: string) {
    await this.typeMessage(message);
    const sendButton = this.getSendButton();
    await sendButton.click();
  }

  /**
   * Wait for chat to be enabled (after WebContainer is ready)
   */
  async waitForChatEnabled() {
    const input = this.getChatInput();
    await expect(input).toBeEnabled({ timeout: TEST_TIMEOUTS.WEBCONTAINER_BOOT });
  }

  /**
   * Check if chat input is enabled
   */
  async isChatEnabled(): Promise<boolean> {
    try {
      const input = this.getChatInput();
      return await input.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get all chat messages
   */
  async getChatMessages(): Promise<string[]> {
    // Wait a bit for messages to render
    await this.page.waitForTimeout(500);
    
    // Look for message containers - matches ChatPanel.tsx structure
    // Messages are in divs with either bg-blue-600 (user) or bg-gray-100 (assistant)
    const messageContainers = this.page.locator('div.rounded-lg.px-4.py-2').filter({
      has: this.page.locator('.whitespace-pre-wrap')
    });
    
    // Get text content from each message
    const count = await messageContainers.count();
    const messages: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const contentDiv = messageContainers.nth(i).locator('.whitespace-pre-wrap');
      const text = await contentDiv.textContent();
      if (text && text.trim().length > 0) {
        messages.push(text.trim());
      }
    }
    
    return messages;
  }

  /**
   * Wait for a response from the AI
   */
  async waitForAIResponse(timeout: number = TEST_TIMEOUTS.AI_RESPONSE) {
    // Wait for loading indicator to disappear
    await this.page.waitForSelector('[class*="loading"], [class*="spinner"]', {
      state: 'detached',
      timeout,
    }).catch(() => {
      // If no loading indicator found, that's okay
      console.log('No loading indicator found or already gone');
    });
    
    // Wait a bit for the response to be rendered
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if loading indicator is visible
   */
  async isLoading(): Promise<boolean> {
    try {
      const loader = this.page.locator('[class*="loading"], [class*="spinner"], [class*="animate-spin"]').first();
      return await loader.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  // ============ Editor Methods ============

  /**
   * Get Monaco editor element
   */
  getMonacoEditor(): Locator {
    return this.page.locator('.monaco-editor').first();
  }

  /**
   * Check if Monaco editor is visible
   */
  async isEditorVisible(): Promise<boolean> {
    try {
      const editor = this.getMonacoEditor();
      return await editor.isVisible({ timeout: TEST_TIMEOUTS.ELEMENT_VISIBLE });
    } catch {
      return false;
    }
  }

  /**
   * Wait for Monaco editor to load
   */
  async waitForEditorLoad() {
    await this.page.waitForSelector('.monaco-editor', { 
      timeout: TEST_TIMEOUTS.ELEMENT_VISIBLE 
    });
    
    // Wait for editor content to be ready
    await this.page.waitForSelector('.view-lines', { 
      timeout: TEST_TIMEOUTS.ELEMENT_VISIBLE 
    });
  }

  /**
   * Get editor content (if visible)
   */
  async getEditorContent(): Promise<string> {
    const contentElement = this.page.locator('.view-lines');
    return await contentElement.textContent() || '';
  }

  // ============ Settings Methods ============

  /**
   * Open settings modal
   */
  async openSettings() {
    // Look for settings button with icon or text
    const settingsButton = this.page.locator('button').filter({ 
      has: this.page.locator('svg, [class*="settings"], [class*="Settings"]') 
    }).first();
    
    await settingsButton.click();
  }

  /**
   * Check if settings modal is open
   */
  async isSettingsModalOpen(): Promise<boolean> {
    try {
      // Look for modal or dialog
      const modal = this.page.locator('[role="dialog"], [class*="modal"]').first();
      return await modal.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Close settings modal
   */
  async closeSettings() {
    // Look for close button or click outside modal
    const closeButton = this.page.locator('button').filter({ hasText: /close|×/i }).first();
    
    try {
      await closeButton.click({ timeout: 2000 });
    } catch {
      // If no close button, press Escape
      await this.page.keyboard.press('Escape');
    }
  }

  // ============ Utility Methods ============

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle', { timeout: TEST_TIMEOUTS.NAVIGATION });
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
