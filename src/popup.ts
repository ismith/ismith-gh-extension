// Popup script for configuration

import { Config, loadConfig, saveConfig as saveConfigToStorage } from './config';

// Save config and notify content scripts
async function saveConfig(config: Config) {
  // Save to storage
  await saveConfigToStorage(config);

  // Notify content scripts of config change
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url?.includes('github.com')) {
        chrome.tabs.sendMessage(tab.id, { type: 'config-updated', config });
      }
    });
  });
}

// Load version info
async function loadVersionInfo() {
  try {
    const response = await fetch(chrome.runtime.getURL('version.json'));
    const versionInfo = await response.json();

    document.getElementById('version-commit')!.textContent = versionInfo.commit;
    document.getElementById('version-commit-time')!.textContent = versionInfo.commitTime;
    document.getElementById('version-build-time')!.textContent = versionInfo.buildTime;
  } catch (e) {
    console.error('Failed to load version info:', e);
  }
}

// Load GitHub styles from the active tab
async function loadGitHubStyles() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.includes('github.com')) {
      return; // Not on GitHub, use defaults
    }

    // Execute script in the GitHub tab to get computed styles
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const body = document.body;
        const bodyStyles = window.getComputedStyle(body);

        // Try to find a button or input to get their styles
        const button = document.querySelector('button, .btn') as HTMLElement;
        const input = document.querySelector('input[type="text"], input[type="search"]') as HTMLElement;

        const buttonStyles = button ? window.getComputedStyle(button) : null;
        const inputStyles = input ? window.getComputedStyle(input) : null;

        return {
          bgColor: bodyStyles.backgroundColor,
          fgColor: bodyStyles.color,
          fontFamily: bodyStyles.fontFamily,
          borderColor: inputStyles?.borderColor || bodyStyles.borderColor || 'rgb(208, 215, 222)',
          buttonBg: buttonStyles?.backgroundColor || 'rgb(246, 248, 250)',
          buttonBorder: buttonStyles?.borderColor || 'rgb(208, 215, 222)',
          inputBg: inputStyles?.backgroundColor || bodyStyles.backgroundColor,
          secondaryFg: 'rgba(from ' + bodyStyles.color + ' r g b / 0.6)' // 60% opacity of main color
        };
      }
    });

    if (results?.[0]?.result) {
      const styles = results[0].result;
      const root = document.documentElement;

      // Set CSS custom properties
      root.style.setProperty('--gh-bg-color', styles.bgColor);
      root.style.setProperty('--gh-fg-color', styles.fgColor);
      root.style.setProperty('--gh-font-family', styles.fontFamily);
      root.style.setProperty('--gh-border-color', styles.borderColor);
      root.style.setProperty('--gh-secondary-bg', styles.buttonBg);

      // Calculate a slightly muted version of the foreground color for secondary text
      // We'll just use opacity for this
      const fgMatch = styles.fgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (fgMatch) {
        const [_, r, g, b] = fgMatch;
        root.style.setProperty('--gh-secondary-fg', `rgba(${r}, ${g}, ${b}, 0.6)`);
      }
    }
  } catch (e) {
    console.error('Failed to load GitHub styles:', e);
    // Silently fail and use defaults
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load GitHub styles first
  await loadGitHubStyles();
  const config = await loadConfig();

  // Load version info
  loadVersionInfo();

  // Set checkbox states
  (document.getElementById('filters-enabled') as HTMLInputElement).checked = config.filtersEnabled;
  (document.getElementById('annotation-mine') as HTMLInputElement).checked = config.annotations.mine.enabled;
  (document.getElementById('annotation-reviewed') as HTMLInputElement).checked = config.annotations.reviewed.enabled;
  (document.getElementById('annotation-mentioned') as HTMLInputElement).checked = config.annotations.mentioned.enabled;
  (document.getElementById('annotation-draft') as HTMLInputElement).checked = config.annotations.draft.enabled;

  // Set color values and previews
  (document.getElementById('color-mine') as HTMLInputElement).value = config.annotations.mine.color;
  (document.getElementById('color-reviewed') as HTMLInputElement).value = config.annotations.reviewed.color;
  (document.getElementById('color-mentioned') as HTMLInputElement).value = config.annotations.mentioned.color;

  // Set preview box colors
  document.getElementById('preview-mine')!.style.backgroundColor = config.annotations.mine.color;
  document.getElementById('preview-reviewed')!.style.backgroundColor = config.annotations.reviewed.color;
  document.getElementById('preview-mentioned')!.style.backgroundColor = config.annotations.mentioned.color;

  // Filters enabled checkbox
  document.getElementById('filters-enabled')!.addEventListener('change', (e) => {
    config.filtersEnabled = (e.target as HTMLInputElement).checked;
    saveConfig(config);
  });

  // Annotation checkboxes
  document.getElementById('annotation-mine')!.addEventListener('change', (e) => {
    config.annotations.mine.enabled = (e.target as HTMLInputElement).checked;
    saveConfig(config);
  });

  document.getElementById('annotation-reviewed')!.addEventListener('change', (e) => {
    config.annotations.reviewed.enabled = (e.target as HTMLInputElement).checked;
    saveConfig(config);
  });

  document.getElementById('annotation-mentioned')!.addEventListener('change', (e) => {
    config.annotations.mentioned.enabled = (e.target as HTMLInputElement).checked;
    saveConfig(config);
  });

  document.getElementById('annotation-draft')!.addEventListener('change', (e) => {
    config.annotations.draft.enabled = (e.target as HTMLInputElement).checked;
    saveConfig(config);
  });

  // Color inputs
  document.getElementById('color-mine')!.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    document.getElementById('preview-mine')!.style.backgroundColor = value;
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      config.annotations.mine.color = value;
      saveConfig(config);
    }
  });

  document.getElementById('color-reviewed')!.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    document.getElementById('preview-reviewed')!.style.backgroundColor = value;
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      config.annotations.reviewed.color = value;
      saveConfig(config);
    }
  });

  document.getElementById('color-mentioned')!.addEventListener('input', (e) => {
    const value = (e.target as HTMLInputElement).value;
    document.getElementById('preview-mentioned')!.style.backgroundColor = value;
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      config.annotations.mentioned.color = value;
      saveConfig(config);
    }
  });

  // Reset buttons
  document.querySelectorAll('.reset-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).dataset.target!;
      const defaultColor = (e.target as HTMLElement).dataset.default!;
      const input = document.getElementById(target) as HTMLInputElement;
      input.value = defaultColor;

      // Update preview
      const previewId = target.replace('color-', 'preview-');
      document.getElementById(previewId)!.style.backgroundColor = defaultColor;

      // Update config
      if (target === 'color-mine') {
        config.annotations.mine.color = defaultColor;
      } else if (target === 'color-reviewed') {
        config.annotations.reviewed.color = defaultColor;
      } else if (target === 'color-mentioned') {
        config.annotations.mentioned.color = defaultColor;
      }
      saveConfig(config);
    });
  });

  // Click to copy version values
  document.querySelectorAll('.version-value').forEach(element => {
    element.addEventListener('click', async () => {
      const text = element.textContent || '';
      try {
        await navigator.clipboard.writeText(text);

        // Show "Copied!" feedback
        element.classList.add('copied');
        setTimeout(() => {
          element.classList.remove('copied');
        }, 1500);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });
});
