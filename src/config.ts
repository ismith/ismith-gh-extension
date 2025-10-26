// Shared configuration types and utilities

export interface Config {
  filtersEnabled: boolean;
  annotations: {
    mine: { enabled: boolean; color: string };
    reviewed: { enabled: boolean; color: string };
    mentioned: { enabled: boolean; color: string };
    draft: { enabled: boolean };
  };
}

export const DEFAULT_CONFIG: Config = {
  filtersEnabled: true,
  annotations: {
    mine: { enabled: true, color: '#0969da' },
    reviewed: { enabled: true, color: '#1a7f37' },
    mentioned: { enabled: true, color: '#ffbb00' },
    draft: { enabled: true }
  }
};

// Load config asynchronously from chrome.storage.sync
// Note: chrome.storage API is compatible with Firefox WebExtensions
export async function loadConfig(): Promise<Config> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['gh-extension-config'], (result) => {
      if (result['gh-extension-config']) {
        resolve(result['gh-extension-config']);
      } else {
        resolve(DEFAULT_CONFIG);
      }
    });
  });
}

// Save config to chrome.storage.sync
// Note: chrome.storage API is compatible with Firefox WebExtensions
export function saveConfig(config: Config): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ 'gh-extension-config': config }, () => {
      resolve();
    });
  });
}
