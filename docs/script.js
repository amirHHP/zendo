// Language and Theme management
const htmlEl = document.documentElement;

// Translations for dynamically generated elements
const translations = {
  en: {
    title: "Zendo GTD — Minimalist Task Manager powered by Gemini AI",
    subtaskText: "Check Zendo features on landing page",
    simulating: "Gemini is thinking...",
    defaultNote: "Task successfully processed by Gemini AI. Actionable subtasks generated.",
    genericSubtasks: [
      "Gather necessary resources and tools",
      "Execute the initial action phase",
      "Verify completion and review results"
    ],
    taskBadges: {
      inbox: "Inbox",
      work: "Work",
      personal: "Personal"
    },
    addplaceholder: "Capture: what needs to be done? (Press Enter)"
  },
  fa: {
    title: "زندو GTD — مدیریت تسک مینیمال با هوش مصنوعی Gemini",
    subtaskText: "بررسی قابلیت‌های زندو در صفحه لندینگ",
    simulating: "Gemini در حال تحلیل تسک...",
    defaultNote: "تسک با موفقیت توسط هوش مصنوعی تحلیل شد و زیرتسک‌های عملیاتی ایجاد گردید.",
    genericSubtasks: [
      "تهیه ابزارها و مقدمات اولیه مورد نیاز",
      "انجام فاز اول کار به صورت متمرکز",
      "بررسی نهایی خروجی و اطمینان از انجام کامل کار"
    ],
    taskBadges: {
      inbox: "ورودی",
      work: "کار",
      personal: "شخصی"
    },
    addplaceholder: "ثبت ایده جدید... (کلید Enter را بزنید)"
  }
};

// Preset AI responses for Sandbox
const sandboxPresets = {
  en: {
    "Plan weekend road trip": {
      title: "Plan weekend road trip",
      subtasks: [
        "Check car tire pressure, oil levels, and fill fuel",
        "Book a cozy cabin or Airbnb for Saturday night",
        "Pack luggage and prepare a road trip music playlist"
      ],
      note: "Keep emergency contacts ready. Check weather forecasts for the route before leaving."
    },
    "Learn basic Rust language": {
      title: "Learn basic Rust language",
      subtasks: [
        "Read official Rust Book chapters 1 to 4 (Variables, Ownership)",
        "Install Rust compiler and Cargo toolchain via rustup",
        "Write and run a classic 'Hello, World!' console application"
      ],
      note: "Focus on understanding ownership and borrowing rules early, as they form Rust's foundation."
    },
    "Prepare product launch checklist": {
      title: "Prepare product launch checklist",
      subtasks: [
        "Finalize the developer documentation and project README",
        "Run the release build verification scripts and unit tests",
        "Draft announcement social posts and notify beta testers"
      ],
      note: "Coordinate with the support team to monitor incoming feedback during the first 24 hours."
    }
  },
  fa: {
    "برنامه‌ریزی سفر آخر هفته": {
      title: "برنامه‌ریزی سفر آخر هفته",
      subtasks: [
        "بررسی فشار باد لاستیک‌ها، سطح روغن و بنزین زدن ماشین",
        "رزرو یک اقامتگاه بوم‌گردی یا کلبه برای شب جمعه",
        "جمع‌آوری چمدان‌ها و آماده‌سازی لیست موسیقی برای همسفران"
      ],
      note: "حتماً پیش از حرکت، پیش‌بینی آب و هوای مسیر و جاده‌ها را بررسی کنید."
    },
    "یادگیری مقدماتی زبان راست": {
      title: "یادگیری مقدماتی زبان راست",
      subtasks: [
        "مطالعه فصل‌های ۱ تا ۴ کتاب رسمی راست (متغیرها و مالکیت)",
        "نصب کامپایلر راست و ابزار مدیریت بسته Cargo از طریق rustup",
        "نوشتن و اجرای اولین برنامه ساده Hello World در محیط ترمینال"
      ],
      note: "در ابتدا روی درک مفاهیم کلیدی مالکیت (Ownership) و امانت‌دهی (Borrowing) تمرکز کنید."
    },
    "تهیه چک‌لیست انتشار محصول": {
      title: "تهیه چک‌لیست انتشار محصول",
      subtasks: [
        "نهایی‌سازی مستندات توسعه‌دهندگان و فایل راهنمای README",
        "اجرای تست‌های واحد و تأیید عملکرد نهایی نسخه ریلیز",
        "آماده‌سازی پیش‌نویس پست‌های معرفی در شبکه‌های اجتماعی"
      ],
      note: "برای ثبت و نظارت بر بازخوردهای کاربران، هماهنگی‌های لازم را با تیم فنی داشته باشید."
    }
  }
};

// Initialize Settings
function initSettings() {
  // Theme initialization
  const savedTheme = localStorage.getItem('zendo-theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    htmlEl.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  // Language initialization
  const savedLang = localStorage.getItem('zendo-lang');
  if (savedLang) {
    setLanguage(savedLang);
  } else {
    // Detect system locale or default to Persian
    const isEn = navigator.language.startsWith('en');
    setLanguage(isEn ? 'en' : 'fa');
  }
}

// Set Language helper
function setLanguage(lang) {
  htmlEl.setAttribute('lang', lang);
  htmlEl.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  localStorage.setItem('zendo-lang', lang);
  
  // Update browser window title
  document.getElementById('page-title').textContent = translations[lang].title;
  
  // Update inputs placeholder inside mockup
  const mockInput = document.querySelector('.mockup-quick-add input');
  if (mockInput) {
    mockInput.placeholder = translations[lang].addplaceholder;
  }
  
  // Refresh mockup to render in active language
  renderMockupTasks();
  updateMockupDrawer();
}

// Set Theme helper
function toggleTheme() {
  const currentTheme = htmlEl.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', newTheme);
  localStorage.setItem('zendo-theme', newTheme);
}

// --- MOCKUP STATE & INTERACTIVITY ---
const mockupState = {
  currentFilter: 'inbox', // 'inbox', 'work', 'personal'
  tasks: [
    {
      id: 1,
      titleEn: "Draft landing page layout and copy",
      titleFa: "طراحی طرح کلی و متون لندینگ پیج",
      project: "work",
      completed: false,
      notesEn: "Make sure to write a clean B&W design stylesheet. Highlight Gemini integration.",
      notesFa: "حتماً استایل‌های مینیمال سیاه و سفید تمیز نوشته شود و قابلیت ادغام با جمینای برجسته باشد.",
      subtasks: [
        { titleEn: "Create vector SVG logo", titleFa: "ساخت فایل وکتور SVG لوگو", completed: true },
        { titleEn: "Write premium style.css file", titleFa: "نوشتن استایل‌های پیشرفته css", completed: false },
        { titleEn: "Develop interactive mockups", titleFa: "پیاده‌سازی ماکاپ تعاملی", completed: false }
      ]
    },
    {
      id: 2,
      titleEn: "Buy groceries for dinner",
      titleFa: "خرید مواد غذایی برای شام",
      project: "personal",
      completed: false,
      notesEn: "Get fresh spinach, garlic, tomatoes and olive oil.",
      notesFa: "اسفناج تازه، سیر، گوجه‌فرنگی و روغن زیتون خریداری شود.",
      subtasks: [
        { titleEn: "Spinach & garlic", titleFa: "اسفناج و سیر", completed: false },
        { titleEn: "Tomatoes & olive oil", titleFa: "گوجه‌فرنگی و روغن زیتون", completed: false }
      ]
    }
  ],
  selectedTaskId: 1
};

function renderMockupTasks() {
  const container = document.getElementById('mockup-task-list');
  if (!container) return;
  container.innerHTML = '';
  
  const currentLang = htmlEl.getAttribute('lang') || 'en';
  
  // Filter tasks
  const filtered = mockupState.tasks.filter(t => {
    if (mockupState.currentFilter === 'inbox') return true;
    return t.project === mockupState.currentFilter;
  });
  
  // Render badge count
  const inboxCountEl = document.getElementById('mockup-inbox-count');
  if (inboxCountEl) {
    inboxCountEl.textContent = mockupState.tasks.filter(t => !t.completed).length;
  }
  
  filtered.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = `mockup-task-item ${task.completed ? 'completed' : ''} ${task.id === mockupState.selectedTaskId ? 'active' : ''}`;
    taskItem.dataset.id = task.id;
    
    const title = currentLang === 'fa' ? task.titleFa : task.titleEn;
    const badgeLabel = translations[currentLang].taskBadges[task.project];
    
    taskItem.innerHTML = `
      <span class="mockup-checkbox"></span>
      <span class="mockup-task-text">${title}</span>
      <span class="mockup-task-badge">${badgeLabel}</span>
    `;
    
    // Checkbox toggle click listener
    taskItem.querySelector('.mockup-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      task.completed = !task.completed;
      renderMockupTasks();
      updateMockupDrawer();
    });
    
    // Select task click listener
    taskItem.addEventListener('click', () => {
      mockupState.selectedTaskId = task.id;
      renderMockupTasks();
      updateMockupDrawer();
      
      // Slide open drawer on mobile or ensure it's visible
      const drawer = document.getElementById('mockup-drawer');
      if (drawer) {
        drawer.classList.remove('hidden');
        drawer.style.display = 'flex';
      }
    });
    
    container.appendChild(taskItem);
  });
}

function updateMockupDrawer() {
  const drawer = document.getElementById('mockup-drawer');
  if (!drawer) return;
  
  const currentLang = htmlEl.getAttribute('lang') || 'en';
  const task = mockupState.tasks.find(t => t.id === mockupState.selectedTaskId);
  
  if (!task) {
    drawer.style.display = 'none';
    return;
  }
  
  drawer.style.display = 'flex';
  
  const titleEl = document.getElementById('mockup-detail-title');
  const subtaskListEl = drawer.querySelector('.mockup-subtasks-list');
  
  titleEl.innerHTML = `
    <span lang="en">${task.titleEn}</span>
    <span lang="fa">${task.titleFa}</span>
  `;
  
  subtaskListEl.innerHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((subtask, index) => {
      const item = document.createElement('div');
      item.className = `mockup-subtask-item ${subtask.completed ? 'completed' : ''}`;
      
      item.innerHTML = `
        <span class="mockup-subtask-box"></span>
        <span class="mockup-subtask-text">
          <span lang="en">${subtask.titleEn}</span>
          <span lang="fa">${subtask.titleFa}</span>
        </span>
      `;
      
      // Interactive subtask checkoff
      item.addEventListener('click', () => {
        subtask.completed = !subtask.completed;
        updateMockupDrawer();
      });
      
      subtaskListEl.appendChild(item);
    });
  } else {
    subtaskListEl.innerHTML = `<span style="font-size: 11px; color: var(--text-tertiary);">No subtasks.</span>`;
  }
}

// Add task functionality inside the mockup
function initMockupInput() {
  const quickInput = document.querySelector('.mockup-quick-add input');
  if (!quickInput) return;
  
  quickInput.removeAttribute('readonly'); // Make it interactive!
  
  quickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && quickInput.value.trim() !== '') {
      const text = quickInput.value.trim();
      const isPersian = /[\u0600-\u06FF]/.test(text);
      
      const newId = mockupState.tasks.length > 0 ? Math.max(...mockupState.tasks.map(t => t.id)) + 1 : 1;
      
      const newTask = {
        id: newId,
        titleEn: isPersian ? text : text, // Simple fallback for simulation
        titleFa: isPersian ? text : text,
        project: mockupState.currentFilter === 'inbox' ? 'work' : mockupState.currentFilter,
        completed: false,
        notesEn: "Manually captured task.",
        notesFa: "تسک به صورت دستی ثبت شده است.",
        subtasks: []
      };
      
      mockupState.tasks.push(newTask);
      mockupState.selectedTaskId = newId;
      quickInput.value = '';
      
      renderMockupTasks();
      updateMockupDrawer();
    }
  });
}

// Filter Navigation inside Mockup
function initMockupNav() {
  const navInbox = document.getElementById('mockup-nav-inbox');
  const projWork = document.getElementById('mockup-proj-work');
  const projPersonal = document.getElementById('mockup-proj-personal');
  const titleEl = document.getElementById('mockup-current-view');
  
  const navs = [
    { el: navInbox, filter: 'inbox', labelEn: 'Inbox', labelFa: 'صندوق ورودی' },
    { el: projWork, filter: 'work', labelEn: 'Work', labelFa: 'کار' },
    { el: projPersonal, filter: 'personal', labelEn: 'Personal', labelFa: 'شخصی' }
  ];
  
  navs.forEach(nav => {
    if (!nav.el) return;
    nav.el.addEventListener('click', () => {
      navs.forEach(n => n.el.classList.remove('active'));
      nav.el.classList.add('active');
      
      mockupState.currentFilter = nav.filter;
      
      titleEl.innerHTML = `
        <span lang="en">${nav.labelEn}</span>
        <span lang="fa">${nav.labelFa}</span>
      `;
      
      renderMockupTasks();
    });
  });
  
  // Close drawer
  const closeBtn = document.getElementById('mockup-drawer-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const drawer = document.getElementById('mockup-drawer');
      if (drawer) {
        drawer.style.display = 'none';
      }
    });
  }
}

// --- AI SIMULATOR SANDBOX ---
function initSandbox() {
  const inputEl = document.getElementById('sandbox-input');
  const runBtn = document.getElementById('sandbox-btn-run');
  const outputEl = document.getElementById('sandbox-output');
  const chips = document.querySelectorAll('.sandbox-suggestion-chip');
  
  if (!inputEl || !runBtn || !outputEl) return;
  
  // Chip click handler
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const currentLang = htmlEl.getAttribute('lang') || 'en';
      const text = currentLang === 'fa' ? chip.dataset.taskFa : chip.dataset.taskEn;
      inputEl.value = text;
      inputEl.focus();
    });
  });
  
  // Run button click handler
  runBtn.addEventListener('click', () => {
    const rawVal = inputEl.value.trim();
    if (!rawVal) {
      inputEl.focus();
      return;
    }
    
    const currentLang = htmlEl.getAttribute('lang') || 'en';
    
    // Show Loading state
    outputEl.innerHTML = `
      <div class="sandbox-output-placeholder" style="flex-direction: column; gap: 12px; display: flex;">
        <div class="loading" style="width: 32px; height: 32px; display: block; margin: 0 auto;"></div>
        <div>${translations[currentLang].simulating}</div>
      </div>
    `;
    
    // Simulate AI latency
    setTimeout(() => {
      let result = {
        title: rawVal,
        subtasks: [],
        note: ""
      };
      
      // Determine if text matches presets
      let foundPreset = null;
      
      // Search in presets (both fa and en keys)
      const presetsFa = sandboxPresets.fa;
      const presetsEn = sandboxPresets.en;
      
      if (presetsFa[rawVal]) {
        foundPreset = presetsFa[rawVal];
      } else if (presetsEn[rawVal]) {
        foundPreset = presetsEn[rawVal];
      } else {
        // Look up translation equivalents (e.g. user clicked chip in one lang, input has the value)
        const allChips = Array.from(chips);
        const matchingChip = allChips.find(c => c.dataset.taskFa === rawVal || c.dataset.taskEn === rawVal);
        if (matchingChip) {
          const keyFa = matchingChip.dataset.taskFa;
          const keyEn = matchingChip.dataset.taskEn;
          foundPreset = presetsFa[keyFa] || presetsEn[keyEn];
        }
      }
      
      if (foundPreset) {
        // Adapt preset language to current landing page language
        const isPersianInput = /[\u0600-\u06FF]/.test(rawVal);
        const presetLang = isPersianInput ? 'fa' : 'en';
        
        // Find matching preset key in appropriate language
        // We look for direct match or the counterpart
        const chipItem = Array.from(chips).find(c => c.dataset.taskFa === rawVal || c.dataset.taskEn === rawVal);
        if (chipItem) {
          const matchingPreset = sandboxPresets[currentLang][chipItem.dataset[`task${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`]];
          if (matchingPreset) {
            result = matchingPreset;
          } else {
            result = foundPreset; // Fallback
          }
        } else {
          result = foundPreset; // Fallback
        }
      } else {
        // Custom input dynamic generation
        const isPersian = /[\u0600-\u06FF]/.test(rawVal);
        const textLang = isPersian ? 'fa' : 'en';
        
        result.title = rawVal;
        result.subtasks = translations[textLang].genericSubtasks;
        result.note = translations[textLang].defaultNote;
      }
      
      // Render structured result
      outputEl.innerHTML = `
        <div class="sandbox-result">
          <div class="sandbox-result-header">
            <span class="sandbox-result-title">${result.title}</span>
            <span class="sandbox-result-ai-badge">Gemini AI</span>
          </div>
          <div class="sandbox-subtasks">
            ${result.subtasks.map((sub, i) => `
              <div class="sandbox-subtask" style="animation-delay: ${i * 150}ms">
                <span class="sandbox-checkbox-icon"></span>
                <span>${sub}</span>
              </div>
            `).join('')}
          </div>
          ${result.note ? `
            <div class="sandbox-notes-block" style="animation-delay: ${result.subtasks.length * 150}ms">
              <strong>${currentLang === 'fa' ? 'یادداشت‌های هوش مصنوعی:' : 'AI Context Notes:'}</strong>
              <p>${result.note}</p>
            </div>
          ` : ''}
        </div>
      `;
    }, 1500);
  });
  
  // Keypress support inside sandbox
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      runBtn.click();
    }
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  
  // Event listeners
  document.getElementById('btn-lang-toggle').addEventListener('click', () => {
    const currentLang = htmlEl.getAttribute('lang') || 'en';
    const newLang = currentLang === 'fa' ? 'en' : 'fa';
    setLanguage(newLang);
  });
  
  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  
  // Initialize Mockup and Sandbox
  renderMockupTasks();
  updateMockupDrawer();
  initMockupInput();
  initMockupNav();
  initSandbox();
});
