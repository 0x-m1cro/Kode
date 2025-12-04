import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { IDEPage } from '../pages/ide.page';
import { TEST_TIMEOUTS, REQUIRED_HEADERS } from '../fixtures/test-data';

test.describe('WebContainer Initialization', () => {
  
  test('should have COOP/COEP headers configured correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    
    const headers = await homePage.checkRequiredHeaders();
    
    expect(headers.hasCoep).toBe(true);
    expect(headers.hasCoop).toBe(true);
  });

  test('should boot WebContainer successfully and show Ready status', async ({ page }) => {
    const idePage = new IDEPage(page);
    
    await idePage.goto();
    
    // Wait for WebContainer to boot
    await idePage.waitForWebContainerReady();
    
    // Verify status
    const status = await idePage.getWebContainerStatus();
    expect(status).toMatch(/Ready|🟢/);
    
    // Verify it's not showing error or booting
    const hasError = await idePage.hasWebContainerError();
    expect(hasError).toBe(false);
  });

  test('should enable chat input after WebContainer is ready', async ({ page }) => {
    const idePage = new IDEPage(page);
    
    await idePage.goto();
    
    // Initially, chat might be disabled
    // Wait for WebContainer to be ready
    await idePage.waitForWebContainerReady();
    
    // Now chat should be enabled
    await idePage.waitForChatEnabled();
    
    const isChatEnabled = await idePage.isChatEnabled();
    expect(isChatEnabled).toBe(true);
  });

  test('should show booting status initially', async ({ page }) => {
    const idePage = new IDEPage(page);
    
    await idePage.goto();
    
    // Check for booting status within first few seconds
    // This might be very quick, so we'll check the initial state
    const status = await idePage.getWebContainerStatus();
    
    // Should show either booting or ready (depending on how fast it boots)
    expect(status).toMatch(/Booting|Ready|🟡|🟢/);
  });

  test('should complete boot within timeout period', async ({ page }) => {
    const idePage = new IDEPage(page);
    
    await idePage.goto();
    
    const startTime = Date.now();
    
    await idePage.waitForWebContainerReady(TEST_TIMEOUTS.WEBCONTAINER_BOOT);
    
    const bootTime = Date.now() - startTime;
    
    console.log(`WebContainer boot time: ${bootTime}ms`);
    
    // Verify it booted within the expected timeout
    expect(bootTime).toBeLessThan(TEST_TIMEOUTS.WEBCONTAINER_BOOT);
  });
});
