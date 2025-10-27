// Shared configuration types and utilities

// Annotation type constants for type safety
export enum AnnotationType {
  MINE = 'mine',
  REVIEWED = 'reviewed',
  MENTIONED = 'mentioned',
  DRAFT = 'draft'
}

export interface Config {
  filtersEnabled: boolean;
  annotations: {
    [AnnotationType.MINE]: { enabled: boolean; color: string };
    [AnnotationType.REVIEWED]: { enabled: boolean; color: string };
    [AnnotationType.MENTIONED]: { enabled: boolean; color: string };
    [AnnotationType.DRAFT]: { enabled: boolean };
  };
}

export const DEFAULT_CONFIG: Config = {
  filtersEnabled: true,
  annotations: {
    [AnnotationType.MINE]: { enabled: true, color: '#0969da' },
    [AnnotationType.REVIEWED]: { enabled: true, color: '#1a7f37' },
    [AnnotationType.MENTIONED]: { enabled: true, color: '#ffbb00' },
    [AnnotationType.DRAFT]: { enabled: true }
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
