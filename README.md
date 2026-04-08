<div align="center">
  <h1>BitByBit</h1>
  <p>
    <a href="https://bitbybit-plan.vercel.app/"><b>Website</b></a> ｜
    <a href="#features"><b>Features</b></a> ｜
    <a href="#tech-stack"><b>Tech Stack</b></a> ｜
    <a href="#page-flow"><b>Page Flow</b></a> ｜
    <a href="#state-management"><b>State Management</b></a> ｜
    <a href="#demo"><b>Demo</b></a>
  </p>
</div>

## Installation

BitByBit is a 12-week goal tracking system that turns vague ambitions into actionable roadmaps.

Based on the "12-Week Year" methodology, Break down big goals into executable daily tasks using a 12-week cycle framework. Drag-and-drop scheduling, progress tracking, and weekly reviews build a continuous improvement loop.

![Responsive devices](public/readme/responsive_devices.png)

## Features

- 12-Week Cycle Tracking: Transform long-term visions into actionable 12-week plans with visual progress tracking (W1–W12).

- Strategic Task Hierarchy: Organize goals with nested task structures and Eisenhower Matrix prioritization (Urgent vs. Important).

- Interactive Weekly Planner: Seamlessly schedule tasks via drag-and-drop calendar, optimized for both desktop and mobile.

- Analytics & Reflection: Monitor growth with real-time dashboards and structured weekly reviews to track execution and mood.

- Smart Sync & Alerts: Stay consistent with automated task notifications and secure Google OAuth integration.

## Tech Stack

| **Category**           | **Technique**                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**           | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **UI Library**         | ![Shadcn UI](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff&style=for-the-badge) ![Lucide-icons](https://img.shields.io/badge/Lucide-icons-dc5a5a?style=for-the-badge)                                                                                                                                                                                                                                              |
| **Drag & Drop**        | ![@Dnd-Kit](https://img.shields.io/badge/@dnd_kit-000000?style=for-the-badge)                                                                                                                                                                                                                                                                                                                                                                 |
| **State Management**   | ![React Context API](https://img.shields.io/badge/React%20Context%20API-888?style=for-the-badge) ![Custom Hooks](https://img.shields.io/badge/Custom%20Hooks-888?style=for-the-badge) ![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge)                                                                                                                                                                             |
| **Backend / Database** | ![Supabase](https://img.shields.io/badge/Supabase-000000?style=for-the-badge&logo=supabase&logoColor=white) ![Supabase-Auth](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=for-the-badge)                                                                                                                                                                                                                                           |
| **Version Control**    | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=gitHub&logoColor=white)                                                                                                                                                                                                                                            |
| **Deployment**         | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)                                                                                                                                                                                                                                                                                                                                         |

## Page Flow

```mermaid
graph TD
    A[Landing Page] -->|Public| B{Auth Gate}
    B -->|Not logged in| C[ /auth ]
    C -->|Login / Google OAuth| D[Supabase Auth]
    D -->|Auth State Change| E[ /dashboard ]

    subgraph Protected_Routes [Dashboard Layout]
        E --> F[ /cycles ]
        E --> G[ /goals ]
        E --> H[ /tasks ]
        E --> I[ /history ]
        E --> J[ /profile ]
    end

    subgraph Tasks_Tab_Navigation [Tasks Sub-views]
        H --> H1[ /week ]
        H --> H2[ /today ]
        H --> H3[ /board ]
        H --> H4[ /matrix ]
        H --> H5[ /review ]
    end

    E -.->|Mobile Check| K{isMobile?}
    K -->|Yes| L[Sidebar Auto-collapse]
```

## State Management

```mermaid
graph LR
    subgraph Data_Source ["Supabase / Backend"]
        DB[(PostgreSQL)]
        AU[Auth Service]
    end

    subgraph Custom_Hooks ["Data Layer / Hooks"]
        H1[useAuth]
        H2[useCycles]
        H3[useGoals]
        H4[useTasks]
    end

    subgraph Zustand_Stores ["Zustand (State Management)"]
        direction TB
        S1["authStore / Context<br/>(profileName, user)"]
        S2["cycleStore<br/>(cycles list)"]
        S3["goalStore<br/>(goals list)"]
        S4["taskStore<br/>(tasks, taskInstances list)"]
        S5["uiStore<br/>(offcanvas, modal,<br/> weekStart, profileName)"]
    end

    DB -->|Fetch| H2 & H3 & H4
    AU -->|onAuthStateChange| H1

    H1 --> S1
    H2 --> S2
    H3 --> S3
    H4 --> S4

    S1 & S2 & S3 & S4 & S5 -->|Selector| UI[UI Components]
    UI -->|Dispatch Actions| S1 & S2 & S3 & S4 & S5
```

- **React Context (AuthContext)：** Auth state is pushed by Supabase onAuthStateChange — no manual actions needed, making Context the right fit.
- **Zustand Store：** All other data states require manual updates; uiStore.currentWeekStart ensures week/board/review pages stay in sync across navigation.

## Demo

### Cycle Management

- Create 12-week execution plans with name and vision.
- Status flow: Planning → Active → Completed.
  ![Demo](public/readme/createCycle.gif)

### Goals & Task Management

- Nested goal-task structure with core/extra task categories.
- Four-quadrant priority (Urgent × Important matrix).
- Configurable frequency (daily / N times per week) and execution weeks.
  ![Demo](public/readme/createGoal.gif)

### Weekly View (Drag & Drop Scheduling)

- Side-by-side task list + weekly calendar.
- Drag tasks to specific time slots — Pointer Events for precise drop position.
- Resize CalendarEvent blocks to adjust duration.
- Mobile: tap + Offcanvas scheduling, shared business logic.
  ![Demo](public/readme/weekly_RWD.gif)

### Today View

- Automatically filters your weekly schedule to surface today’s tasks, keeping your focus strictly on immediate priorities.
  ![Demo](public/readme/today_tasks.gif)

### Task Board & Matrix

- Kanban with 4 columns: Unscheduled / Expired / In Progress / Completed
- "Move to Next Week" action for expired tasks.
- Drag matrix cards to change priority, syncs to Goals page instantly.
  ![Demo](public/readme/expired_tasks.gif)
  ![Demo](public/readme/change_priority.gif)

### Weekly Review

- Multi-field review form: Execution / Learning / Reflection / Mood rating.
- Unlocks on Sunday; past weeks can be back-filled.
- Review count synced to Dashboard stats.
  ![Demo](public/readme/review.gif)

### Cycle Retrospective

- Review your execution across the full 12-week cycle with detailed weekly completion rates. Features color-coded performance benchmarks for intuitive, at-a-glance progress analysis.
  ![Demo](public/readme/history.gif)
