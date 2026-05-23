// App State
let tasks = [];
let projects = [];
let activeView = 'inbox'; // 'inbox' or project UUID
let activeTaskId = null;
let expandedProjectIds = [];
let apiKey = '';
let apiModel = 'gemini-2.5-flash';
let fetchedModels = [];

// DOM Elements
const inputQuickAdd = document.getElementById('input-quick-add');
const navInbox = document.getElementById('nav-inbox');
const badgeInbox = document.getElementById('badge-inbox');
const projectsTree = document.getElementById('projects-tree');
const inputNewProject = document.getElementById('input-new-project');
const currentViewTitle = document.getElementById('current-view-title');
const taskList = document.getElementById('task-list');
const btnElaborateInbox = document.getElementById('btn-elaborate-inbox');
const btnOrganizeInbox = document.getElementById('btn-organize-inbox');

// Details Panel Elements
const detailsPanel = document.getElementById('details-panel');
const btnCloseDetails = document.getElementById('btn-close-details');
const detailTaskText = document.getElementById('detail-task-text');
const detailTaskProject = document.getElementById('detail-task-project');
const detailTaskNotes = document.getElementById('detail-task-notes');
const detailSubtasksList = document.getElementById('detail-subtasks-list');
const inputNewSubtask = document.getElementById('input-new-subtask');

// Settings Modal Elements
const btnSettings = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const inputApiKey = document.getElementById('input-api-key');
const btnFetchModels = document.getElementById('btn-fetch-models');
const apiKeyStatus = document.getElementById('api-key-status');
const selectModel = document.getElementById('select-model');
const modelDetailsCard = document.getElementById('model-details-card');
const btnSaveSettings = document.getElementById('btn-save-settings');

// Initialize Extension
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  initEventListeners();
  renderApp();
});

// Load state from chrome.storage.local
async function loadState() {
  try {
    const data = await chrome.storage.local.get([
      'tasks',
      'projects',
      'apiKey',
      'apiModel',
      'expandedProjectIds',
      'fetchedModels'
    ]);
    
    tasks = data.tasks || [];
    projects = data.projects || [];
    apiKey = data.apiKey || '';
    apiModel = data.apiModel || 'gemini-2.5-flash';
    expandedProjectIds = data.expandedProjectIds || [];
    fetchedModels = data.fetchedModels || [];
    
    // Set settings values
    inputApiKey.value = apiKey;
    renderModelSelectOptions();
  } catch (err) {
    console.error('Failed to load state:', err);
  }
}

// Save state to chrome.storage.local
async function saveState() {
  try {
    await chrome.storage.local.set({
      tasks,
      projects,
      apiKey,
      apiModel,
      expandedProjectIds,
      fetchedModels
    });
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

// Render entire application
function renderApp() {
  renderSidebar();
  renderTasks();
  renderDetails();
}

// Render sidebar navigation and project tree
function renderSidebar() {
  // Render Inbox badge
  const inboxCount = tasks.filter(t => !t.projectId && !t.completed).length;
  badgeInbox.textContent = inboxCount;
  badgeInbox.style.display = inboxCount > 0 ? 'inline-block' : 'none';

  // Highlight active sidebar items
  if (activeView === 'inbox') {
    navInbox.classList.add('active');
  } else {
    navInbox.classList.remove('active');
  }

  renderProjectsTree();
}

// Render projects recursively
function renderProjectsTree() {
  projectsTree.innerHTML = '';
  const rootProjects = projects.filter(p => !p.parentId);

  if (rootProjects.length === 0) {
    projectsTree.innerHTML = '<div class="help-text" style="padding: 10px 4px; text-align: center;">No projects yet.</div>';
    return;
  }

  rootProjects.forEach(project => {
    projectsTree.appendChild(createProjectNodeDOM(project));
  });
}

// Create project list item and its children DOM elements
function createProjectNodeDOM(project) {
  const nodeEl = document.createElement('div');
  nodeEl.className = 'project-node';
  nodeEl.dataset.id = project.id;

  const itemEl = document.createElement('div');
  itemEl.className = `project-item ${activeView === project.id ? 'active' : ''}`;
  itemEl.addEventListener('click', () => {
    activeView = project.id;
    activeTaskId = null; // Close details when changing projects
    renderApp();
  });

  const children = projects.filter(p => p.parentId === project.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedProjectIds.includes(project.id);

  // Expand / collapse button
  const toggleEl = document.createElement('span');
  toggleEl.className = `project-toggle ${isExpanded ? 'expanded' : ''}`;
  toggleEl.innerHTML = hasChildren ? '▶' : '';
  toggleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleProjectExpanded(project.id);
  });

  const nameEl = document.createElement('span');
  nameEl.className = 'project-name';
  nameEl.textContent = project.name;

  const actionsEl = document.createElement('div');
  actionsEl.className = 'project-actions';
  actionsEl.style.display = 'none';

  // Hover actions setup
  itemEl.addEventListener('mouseenter', () => {
    actionsEl.style.display = 'flex';
  });
  itemEl.addEventListener('mouseleave', () => {
    actionsEl.style.display = 'none';
  });

  // Add child project button
  const btnAddChild = document.createElement('button');
  btnAddChild.className = 'text-button';
  btnAddChild.innerHTML = '+';
  btnAddChild.title = 'Add sub-project';
  btnAddChild.addEventListener('click', (e) => {
    e.stopPropagation();
    showInlineAddSubprojectInput(project.id, childrenContainerEl);
  });

  // Delete project button
  const btnDelete = document.createElement('button');
  btnDelete.className = 'text-button danger';
  btnDelete.innerHTML = '&times;';
  btnDelete.title = 'Delete project';
  btnDelete.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteProject(project.id);
  });

  actionsEl.appendChild(btnAddChild);
  actionsEl.appendChild(btnDelete);

  itemEl.appendChild(toggleEl);
  itemEl.appendChild(nameEl);
  itemEl.appendChild(actionsEl);
  nodeEl.appendChild(itemEl);

  // Children container
  const childrenContainerEl = document.createElement('div');
  childrenContainerEl.className = `project-children ${isExpanded ? '' : 'collapsed'}`;

  children.forEach(child => {
    childrenContainerEl.appendChild(createProjectNodeDOM(child));
  });

  nodeEl.appendChild(childrenContainerEl);
  return nodeEl;
}

// Toggle project folder expand/collapse state
function toggleProjectExpanded(projectId) {
  const index = expandedProjectIds.indexOf(projectId);
  if (index === -1) {
    expandedProjectIds.push(projectId);
  } else {
    expandedProjectIds.splice(index, 1);
  }
  saveState();
  renderApp();
}

// Show inline project input for nesting
function showInlineAddSubprojectInput(parentId, containerEl) {
  // Expand parent project if collapsed
  if (!expandedProjectIds.includes(parentId)) {
    expandedProjectIds.push(parentId);
  }
  
  renderApp(); // Redraw tree to show expanded state
  
  // Find newly rendered container
  const targetContainer = document.querySelector(`.project-node[data-id="${parentId}"] > .project-children`);
  if (!targetContainer) return;
  
  // Remove existing inline inputs if any
  const existingInput = targetContainer.querySelector('.inline-project-input-wrapper');
  if (existingInput) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'inline-project-input-wrapper';
  wrapper.style.padding = '4px 6px';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Sub-project name...';
  input.style.border = 'none';
  input.style.borderBottom = '1px solid var(--text-primary)';
  input.style.background = 'transparent';
  input.style.width = '100%';
  input.style.fontSize = '11px';
  input.style.fontFamily = 'var(--font-family)';
  input.style.outline = 'none';

  wrapper.appendChild(input);
  targetContainer.appendChild(wrapper);
  input.focus();

  const cleanup = () => {
    wrapper.remove();
  };

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const name = input.value.trim();
      if (name) {
        const newProj = {
          id: crypto.randomUUID(),
          name,
          parentId,
          expanded: true
        };
        projects.push(newProj);
        await saveState();
        cleanup();
        renderApp();
      }
    } else if (e.key === 'Escape') {
      cleanup();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(cleanup, 200); // Allow click to execute if any
  });
}

// Delete a project and re-root tasks/children
async function deleteProject(projectId) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  const parentId = proj.parentId || null;

  // Re-parent sub-projects
  projects.forEach(p => {
    if (p.parentId === projectId) {
      p.parentId = parentId;
    }
  });

  // Send tasks back to parent or inbox
  tasks.forEach(t => {
    if (t.projectId === projectId) {
      t.projectId = parentId;
    }
  });

  // Remove project from list
  projects = projects.filter(p => p.id !== projectId);
  
  // Clear from expanded lists
  expandedProjectIds = expandedProjectIds.filter(id => id !== projectId);

  // If active view was this project, switch back
  if (activeView === projectId) {
    activeView = parentId || 'inbox';
  }

  await saveState();
  renderApp();
}

// Render current list of tasks
function renderTasks() {
  taskList.innerHTML = '';
  
  // Set View Title
  if (activeView === 'inbox') {
    currentViewTitle.textContent = 'Inbox';
    const inboxCount = tasks.filter(t => !t.projectId && !t.completed).length;
    if (inboxCount > 0) {
      btnElaborateInbox.classList.remove('hidden');
      btnOrganizeInbox.classList.remove('hidden');
    } else {
      btnElaborateInbox.classList.add('hidden');
      btnOrganizeInbox.classList.add('hidden');
    }
  } else {
    const proj = projects.find(p => p.id === activeView);
    currentViewTitle.textContent = proj ? proj.name : 'Unknown Project';
    btnElaborateInbox.classList.add('hidden');
    btnOrganizeInbox.classList.add('hidden');
  }

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    if (activeView === 'inbox') {
      return !t.projectId;
    } else {
      return t.projectId === activeView;
    }
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<div class="help-text" style="padding: 20px; text-align: center;">No tasks here. Capture something above!</div>';
    return;
  }

  // Sort tasks: uncompleted first, then completed. Newest first within status.
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return b.createdAt - a.createdAt;
  });

  filteredTasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item ${task.completed ? 'completed' : ''} ${activeTaskId === task.id ? 'active' : ''}`;
    taskEl.dataset.id = task.id;

    const mainRow = document.createElement('div');
    mainRow.className = 'task-main-row';

    // Checkbox container
    const cbContainer = document.createElement('div');
    cbContainer.className = 'task-checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async (e) => {
      e.stopPropagation();
      task.completed = checkbox.checked;
      await saveState();
      renderApp();
    });
    cbContainer.appendChild(checkbox);

    // Text container
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.addEventListener('click', () => {
      activeTaskId = task.id;
      renderApp();
    });

    // Hover Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const btnDel = document.createElement('button');
    btnDel.className = 'text-button danger';
    btnDel.textContent = 'Delete';
    btnDel.addEventListener('click', async (e) => {
      e.stopPropagation();
      tasks = tasks.filter(t => t.id !== task.id);
      if (activeTaskId === task.id) {
        activeTaskId = null;
      }
      await saveState();
      renderApp();
    });

    actionsDiv.appendChild(btnDel);

    mainRow.appendChild(cbContainer);
    mainRow.appendChild(textSpan);
    mainRow.appendChild(actionsDiv);
    taskEl.appendChild(mainRow);
    taskList.appendChild(taskEl);
  });
}

// Render task details drawer
function renderDetails() {
  if (!activeTaskId) {
    detailsPanel.classList.add('hidden');
    return;
  }

  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) {
    activeTaskId = null;
    detailsPanel.classList.add('hidden');
    return;
  }

  detailsPanel.classList.remove('hidden');
  
  // Set text values
  detailTaskText.value = task.text;
  detailTaskNotes.value = task.notes || '';

  // Populate Project dropdown
  detailTaskProject.innerHTML = '<option value="inbox">Inbox</option>';
  
  // Sort projects alphabetically to list in dropdown
  const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));
  sortedProjects.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    // Indent sub-projects slightly visually
    let prefix = '';
    let currentParent = p.parentId;
    while (currentParent) {
      prefix += '— ';
      const parent = projects.find(proj => proj.id === currentParent);
      currentParent = parent ? parent.parentId : null;
    }
    option.textContent = prefix + p.name;
    detailTaskProject.appendChild(option);
  });

  detailTaskProject.value = task.projectId || 'inbox';

  // Render subtasks
  detailSubtasksList.innerHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      const subtaskItem = document.createElement('div');
      subtaskItem.className = `subtask-item ${subtask.completed ? 'completed' : ''}`;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'subtask-checkbox';
      cb.checked = subtask.completed;
      cb.addEventListener('change', async () => {
        subtask.completed = cb.checked;
        await saveState();
        renderApp();
      });

      const span = document.createElement('span');
      span.className = 'subtask-text';
      span.textContent = subtask.text;

      const delBtn = document.createElement('span');
      delBtn.className = 'subtask-delete';
      delBtn.innerHTML = '&times;';
      delBtn.addEventListener('click', async () => {
        task.subtasks = task.subtasks.filter(st => st.id !== subtask.id);
        await saveState();
        renderApp();
      });

      subtaskItem.appendChild(cb);
      subtaskItem.appendChild(span);
      subtaskItem.appendChild(delBtn);
      detailSubtasksList.appendChild(subtaskItem);
    });
  } else {
    detailSubtasksList.innerHTML = '<div class="help-text">No subtasks.</div>';
  }
}

// Bind Event Listeners
function initEventListeners() {
  // Capture task
  inputQuickAdd.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const text = inputQuickAdd.value.trim();
      if (text) {
        const newTask = {
          id: crypto.randomUUID(),
          text,
          notes: '',
          subtasks: [],
          projectId: activeView === 'inbox' ? null : activeView,
          completed: false,
          createdAt: Date.now()
        };
        tasks.push(newTask);
        inputQuickAdd.value = '';
        await saveState();
        renderApp();
      }
    }
  });

  // Navigation Items
  navInbox.addEventListener('click', () => {
    activeView = 'inbox';
    activeTaskId = null;
    renderApp();
  });

  // Project Adding
  inputNewProject.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const name = inputNewProject.value.trim();
      if (name) {
        const newProj = {
          id: crypto.randomUUID(),
          name,
          parentId: null,
          expanded: true
        };
        projects.push(newProj);
        inputNewProject.value = '';
        await saveState();
        renderApp();
      }
    }
  });

  // Details drawer closing
  btnCloseDetails.addEventListener('click', () => {
    activeTaskId = null;
    renderApp();
  });

  // Details edits update title
  detailTaskText.addEventListener('input', () => {
    if (activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        task.text = detailTaskText.value;
        // Update list representation dynamically
        const taskRow = document.querySelector(`.task-item[data-id="${task.id}"] .task-text`);
        if (taskRow) taskRow.textContent = task.text;
      }
    }
  });
  detailTaskText.addEventListener('change', async () => {
    await saveState();
  });

  // Details updates project selector
  detailTaskProject.addEventListener('change', async () => {
    if (activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        const val = detailTaskProject.value;
        task.projectId = val === 'inbox' ? null : val;
        await saveState();
        renderApp();
      }
    }
  });

  // Details edits update notes
  detailTaskNotes.addEventListener('input', () => {
    if (activeTaskId) {
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) {
        task.notes = detailTaskNotes.value;
      }
    }
  });
  detailTaskNotes.addEventListener('change', async () => {
    await saveState();
  });

  // Add subtask
  inputNewSubtask.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const text = inputNewSubtask.value.trim();
      if (text && activeTaskId) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
          if (!task.subtasks) task.subtasks = [];
          task.subtasks.push({
            id: crypto.randomUUID(),
            text,
            completed: false
          });
          inputNewSubtask.value = '';
          await saveState();
          renderApp();
        }
      }
    }
  });

  // Settings visibility
  btnSettings.addEventListener('click', showSettings);
  btnCloseSettings.addEventListener('click', hideSettings);
  
  // Fetch Models manually
  btnFetchModels.addEventListener('click', () => {
    fetchModels(inputApiKey.value.trim());
  });

  // Auto-fetch models on API key change
  inputApiKey.addEventListener('change', () => {
    const val = inputApiKey.value.trim();
    if (val.length > 10) {
      fetchModels(val);
    }
  });

  // Update model details card when changing model selection
  selectModel.addEventListener('change', () => {
    renderModelDetailsCard();
  });
  
  // Save settings
  btnSaveSettings.addEventListener('click', async () => {
    apiKey = inputApiKey.value.trim();
    apiModel = selectModel.value;
    await saveState();
    hideSettings();
    alert('Settings saved.');
  });

  // Bulk actions
  btnElaborateInbox.addEventListener('click', () => {
    elaborateInbox();
  });

  btnOrganizeInbox.addEventListener('click', () => {
    organizeInbox();
  });
}

function showSettings() {
  settingsModal.classList.remove('hidden');
  apiKeyStatus.classList.add('hidden'); // Reset status message
  if (apiKey) {
    fetchModels(apiKey);
  } else {
    fetchedModels = [];
    renderModelSelectOptions();
  }
}

function hideSettings() {
  settingsModal.classList.add('hidden');
}

// Clean JSON response from Gemini
function parseGeminiJSON(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  return JSON.parse(cleanText);
}

// AI: Elaborate Task
async function elaborateTask(taskId, btnEl) {
  if (!apiKey) {
    alert('Please set your Gemini API Key in Settings first.');
    showSettings();
    return;
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const originalText = btnEl.textContent;
  btnEl.textContent = 'Elaborating...';
  btnEl.disabled = true;

  const prompt = `You are an expert GTD (Getting Things Done) coach and personal assistant.
The user has created a task: "${task.text}".
Your goal is to elaborate this task, make it highly actionable, add detailed notes/context, and break it down into clear, small, sequential subtasks (to remove friction and procrastination).

You must output your response in JSON format matching this schema:
{
  "elaboratedText": "An actionable, clear rewrite of the task title (keep it under 80 characters, in the same language as the user's input).",
  "notes": "Detailed context, tips, and next steps for the task (in the same language as the user's input).",
  "subtasks": ["subtask 1", "subtask 2", ...] (an array of actionable subtasks in the same language as the user's input).
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(textResponse);

    task.text = result.elaboratedText || task.text;
    task.notes = (task.notes ? task.notes + '\n\n' : '') + (result.notes || '');

    if (result.subtasks && Array.isArray(result.subtasks)) {
      if (!task.subtasks) task.subtasks = [];
      result.subtasks.forEach(stText => {
        task.subtasks.push({
          id: crypto.randomUUID(),
          text: stText,
          completed: false
        });
      });
    }

    await saveState();
    renderApp();
  } catch (err) {
    console.error('Elaboration failed:', err);
    alert('Elaboration failed. Please verify your API key or network connection.');
  } finally {
    btnEl.textContent = originalText;
    btnEl.disabled = false;
  }
}

// AI: Organize Task
async function organizeTask(taskId, btnEl) {
  if (!apiKey) {
    alert('Please set your Gemini API Key in Settings first.');
    showSettings();
    return;
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const originalText = btnEl.textContent;
  btnEl.textContent = 'Organizing...';
  btnEl.disabled = true;

  // Create clean flat representation of projects for prompt
  const simplifiedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    parentId: p.parentId
  }));

  const prompt = `You are a GTD (Getting Things Done) organization engine.
The user has a task: "${task.text}".
Here is the list of existing projects:
${JSON.stringify(simplifiedProjects)}

Your goal is to decide:
1. Does this task fit under one of the existing projects? If so, select the most appropriate existing project ID.
2. If it does not fit any existing project, should we create a new project? If so, specify the new project name. Also, should it be a sub-project (nested under an existing project as a child)? If so, specify the parent project ID.

You must output your response in JSON format matching this schema:
{
  "projectId": "existing-project-uuid" (or "new" if we should create a new project, or null if it should remain in the Inbox),
  "newProjectName": "Name of the new project to create (only if projectId is 'new', in the same language as the task)",
  "newProjectParentId": "existing-project-uuid" (if the new project should be nested under an existing project, otherwise null)
}

Do not include any Markdown syntax or extra text. Return ONLY the JSON object.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(textResponse);

    if (result.projectId === 'new' && result.newProjectName) {
      const newProjId = crypto.randomUUID();
      const newProj = {
        id: newProjId,
        name: result.newProjectName,
        parentId: result.newProjectParentId || null,
        expanded: true
      };
      projects.push(newProj);
      
      // Auto expand parent
      if (result.newProjectParentId && !expandedProjectIds.includes(result.newProjectParentId)) {
        expandedProjectIds.push(result.newProjectParentId);
      }
      
      task.projectId = newProjId;
    } else if (result.projectId && result.projectId !== 'new') {
      const exists = projects.some(p => p.id === result.projectId);
      if (exists) {
        task.projectId = result.projectId;
      } else {
        task.projectId = null;
      }
    } else {
      task.projectId = null; // Inbox
    }

    await saveState();
    renderApp();
  } catch (err) {
    console.error('Organization failed:', err);
    alert('Organization failed. Please check your connection or API Key.');
  } finally {
    btnEl.textContent = originalText;
    btnEl.disabled = false;
  }
}

// AI: Elaborate All Inbox Tasks
async function elaborateInbox() {
  if (!apiKey) {
    alert('Please set your Gemini API Key in Settings first.');
    showSettings();
    return;
  }

  // Get all uncompleted tasks in Inbox
  const inboxTasks = tasks.filter(t => !t.projectId && !t.completed);
  if (inboxTasks.length === 0) return;

  const originalElabText = btnElaborateInbox.textContent;
  btnElaborateInbox.textContent = 'Elaborating...';
  btnElaborateInbox.disabled = true;
  btnOrganizeInbox.disabled = true;

  const prompt = `You are an expert GTD (Getting Things Done) coach and personal assistant.
The user has a list of tasks in their Inbox:
${JSON.stringify(inboxTasks.map(t => ({ id: t.id, text: t.text })))}

Your goal is to elaborate each of these tasks, make them highly actionable, add detailed notes/context, and break them down into clear, small, sequential subtasks (to remove friction and procrastination).
Each elaborated task title should be concise (under 80 characters) and in the same language as the task (e.g. Persian/English).

You must output your response in JSON format matching this schema:
{
  "tasks": [
    {
      "id": "original-task-uuid",
      "elaboratedText": "Actionable, clear rewrite of the task title",
      "notes": "Detailed context, tips, and next steps for the task",
      "subtasks": ["subtask 1", "subtask 2", ...]
    },
    ...
  ]
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(textResponse);

    if (result && result.tasks && Array.isArray(result.tasks)) {
      result.tasks.forEach(resTask => {
        const task = tasks.find(t => t.id === resTask.id);
        if (task) {
          task.text = resTask.elaboratedText || task.text;
          task.notes = (task.notes ? task.notes + '\n\n' : '') + (resTask.notes || '');

          if (resTask.subtasks && Array.isArray(resTask.subtasks)) {
            if (!task.subtasks) task.subtasks = [];
            resTask.subtasks.forEach(stText => {
              task.subtasks.push({
                id: crypto.randomUUID(),
                text: stText,
                completed: false
              });
            });
          }
        }
      });
    }

    await saveState();
    renderApp();
  } catch (err) {
    console.error('Elaboration failed:', err);
    alert('Elaboration failed. Please verify your API key or network connection.');
  } finally {
    btnElaborateInbox.textContent = originalElabText;
    btnElaborateInbox.disabled = false;
    btnOrganizeInbox.disabled = false;
  }
}

// AI: Organize All Inbox Tasks
async function organizeInbox() {
  if (!apiKey) {
    alert('Please set your Gemini API Key in Settings first.');
    showSettings();
    return;
  }

  // Get all uncompleted tasks in Inbox
  const inboxTasks = tasks.filter(t => !t.projectId && !t.completed);
  if (inboxTasks.length === 0) return;

  const originalOrgText = btnOrganizeInbox.textContent;
  btnOrganizeInbox.textContent = 'Organizing...';
  btnElaborateInbox.disabled = true;
  btnOrganizeInbox.disabled = true;

  // Create clean flat representation of projects for prompt
  const simplifiedProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    parentId: p.parentId
  }));

  const prompt = `You are an expert GTD (Getting Things Done) organization engine and coach.
The user has a list of tasks in their Inbox:
${JSON.stringify(inboxTasks.map(t => ({ id: t.id, text: t.text })))}

Here is the list of existing projects:
${JSON.stringify(simplifiedProjects)}

Your goal is to perform TWO steps for EACH task in the Inbox:
1. Clarify/Elaborate: Rewrite the task title/text to make it highly actionable and clear, add detailed notes/context, and break it down into clear, small, sequential subtasks. Keep each rewritten task title concise (under 80 characters) and in the same language as the task.
2. Organize: Decide where the task belongs.
   - If it fits under one of the existing projects, select the most appropriate existing project's ID.
   - If it does not fit any existing project, decide if a new project should be created. If so, specify the new project's name. (You can also decide if this new project should be nested as a sub-project under an existing project, in which case specify the parent project ID).
   - If it does not belong in any project, set projectId to null.

You must output your response in JSON format matching this schema:
{
  "tasks": [
    {
      "id": "original-task-uuid",
      "elaboratedText": "Actionable, clear rewrite of the task title",
      "notes": "Detailed context, tips, and next steps for the task",
      "subtasks": ["subtask 1", "subtask 2", ...],
      "projectId": "existing-project-uuid" (or "new" if a new project should be created, or null if it should remain in the Inbox),
      "newProjectName": "Name of the new project to create (only if projectId is 'new', in the same language as the task)",
      "newProjectParentId": "existing-project-uuid" (if the new project should be nested under an existing project, otherwise null)
    },
    ...
  ]
}

Do not include any Markdown syntax, code block formatting (like \`\`\`json), or extra text. Return ONLY the JSON object.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(textResponse);

    if (result && result.tasks && Array.isArray(result.tasks)) {
      // Helper function to find project by name and parentId
      const findProjectByName = (name, parentId = null) => {
        return projects.find(p => p.name.toLowerCase().trim() === name.toLowerCase().trim() && p.parentId === parentId);
      };

      // Keep track of projects created during this batch to avoid duplicates
      const batchCreatedProjects = {}; // key: "name|parentId", value: uuid

      result.tasks.forEach(resTask => {
        const task = tasks.find(t => t.id === resTask.id);
        if (!task) return;

        // Apply elaboration
        task.text = resTask.elaboratedText || task.text;
        task.notes = (task.notes ? task.notes + '\n\n' : '') + (resTask.notes || '');

        if (resTask.subtasks && Array.isArray(resTask.subtasks)) {
          if (!task.subtasks) task.subtasks = [];
          resTask.subtasks.forEach(stText => {
            task.subtasks.push({
              id: crypto.randomUUID(),
              text: stText,
              completed: false
            });
          });
        }

        // Apply organization / project assignment
        let targetProjectId = null;

        if (resTask.projectId === 'new' && resTask.newProjectName) {
          const normName = resTask.newProjectName.trim();
          const parentId = resTask.newProjectParentId || null;
          const key = `${normName.toLowerCase()}|${parentId}`;

          // 1. Check pre-existing projects list
          const existingProj = findProjectByName(normName, parentId);
          if (existingProj) {
            targetProjectId = existingProj.id;
          }
          // 2. Check batch-created projects
          else if (batchCreatedProjects[key]) {
            targetProjectId = batchCreatedProjects[key];
          }
          // 3. Create new project
          else {
            const newProjId = crypto.randomUUID();
            const newProj = {
              id: newProjId,
              name: normName,
              parentId: parentId,
              expanded: true
            };
            projects.push(newProj);
            batchCreatedProjects[key] = newProjId;
            targetProjectId = newProjId;

            // Auto-expand parent project folder
            if (parentId && !expandedProjectIds.includes(parentId)) {
              expandedProjectIds.push(parentId);
            }
          }
        } else if (resTask.projectId && resTask.projectId !== 'new') {
          // Verify existing project ID actually exists
          const exists = projects.some(p => p.id === resTask.projectId);
          if (exists) {
            targetProjectId = resTask.projectId;
          }
        }

        task.projectId = targetProjectId; // Assign to resolved project ID (or null/Inbox)
      });
    }

    await saveState();
    renderApp();
  } catch (err) {
    console.error('Organization failed:', err);
    alert('Organization failed. Please verify your API key or network connection.');
  } finally {
    btnOrganizeInbox.textContent = originalOrgText;
    btnElaborateInbox.disabled = false;
    btnOrganizeInbox.disabled = false;
  }
}

// Helper: Populate select options from fetched models or defaults
function renderModelSelectOptions() {
  selectModel.innerHTML = '';
  
  if (!fetchedModels || fetchedModels.length === 0) {
    // If no models fetched yet, populate with common defaults as fallback but keep select disabled
    const defaults = [
      { name: 'models/gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', inputTokenLimit: 1048576, outputTokenLimit: 8192, description: 'Fast, cost-efficient model' },
      { name: 'models/gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', inputTokenLimit: 2097152, outputTokenLimit: 8192, description: 'Highly capable model for complex tasks' },
      { name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', inputTokenLimit: 1048576, outputTokenLimit: 8192, description: 'High speed and efficiency' },
      { name: 'models/gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', inputTokenLimit: 2097152, outputTokenLimit: 8192, description: 'High reasoning and context capabilities' }
    ];
    
    defaults.forEach(m => {
      const option = document.createElement('option');
      const cleanVal = m.name.replace('models/', '');
      option.value = cleanVal;
      option.textContent = m.displayName;
      selectModel.appendChild(option);
    });
    
    // Set fallback active value
    selectModel.value = apiModel;
    selectModel.disabled = true;
    modelDetailsCard.classList.add('hidden');
    return;
  }
  
  selectModel.disabled = false;
  
  fetchedModels.forEach(m => {
    const option = document.createElement('option');
    const cleanVal = m.name.replace('models/', '');
    option.value = cleanVal;
    
    // Format input/output limits nicely in option text
    const inputLimit = formatTokenLimit(m.inputTokenLimit);
    const outputLimit = formatTokenLimit(m.outputTokenLimit);
    option.textContent = `${m.displayName} (${inputLimit} In / ${outputLimit} Out)`;
    selectModel.appendChild(option);
  });
  
  // Set current selected value
  selectModel.value = apiModel;
  
  // If the saved model is not in the list, set to the first one
  if (!selectModel.value && selectModel.options.length > 0) {
    selectModel.value = selectModel.options[0].value;
  }
  
  renderModelDetailsCard();
}

// Helper: Render details card for the selected Gemini model
function renderModelDetailsCard() {
  const selectedVal = selectModel.value;
  if (!selectedVal || !fetchedModels || fetchedModels.length === 0) {
    modelDetailsCard.classList.add('hidden');
    return;
  }
  
  const model = fetchedModels.find(m => m.name.replace('models/', '') === selectedVal);
  if (!model) {
    modelDetailsCard.classList.add('hidden');
    return;
  }
  
  modelDetailsCard.classList.remove('hidden');
  
  // Free tier rate limits for common Gemini models (addresses request for token/request quotas)
  const rateLimits = {
    'gemini-2.5-flash': { rpm: '15', tpm: '1M', rpd: '1,500' },
    'gemini-2.5-pro': { rpm: '2', tpm: '32k', rpd: '50' },
    'gemini-2.0-flash-exp': { rpm: '10', tpm: '4M', rpd: '1,500' },
    'gemini-1.5-flash': { rpm: '15', tpm: '1M', rpd: '1,500' },
    'gemini-1.5-flash-8b': { rpm: '15', tpm: '1M', rpd: '1,500' },
    'gemini-1.5-pro': { rpm: '2', tpm: '32k', rpd: '50' }
  };
  
  const limits = rateLimits[selectedVal] || { rpm: '15*', tpm: '1M*', rpd: '1,500*' };
  const suffix = rateLimits[selectedVal] ? '' : ' (Est.)';
  
  const formattedInputLimit = model.inputTokenLimit ? Number(model.inputTokenLimit).toLocaleString() : 'Unknown';
  const formattedOutputLimit = model.outputTokenLimit ? Number(model.outputTokenLimit).toLocaleString() : 'Unknown';
  
  modelDetailsCard.innerHTML = `
    <div class="model-detail-row">
      <span class="model-detail-label">Model ID:</span>
      <span class="model-detail-value">${selectedVal}</span>
    </div>
    <div class="model-detail-row">
      <span class="model-detail-label">Input Context:</span>
      <span class="model-detail-value">${formattedInputLimit} tokens</span>
    </div>
    <div class="model-detail-row">
      <span class="model-detail-label">Output Limit:</span>
      <span class="model-detail-value">${formattedOutputLimit} tokens</span>
    </div>
    <div class="model-detail-row">
      <span class="model-detail-label">Free Requests:</span>
      <span class="model-detail-value">${limits.rpm} / min | ${limits.rpd} / day${suffix}</span>
    </div>
    <div class="model-detail-row">
      <span class="model-detail-label">Free Tokens:</span>
      <span class="model-detail-value">${limits.tpm} / min${suffix}</span>
    </div>
    <div class="model-description">${model.description || 'No description available.'}</div>
  `;
}

// Action: Fetch models from Gemini API using provided API key
async function fetchModels(key) {
  if (!key) {
    showStatusMessage('Please enter an API key.', 'error');
    return;
  }
  
  showStatusMessage('Fetching models...', 'info');
  btnFetchModels.disabled = true;
  btnFetchModels.textContent = '...';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new Error(errorMessage || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    if (data.models && Array.isArray(data.models)) {
      // Filter for text generation models
      fetchedModels = data.models.filter(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes('generateContent')
      );
      
      // Sort Flash models first, then Pro models, alphabetically
      fetchedModels.sort((a, b) => {
        const isFlashA = a.name.toLowerCase().includes('flash');
        const isFlashB = b.name.toLowerCase().includes('flash');
        if (isFlashA && !isFlashB) return -1;
        if (!isFlashA && isFlashB) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
      
      await saveState();
      renderModelSelectOptions();
      showStatusMessage(`Loaded ${fetchedModels.length} models successfully.`, 'success');
    } else {
      throw new Error('No models returned from API.');
    }
  } catch (err) {
    console.error('Failed to fetch models:', err);
    showStatusMessage(`Failed to load models: ${err.message}`, 'error');
    
    // Fall back to empty and show defaults
    fetchedModels = [];
    renderModelSelectOptions();
  } finally {
    btnFetchModels.disabled = false;
    btnFetchModels.textContent = 'Fetch';
  }
}

// Helper: Show API status message in settings modal
function showStatusMessage(text, type) {
  apiKeyStatus.textContent = text;
  apiKeyStatus.className = `api-status-message ${type}`;
  apiKeyStatus.classList.remove('hidden');
}

// Helper: Format large numbers into human-readable K/M notation
function formatTokenLimit(limit) {
  if (!limit) return 'Unknown';
  if (limit >= 1000000) {
    return (limit / 1000000).toFixed(limit % 1000000 === 0 ? 0 : 1) + 'M';
  }
  if (limit >= 1000) {
    return (limit / 1000).toFixed(limit % 1000 === 0 ? 0 : 1) + 'k';
  }
  return limit.toString();
}

