---

## 🎨 UI/UX Design Specification: The Kode-Gamma IDE

### 1. General Design Philosophy & Fidelity

| Principle | Specification | Rationale |
| :--- | :--- | :--- |
| **Fidelity Target** | **1:1 Clone of Lovable.dev UI.** | Ensures rapid adoption by users familiar with modern code editors (VS Code) and maintains a professional, high-trust appearance. |
| **Foundation** | **Shadcn UI (Component Library) + Tailwind CSS.** | The AI model (Claude/GPT) is highly optimized to generate code using Tailwind, accelerating development. Shadcn provides high-quality, accessible components. |
| **Aesthetics** | **Default to Dark Mode.** | Standard for developer tools. A toggle for Light Mode must be available. |
| **Responsiveness** | **Mobile-First using Drawers/Panels.** | Essential for any modern web app. The complex three-pane view must be refactored for small screens. |

---

### 2. Design Tokens & Component Kit

Your team should establish the following token system to ensure consistency.

#### A. Color Palette
| Token Name | Usage | Value (Example, Dark Mode) |
| :--- | :--- | :--- |
| `--background` | Main IDE surface, file backgrounds. | `#09090b` (Black-A4) |
| `--foreground` | Main text, labels, icons. | `#fafafa` (White-A2) |
| `--primary` | Active file, active tab, primary buttons (e.g., "Deploy"). | `#10b981` (Emerald-500) |
| `--secondary` | Terminal background, utility buttons. | `#18181b` (Gray-800) |
| `--editor-bg` | Monaco Editor background. | `#000000` (Pure Black) |
| `--highlight` | AI-suggested code diff background. | `#1e3a8a` (Blue-800, 30% opacity) |

#### B. Typography
* **Font Family:** Use a crisp, monospaced font for the Editor/Terminal (e.g., **Fira Code, JetBrains Mono**). Use a clean sans-serif for the UI (e.g., **Inter, Geist Sans**).
* **Font Sizes:** Establish a clear scale (e.g., `text-xs` for status bar, `text-sm` for file tree/chat, `text-base` for primary content).

#### C. Spacing and Radius
* **Spacing Scale:** Use the Tailwind default scale (multiples of 4px).
* **Border Radius:** Use subtle rounding (`rounded-md` or `rounded-lg`) for buttons, panels, and input fields to maintain a modern, soft feel.

---

### 3. Desktop Layout Specification (Three-Pane View)

The desktop view is the primary work area and must maintain the classic IDE structure. 

| Pane | Function | Width Allocation (Base) |
| :--- | :--- | :--- |
| **Pane 1: Editor/Terminal (Left)** | File Tree (`15%`) + Monaco Editor + Terminal (`35%`). **Focus:** Code writing, file navigation, system commands. | **~50%** |
| **Pane 2: Live Preview (Center)** | IFrame rendering the WebContainer server URL. Must support full-screen toggle. **Focus:** Instant visual feedback. | **~30%** |
| **Pane 3: Chat/AI (Right)** | The primary interface for interacting with the AI Agent. Includes prompt input, history, and action buttons. | **~20%** |

**Interaction Details:**
* **Resizable Dividers:** All vertical dividers (`|`) between the three panes must be draggable to allow users to customize their workspace.
* **Status Bar (Bottom):** Must display `Project Status`, `LLM Status (Active/Idle)`, `Git Branch`, and `WebContainer Port`.

---

### 4. Mobile Layout Specification (Mobile-First Drawers)

On screen sizes below `768px` (iPad vertical or phone), the three-pane layout must collapse into a single main view with access via drawers (Shadcn `Drawer` component).

| Screen View | Main Content | Access Drawers |
| :--- | :--- | :--- |
| **Default View** | **Live Preview (Full Screen)** | This is the default state, prioritizing visual output. |
| **Code View** | **Monaco Editor (Full Screen)** | Accessed via a persistent footer tab/button labeled 'Code'. |
| **File/Terminal Access** | **Left Drawer** | Accessed via a hamburger menu icon. Contains the File Tree and Terminal. |
| **AI/Chat Access** | **Right Drawer/Panel** | Accessed via an AI icon (e.g., a sparkle). Contains the Chat Interface. |

**Interaction Detail:**
* **Persistent Footer:** A small, persistent toolbar at the bottom of the mobile view must contain icons for switching between **Preview, Code, and Chat** (drawers).

---

### 5. Component Specifics

#### A. Chat Interface (`<ChatInterface>`)
* **AI Responses:** Must use Markdown formatting for streamed code blocks.
* **Action Blocks:** When the AI suggests a file change, the response must be encapsulated in a visible card with **`Accept Changes`** and **`Undo/Discard`** buttons. This is crucial for the "Agentic" experience.
* **Context Indicator:** A small label must show which LLM model is active (e.g., "Powered by Claude 3.5").

#### B. File Tree (`<FileTree>`)
* **Structure:** Recursive, hierarchical list of files.
* **Icons:** Use **Lucide React** icons to visually distinguish file types (JS, TS, CSS, folder, image, etc.).
* **State:** Use a visual indicator (e.g., a dot or asterisk) next to a file name if the file has **unsaved human changes** or if the **AI has just modified it** (`--highlight` color).

---

