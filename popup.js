document.addEventListener('DOMContentLoaded', () => {
  const inputCapture = document.getElementById('input-capture');
  const btnOpenDashboard = document.getElementById('btn-open-dashboard');
  let theme = 'light';

  // Apply theme to document
  function applyTheme(themeValue) {
    document.documentElement.setAttribute('data-theme', themeValue);
  }

  // Load and apply theme on launch
  async function initTheme() {
    try {
      const data = await chrome.storage.local.get('theme');
      if (data.theme) {
        theme = data.theme;
      } else {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      applyTheme(theme);
    } catch (err) {
      console.error('Failed to load theme:', err);
    }
  }

  initTheme();

  // Input listener for quick task capture
  inputCapture.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const text = inputCapture.value.trim();
      if (text) {
        try {
          // Fetch existing tasks
          const data = await chrome.storage.local.get('tasks');
          const tasks = data.tasks || [];
          
          // Append new task to inbox
          const newTask = {
            id: crypto.randomUUID(),
            text,
            notes: '',
            subtasks: [],
            projectId: null, // Always goes to Inbox
            completed: false,
            createdAt: Date.now()
          };
          tasks.push(newTask);
          
          // Save and clear input for next task
          await chrome.storage.local.set({ tasks });
          inputCapture.value = '';
        } catch (err) {
          console.error('Failed to capture task:', err);
        }
      }
    }
  });

  // Open Dashboard in a new tab
  btnOpenDashboard.addEventListener('click', () => {
    try {
      chrome.tabs.create({ url: 'dashboard.html' });
      window.close();
    } catch (err) {
      console.error('Failed to open dashboard:', err);
    }
  });
});
