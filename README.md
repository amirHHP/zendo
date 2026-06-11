<div align="center">

# 🧘 Zendo GTD

### A minimalist, AI-powered Getting Things Done task manager for Chrome

**[🌐 Landing Page](https://amirhhp.github.io/zendo) · [📦 Install](#-installation--نصب) · [🐛 Issues](https://github.com/amirHHP/zendo/issues)**

---

**[English](#-english) · [فارسی](#-فارسی)**

</div>

---

## 🇬🇧 English

### What is Zendo?

Zendo is an ultra-minimalist, distraction-free **Getting Things Done (GTD)** task manager built as a Chrome extension. It combines a clean black-and-white aesthetic with the intelligence of **Google Gemini AI** to help you capture, elaborate, and organize tasks effortlessly — all while keeping your data 100% local and private.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 📥 **Quick Capture** | Instantly add tasks to your inbox from any browser tab with one click |
| 🌳 **Nestable Project Trees** | Organize tasks into hierarchical projects and sub-projects with a collapsible folder tree sidebar |
| 📝 **Task Details Drawer** | Manage task details, inline notes, and subtask checklists in a slide-out panel |
| 🪄 **AI Elaboration** | Refine vague tasks with Gemini AI — automatically generates clear titles, subtasks, and contextual notes |
| 🧠 **AI Organization** | Smartly categorize inbox tasks into existing projects or let AI suggest and create new ones |
| 📂 **AI Project Grouping** | Organize loose projects into logical folder structures using AI |
| 🔒 **Privacy-First** | All data stored locally in Chrome storage — no third-party servers |
| 🌓 **Dark Mode** | Beautiful monochrome theme with dark/light toggle and system preference detection |
| 🔔 **Completion Sound** | Satisfying audio chime when you check off tasks and subtasks |
| 🤖 **Model Selection** | Fetch and choose from available Gemini models directly in settings |

### 📦 Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/amirHHP/zendo.git
   ```
2. Open **Chrome** and navigate to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **Load Unpacked** and select the `zendo` folder
5. Pin the **Zendo** extension from the extensions toolbar

### ⚙️ Setup

1. Click the Zendo icon in your browser toolbar
2. Click **Open Zendo Dashboard** to access the full interface
3. Click **Settings** (top-right corner)
4. Enter your [Google Gemini API Key](https://aistudio.google.com/apikey) (free)
5. Click **Fetch** to load available models, select your preferred one, and click **Save Settings**

### 🚀 Usage

| Action | How |
|--------|-----|
| **Add a task** | Type in the top input bar and press `Enter` |
| **Create a project** | Use the "New project..." input at the bottom of the sidebar |
| **Add a sub-project** | Hover over a project and click the `+` button |
| **View task details** | Click on any task's text to open the details drawer |
| **Elaborate a task** | Click the **Elaborate** button (available for inbox tasks) — AI rewrites the title, adds notes and subtasks |
| **Organize tasks** | Click the **Organize** button to let AI categorize all inbox tasks into projects |
| **Organize projects** | Click the **Organize** button in the Projects section header to group projects into folders |
| **Toggle dark mode** | Click the **Dark Mode / Light Mode** button in the header |

### 🏗️ Tech Stack

- **Manifest V3** Chrome Extension
- **Vanilla JavaScript** — no frameworks, no build tools
- **Chrome Storage API** — local-first data persistence
- **Google Gemini API** — direct integration for AI features
- **Pure CSS** — monochrome design with CSS custom properties and dark mode

### 📁 Project Structure

```
zendo/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html             # Quick-capture popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup logic
├── dashboard.html         # Full GTD dashboard interface
├── dashboard.css          # Dashboard styles
├── dashboard.js           # Core app logic (state, rendering, AI)
├── icons/                 # Extension icons (16, 48, 128px)
├── docs/                  # Landing page (GitHub Pages)
│   ├── index.html         # Bilingual landing page (EN/FA)
│   ├── style.css          # Landing page styles
│   ├── script.js          # Landing page logic
│   └── z-logo.svg         # Vector logo
└── README.md
```

### 🔐 Privacy

- **Zero data collection** — all tasks, projects, and settings are stored locally in Chrome's `storage.local`
- **No third-party servers** — AI requests go directly from your browser to Google's official Gemini API using your personal API key
- **No analytics, no tracking, no telemetry**

For more details, see our [Privacy Policy](https://github.com/amirHHP/zendo/blob/main/PRIVACY.md).

### 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 📄 License

This project is open-source. See the repository for license details.

---

## 🇮🇷 فارسی

<div dir="rtl">

### زندو چیست؟

زندو یک افزونه مدیریت تسک **فوق‌العاده مینیمال و بدون حواس‌پرتی** برای مرورگر کروم است که بر پایه متدولوژی **Getting Things Done (GTD)** ساخته شده. زندو با ترکیب طراحی شیک سیاه و سفید و قدرت هوش مصنوعی **Google Gemini**، به شما کمک می‌کند ایده‌ها و کارهایتان را ثبت، بسط و سازماندهی کنید — و تمام داده‌ها ۱۰۰٪ روی دستگاه خودتان ذخیره می‌شود.

### ✨ ویژگی‌ها

| ویژگی | توضیح |
|-------|-------|
| 📥 **ثبت سریع** | تسک‌ها را فوری از هر تب مرورگر به صندوق ورودی اضافه کنید |
| 🌳 **پروژه‌های درختی** | کارها را در ساختار سلسله‌مراتبی پروژه‌ها و زیرپروژه‌ها با نوار کناری جمع‌شونده دسته‌بندی کنید |
| 📝 **پنل جزئیات تسک** | یادداشت‌ها، جزئیات و زیرتسک‌ها را در پنل کشویی مدیریت کنید |
| 🪄 **بسط هوشمند با AI** | تسک‌های مبهم را با Gemini AI به عنوان واضح، زیرتسک‌های عملیاتی و یادداشت‌های مفید تبدیل کنید |
| 🧠 **سازماندهی خودکار** | تسک‌های ورودی را هوشمندانه در پروژه‌های مناسب قرار دهید یا پروژه‌های جدید بسازید |
| 📂 **گروه‌بندی پروژه‌ها** | پروژه‌های پراکنده را با AI در پوشه‌های منطقی دسته‌بندی کنید |
| 🔒 **حریم خصوصی** | تمام داده‌ها روی مرورگر شما ذخیره می‌شود — هیچ سرور واسطه‌ای وجود ندارد |
| 🌓 **حالت تاریک** | تم زیبای تک‌رنگ با پشتیبانی از حالت تاریک/روشن و تشخیص خودکار تنظیمات سیستم |
| 🔔 **صدای تکمیل تسک** | صدای لذت‌بخش هنگام تکمیل تسک‌ها و زیرتسک‌ها |
| 🤖 **انتخاب مدل** | مدل‌های Gemini موجود را مستقیماً از تنظیمات مشاهده و انتخاب کنید |

### 📦 نصب

<div dir="ltr">

```bash
git clone https://github.com/amirHHP/zendo.git
```

</div>

۱. ریپوزیتوری را **کلون** کنید (دستور بالا)

۲. مرورگر **کروم** را باز کنید و به آدرس `chrome://extensions` بروید

۳. **حالت توسعه‌دهنده** (Developer Mode) را فعال کنید

۴. روی **Load Unpacked** کلیک کنید و پوشه `zendo` را انتخاب کنید

۵. افزونه **Zendo** را از نوار ابزار مرورگر پین کنید

### ⚙️ راه‌اندازی

۱. روی آیکون زندو در نوار ابزار مرورگر کلیک کنید

۲. روی **Open Zendo Dashboard** کلیک کنید تا داشبورد کامل باز شود

۳. روی **Settings** (گوشه بالا-راست) کلیک کنید

۴. [کلید API رایگان Google Gemini](https://aistudio.google.com/apikey) خود را وارد کنید

۵. روی **Fetch** کلیک کنید تا مدل‌های موجود بارگذاری شود، مدل مورد نظر را انتخاب و **Save Settings** را بزنید

### 🚀 نحوه استفاده

| عملیات | نحوه انجام |
|--------|-----------|
| **افزودن تسک** | در نوار ورودی بالا تایپ کنید و `Enter` بزنید |
| **ساخت پروژه** | از ورودی «+ New project...» در پایین نوار کناری استفاده کنید |
| **ساخت زیرپروژه** | نشانگر ماوس را روی پروژه ببرید و دکمه `+` را بزنید |
| **مشاهده جزئیات** | روی متن هر تسک کلیک کنید تا پنل جزئیات باز شود |
| **بسط تسک** | دکمه **Elaborate** را بزنید — AI عنوان را بازنویسی و زیرتسک‌ها اضافه می‌کند |
| **سازماندهی تسک‌ها** | دکمه **Organize** را بزنید تا AI تسک‌های ورودی را به پروژه‌ها تخصیص دهد |
| **سازماندهی پروژه‌ها** | دکمه **Organize** در بخش پروژه‌ها را بزنید تا پروژه‌ها در پوشه‌ها گروه‌بندی شوند |
| **تغییر تم** | دکمه **Dark Mode / Light Mode** در هدر را بزنید |

### 🏗️ پشته فنی

- افزونه کروم **Manifest V3**
- **جاوااسکریپت خالص** — بدون فریم‌ورک و ابزار بیلد
- **Chrome Storage API** — ذخیره‌سازی محلی داده‌ها
- **Google Gemini API** — اتصال مستقیم برای قابلیت‌های هوش مصنوعی
- **CSS خالص** — طراحی تک‌رنگ با متغیرهای CSS و حالت تاریک

### 🔐 حریم خصوصی

- **هیچ داده‌ای جمع‌آوری نمی‌شود** — تمام تسک‌ها، پروژه‌ها و تنظیمات روی حافظه محلی کروم ذخیره می‌شود
- **هیچ سرور واسطه‌ای نیست** — درخواست‌های AI مستقیماً از مرورگر شما به API رسمی Google ارسال می‌شود
- **بدون آنالیتیکس، بدون ردیابی، بدون تله‌متری**

برای جزئیات بیشتر [سیاست حریم خصوصی](https://github.com/amirHHP/zendo/blob/main/PRIVACY.md) را مطالعه کنید.

### 🤝 مشارکت در توسعه

از مشارکت شما استقبال می‌کنیم! مراحل زیر را دنبال کنید:

<div dir="ltr">

```bash
# 1. Fork this repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'feat: add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

</div>

### 📄 مجوز

این پروژه متن‌باز است. برای جزئیات مجوز، ریپوزیتوری را مشاهده کنید.

</div>

---

<div align="center">

**Built with ☕ and focus.**

</div>