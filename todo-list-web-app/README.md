# TaskFlow — To-Do List Web App

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> A modern, responsive, developer-grade To-Do List web application built strictly with vanilla web technologies. Developed as part of the **Full Stack Development Internship**.

---

## Description

**TaskFlow** is a clean, professional, and fully functional task management web application created using **only HTML5, CSS3, and Vanilla JavaScript**. Designed with an executive productivity aesthetic (inspired by modern developer platforms like Linear and Vercel), TaskFlow helps users organize everyday tasks effortlessly, track dynamic completion metrics in real time, customize visual themes, and maintain persistent state across browser sessions—completely offline with zero dependencies, frameworks, or backend servers.

---

## Features

- **Add Tasks**: Capture new tasks quickly using the dedicated input field or by pressing `Enter`.
- **Edit Tasks**: Inline editing mode to modify existing task titles, with `Enter` to save and `Escape` to cancel.
- **Delete Tasks**: Remove individual tasks with a smooth CSS exit animation and live counter updates.
- **Complete / Uncomplete Tasks**: Check off tasks to toggle custom animated checkmarks, strikethrough styling, and completion statistics.
- **Task Filters**: Instant client-side filtering across three dynamic views:
  - **ALL**: View every task in your list.
  - **ACTIVE**: View only ongoing/incomplete tasks.
  - **COMPLETED**: View all completed tasks.
- **Task Counters**: Real-time statistical dashboard displaying:
  - **Total Tasks**
  - **Active Tasks**
  - **Completed Tasks**
- **Progress Indicator**: Compact visual progress bar dynamically calculating the completion percentage (e.g., *60% complete*, *3 of 5 tasks completed*) with real-time status cues.
- **Clear Completed**: One-click cleanup to purge all completed tasks at once (disabled when no completed tasks exist).
- **LocalStorage Persistence**: Auto-saves tasks and theme preferences (`taskflow_tasks` and `taskflow_theme`) with defensive JSON parsing and corruption recovery.
- **Dark / Light Mode**: Accessible dual-theme system that honors system preferences and supports instant toggle with smooth transitions.
- **Responsive Design**: Fully fluid layout tested across 320px, 375px, 425px, 768px, 1024px, 1440px, and 1920px viewports without horizontal scrolling.
- **Keyboard Support**: Full keyboard accessibility including `Enter` to submit/save, `Escape` to cancel editing, `Space` on checkboxes, and visible `:focus-visible` focus rings.
- **Safe DOM Manipulation**: Strict avoidance of `innerHTML` for user input, using `textContent` and safe DOM APIs to eliminate XSS risks.

---

## Technologies

- **HTML5**: Semantic document structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<form>`).
- **CSS3**: CSS Custom Properties (variables), Flexbox, CSS Grid, custom checkbox styling, keyframe animations, responsive media queries, and `@media (prefers-reduced-motion)`.
- **JavaScript (ES6+)**: Pure Vanilla JavaScript, modular functions, event delegation, defensive LocalStorage management, and safe DOM manipulation.
- **Browser LocalStorage**: Client-side offline data persistence.

---

## Project Structure

```text
todo-list-web-app/
│
├── index.html          # Semantic HTML5 markup and UI structure
├── style.css           # Modern CSS3 styling, design tokens, and theme system
├── script.js           # Vanilla JavaScript application logic and event handling
├── README.md           # Comprehensive project documentation
└── assets/
    └── favicon.svg     # Scalable vector application favicon
```

---

## How to Run

1. **Clone or Download the Project**:
   ```bash
   git clone https://github.com/khansaheem786/TaskFlow.git
   ```
2. **Navigate to the Project Folder**:
   ```bash
   cd TaskFlow/todo-list-web-app
   ```
3. **Open in Any Web Browser**:
   - Double-click `index.html`, OR
   - Right-click `index.html` → *Open with* → Chrome / Edge / Firefox / Safari.
   - *No Node.js, server, database, or build tools required.*

---

## Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Enter` | Main input field | Adds a new task |
| `Enter` | Inline edit input | Saves the updated task title |
| `Escape` | Inline edit input | Cancels editing and reverts changes |
| `Tab` / `Shift + Tab` | Anywhere | Navigates through interactive buttons and controls |
| `Space` | Checkbox focused | Toggles task between active and completed |

---

## Data Structure

Each task is persisted in `localStorage` (`taskflow_tasks`) using the following schema:

```json
{
  "id": "task_1726217400000_a8f9x2",
  "title": "Complete internship project",
  "completed": false,
  "createdAt": 1726217400000
}
```

---

## Browser Compatibility

TaskFlow has been tested and verified to work flawlessly on modern versions of:

- **Google Chrome** (v110+)
- **Microsoft Edge** (v110+)
- **Mozilla Firefox** (v110+)
- **Apple Safari** (v16+)

---

## Author

**KHAN SAHEEM**  
- **GitHub**: [https://github.com/khansaheem786](https://github.com/khansaheem786)  
- **Internship**: Full Stack Development Intern

---

## License

This project is open source and available under the [MIT License](LICENSE).
