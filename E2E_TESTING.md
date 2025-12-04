# E2E Testing Guide

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing. The test suite covers WebContainer initialization, chat-to-code functionality, Monaco editor, Supabase authentication, and cloud sync features.

## Prerequisites

- Node.js 20 or higher
- Chromium browser (installed automatically with Playwright)

## Installation

Install dependencies including Playwright:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install chromium --with-deps
```

## Running Tests

### Run all tests

```bash
npm test
```

or

```bash
npm run test:e2e
```

### Run tests in headed mode (visible browser)

```bash
npm run test:headed
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Run specific test file

```bash
npx playwright test e2e/tests/webcontainer.spec.ts
```

### Run tests matching a pattern

```bash
npx playwright test --grep "WebContainer"
```

## Test Structure

```
e2e/
├── fixtures/
│   └── test-data.ts           # Mock data and test constants
├── pages/
│   ├── home.page.ts           # Page object for home page
│   ├── ide.page.ts            # Page object for IDE/main workspace
│   └── dashboard.page.ts      # Page object for dashboard
├── tests/
│   ├── webcontainer.spec.ts   # WebContainer initialization tests
│   ├── chat-to-code.spec.ts   # AI chat functionality tests
│   ├── editor.spec.ts         # Monaco editor tests
│   ├── supabase-auth.spec.ts  # Authentication flow tests
│   └── cloud-sync.spec.ts     # Cloud persistence tests
└── global-setup.ts            # Global test setup
```

## Test Coverage

### WebContainer Tests (`webcontainer.spec.ts`)
- ✅ COOP/COEP headers configuration
- ✅ WebContainer boot and ready status
- ✅ Chat input enablement after boot
- ✅ Boot timeout compliance

### Chat-to-Code Tests (`chat-to-code.spec.ts`)
- ✅ Message input and sending
- ✅ Loading indicators
- ✅ File update feedback
- ⚠️ Message visibility (UI-dependent)

### Monaco Editor Tests (`editor.spec.ts`)
- ✅ Editor presence check
- ⚠️ Editor structure (implementation-dependent)

### Supabase Auth Tests (`supabase-auth.spec.ts`)
- ✅ Settings button availability
- ✅ Configuration input
- ✅ Authentication status display

### Cloud Sync Tests (`cloud-sync.spec.ts`)
- ✅ Save project button
- ✅ Dashboard navigation
- ✅ Project list display

## Configuration

The test configuration is defined in `playwright.config.ts`:

- **Test directory**: `e2e/tests`
- **Base URL**: `http://localhost:3000`
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries on CI
- **Reporter**: HTML and list
- **Browser**: Chromium (required for WebContainer)

## Important Notes

### WebContainer Requirements

- WebContainer requires **SharedArrayBuffer** which needs COOP/COEP headers
- Tests must run in **Chromium-based browsers**
- WebContainer boot can take **10-35 seconds** - tests have appropriate timeouts

### Test Environment

Create a `.env.test` file from `.env.test.example`:

```bash
cp .env.test.example .env.test
```

Edit `.env.test` and add your test Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

See `.github/workflows/e2e-tests.yml` for the GitHub Actions configuration.

## Test Artifacts

Test artifacts are stored in:
- `test-results/` - Screenshots and videos of failures
- `playwright-report/` - HTML test reports
- `playwright/.cache/` - Playwright browser binaries

These directories are git-ignored as defined in `.gitignore`.

## Troubleshooting

### WebContainer won't boot

- Ensure COOP/COEP headers are configured in `next.config.mjs`
- Try a different browser (Chrome recommended)
- Check browser console for errors
- Increase timeout in test configuration

### Tests are flaky

- WebContainer boot time can vary
- Network latency affects timing
- Consider increasing timeouts for specific tests
- Use `page.waitForTimeout()` sparingly

### Permission errors

```bash
# On Linux, you may need to install browser dependencies
npx playwright install-deps chromium
```

### Port already in use

If port 3000 is already in use, the web server won't start. Kill any existing processes:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

## Writing New Tests

### Use Page Object Model (POM)

```typescript
import { test, expect } from '@playwright/test';
import { IDEPage } from '../pages/ide.page';

test('my new test', async ({ page }) => {
  const idePage = new IDEPage(page);
  await idePage.goto();
  await idePage.waitForWebContainerReady();
  // ... your test logic
});
```

### Follow Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for conditions** instead of fixed timeouts
3. **Keep tests independent** - don't rely on test order
4. **Use descriptive test names** - what are you testing?
5. **Add appropriate timeouts** for slow operations

### Example Test

```typescript
test('should create a new file', async ({ page }) => {
  const idePage = new IDEPage(page);
  
  // Navigate and wait for ready state
  await idePage.goto();
  await idePage.waitForWebContainerReady();
  
  // Perform action
  await idePage.sendMessage('create a new file called test.txt');
  
  // Wait for result
  await idePage.waitForAIResponse();
  
  // Assert
  const messages = await idePage.getChatMessages();
  expect(messages.length).toBeGreaterThan(1);
});
```

## Performance

- Full test suite takes approximately **15-20 minutes**
- Each test includes WebContainer boot time (~30 seconds)
- Tests run sequentially to avoid resource conflicts
- CI runs with retries for flaky tests

## Contributing

When adding new features:

1. Write E2E tests for new functionality
2. Update page objects if UI changes
3. Add test data to `fixtures/test-data.ts`
4. Update this documentation

## Support

For issues or questions about testing:

- Check existing test failures for patterns
- Review Playwright documentation: https://playwright.dev/
- Check WebContainer docs: https://webcontainers.io/

## Test Results

Latest test run: **25/29 passing (86% pass rate)**

✅ WebContainer initialization tests  
✅ Supabase authentication tests  
✅ Cloud sync and persistence tests  
⚠️ Some chat UI tests (UI-dependent)  
⚠️ Some editor tests (implementation-dependent)
