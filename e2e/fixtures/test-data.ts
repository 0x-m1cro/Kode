/**
 * Mock data and test constants for E2E tests
 */

export const TEST_TIMEOUTS = {
  WEBCONTAINER_BOOT: 35000, // 35 seconds for WebContainer to boot
  NAVIGATION: 10000, // 10 seconds for page navigation
  AI_RESPONSE: 15000, // 15 seconds for AI to respond
  FILE_OPERATION: 5000, // 5 seconds for file operations
  ELEMENT_VISIBLE: 5000, // 5 seconds for elements to appear
};

export const TEST_MESSAGES = {
  SIMPLE_GREETING: 'Hello',
  CREATE_COMPONENT: 'create a simple button component',
  CREATE_FILE: 'create a new file called test.txt with content "Hello World"',
  HELP_REQUEST: 'help me build a todo app',
};

export const EXPECTED_RESPONSES = {
  GREETING: 'hello',
  COMPONENT_CREATED: 'component',
  FILE_CREATED: 'file',
};

export const TEST_SELECTORS = {
  // WebContainer status
  STATUS_INDICATOR: '[data-testid="webcontainer-status"]',
  STATUS_READY: 'text=/Ready|🟢/',
  STATUS_BOOTING: 'text=/Booting|🟡/',
  STATUS_ERROR: 'text=/Error|🔴/',
  
  // Chat panel
  CHAT_PANEL: '[data-testid="chat-panel"]',
  CHAT_INPUT: '[data-testid="chat-input"]',
  CHAT_SEND_BUTTON: '[data-testid="chat-send-button"]',
  CHAT_MESSAGE: '[data-testid="chat-message"]',
  CHAT_LOADING: '[data-testid="chat-loading"]',
  USER_MESSAGE: '[data-testid="user-message"]',
  ASSISTANT_MESSAGE: '[data-testid="assistant-message"]',
  
  // Editor
  MONACO_EDITOR: '.monaco-editor',
  EDITOR_CONTENT: '.view-lines',
  
  // Supabase settings
  SETTINGS_BUTTON: '[data-testid="settings-button"]',
  SETTINGS_MODAL: '[data-testid="settings-modal"]',
  SUPABASE_URL_INPUT: '[data-testid="supabase-url-input"]',
  SUPABASE_KEY_INPUT: '[data-testid="supabase-key-input"]',
  SETTINGS_SAVE_BUTTON: '[data-testid="settings-save-button"]',
  
  // Cloud sync
  SAVE_PROJECT_BUTTON: '[data-testid="save-project-button"]',
  PROJECT_LIST: '[data-testid="project-list"]',
  PROJECT_ITEM: '[data-testid="project-item"]',
};

export const MOCK_SUPABASE_CONFIG = {
  url: 'https://test.supabase.co',
  anonKey: 'test-anon-key-for-testing',
};

export const MOCK_PROJECT_DATA = {
  name: 'test-project',
  description: 'A test project for E2E testing',
  files: {
    'package.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
    }, null, 2),
    'README.md': '# Test Project\n\nThis is a test project.',
  },
};

// Mock AI responses for deterministic testing
export const MOCK_AI_RESPONSES = {
  greeting: {
    content: "Hello! I'm your AI coding assistant. I can help you build applications, create components, and write code. What would you like to build?",
    fileChanges: [],
  },
  createComponent: {
    content: "I've created a Button component for you. Here it is:",
    fileChanges: [
      {
        path: '/components/Button.tsx',
        content: `export default function Button() {
  return <button>Click me</button>;
}`,
      },
    ],
  },
  createFile: {
    content: "I've created the file test.txt with your content.",
    fileChanges: [
      {
        path: '/test.txt',
        content: 'Hello World',
      },
    ],
  },
};

// Browser headers needed for WebContainer (SharedArrayBuffer support)
export const REQUIRED_HEADERS = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
};
