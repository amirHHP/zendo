# Chrome Web Store Listing — Zendo GTD

> Last Updated: 2026-05-24

## Store Listing

**Extension Name**
Zendo GTD

**Short Description**
A minimalist black-and-white GTD task manager with AI-powered task elaboration and smart categorization.

**Detailed Description**
Zendo is an ultra-minimalist, distraction-free Getting Things Done (GTD) task manager designed in a clean, professional black-and-white aesthetic. 

Features:
- Quick Capture: Instantly add tasks to your inbox from any browser tab with one click.
- Collapsible Projects Tree: Organize your tasks into projects and sub-projects displayed in a folder-like tree on the left sidebar.
- Details Drawer: Manage task details, inline notes, and subtask checklists.
- AI Elaboration: Refine vague tasks with AI to automatically draft clear subtasks and actionable notes.
- AI Organization: Smartly categorize tasks into existing projects or let the AI suggest and create new nested projects.
- Privacy-First: Your tasks and data are stored entirely on your local device. The AI actions connect directly to the official Google Gemini API using your personal API key.

How to use it:
1. Click the Zendo extension icon to open the interface.
2. Type any task in the top input and press Enter to save it to your Inbox.
3. In the sidebar, create projects using the "+ New Project" input. Click the "+" button next to a project to nest sub-projects.
4. Click "Elaborate" on a task to have AI rewrite the title and add subtasks.
5. Click "Organize" on a task to have AI move it to the most relevant project automatically.
6. Open Settings (top right) to enter your Gemini API Key.

**Category**
Productivity

**Single Purpose**
Captures tasks in an Inbox and organizes them into a hierarchical projects tree.

**Primary Language**
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ⬜ Not created | |
| Screenshot 2 | 1280×800 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: Show the main popup interface with the Inbox active, demonstrating the clean black-and-white layout, several tasks, and the quick-add input at the top.
- Screenshot 2: Show the projects tree sidebar active with nested projects, and a task's subtasks list open in the details panel on the right.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to store tasks, projects structure, settings, and the user's Gemini API key locally on the device. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Required to send tasks to the Google Gemini API for the "Elaborate" and "Organize" actions directly from the user's browser. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

All tasks, project layouts, and API settings are stored locally on the user's device using Chrome local storage. No data is transmitted to third-party servers, except for the task text and project structure sent directly to Google's official Gemini API endpoint (`https://generativelanguage.googleapis.com`) when the user explicitly triggers the "Elaborate" or "Organize" features.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**
https://github.com/amirHHP/zendo/blob/main/PRIVACY.md

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**
Zendo Developer

**Contact Email**
developer@zendo.io

**Support URL / Email**
https://github.com/amirHHP/zendo/issues

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-24 | Initial release with Inbox, Projects tree, task details, and Gemini AI actions. | Draft |

## Review Notes

### Known Issues / Limitations
- Requires a personal Google Gemini API Key to use the "Elaborate" and "Organize" buttons.
