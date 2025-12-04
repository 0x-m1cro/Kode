import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Verify that the server is ready
  const baseURL = config.webServer?.url || 'http://localhost:3000';
  console.log(`✓ Server URL: ${baseURL}`);
  
  // Launch a browser to verify basic functionality
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the home page to warm up the server
    await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✓ Home page loaded successfully');
  } catch (error) {
    console.error('✗ Failed to load home page:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✓ Global setup completed successfully\n');
}

export default globalSetup;
