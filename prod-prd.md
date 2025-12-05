

# Production-Ready PRD: "Kode-Gamma Enterprise" (Lovable Clone)
**Version:** 2.0 (Final Production Spec)
**Status:** Approved for Execution
**Owner:** System Architect

## 1. Executive Summary
**Objective:** Transform the current chat-based MVP into an **Autonomous Full-Stack Development Platform**. The system must not just "output code" but **manage the lifecycle** of a user's application—from zero-shot generation to database provisioning, deployment, and iterative refactoring.

**Key Differentiator:** "The One-Click Promise." Users must never touch a CLI. The platform handles `npm install`, `git commit`, and database migrations transparently.

---

## 2. Core Modules & Functional Requirements

### Module A: The AI Orchestrator ("The Brain")
*Unlike a chatbot, this module has "hands" to manipulate the file system.*

* **FR-A1: Multi-Step Agent Loop:**
    * **Requirement:** The AI must not stream text blindly. It must execute a thought loop: `Plan` -> `Read Context` -> `Generate Action` -> `Verify` -> `Apply`.
    * **Tech Spec:** Implement **LangGraph** or **Vercel AI SDK Core**.
    * **Constraint:** Must support "Tool Use" (Function Calling) to execute file system operations (`writeFile`, `readFile`, `runCommand`).
* **FR-A2: Context-Aware Retrieval (RAG):**
    * **Requirement:** Token limits prevent sending the whole project. The system must dynamically fetch only relevant files based on the user's prompt.
    * **Tech Spec:** Client-side vector search (e.g., using `voy-search` or `tensorflow.js` embeddings) to query the local file tree before sending the prompt.
* **FR-A3: AST-Based Refactoring:**
    * **Requirement:** When a user says "Change the button color," the AI must not rewrite the entire file. It must locate the specific component and apply a surgical patch.
    * **Tech Spec:** Use `jscodeshift` or `ts-morph` for precise AST manipulation to avoid syntax errors during partial updates.

### Module B: The Interactive Workbench ("The Interface")
*The current MVP is static. The new Workbench must be a live OS in the browser.*

* **FR-B1: WebContainer Runtime (Critical):**
    * **Requirement:** Run Node.js directly in the browser. Zero server cost for user sandboxes.
    * **Tech Spec:** **WebContainers API**. Must support `npm install`, `npm run dev`, and Hot Module Replacement (HMR).
* **FR-B2: Visual DOM-to-Code Sync:**
    * **Requirement:** "Click to Edit." Users can click an element in the Live Preview, and the Editor must highlight the corresponding code line.
    * **Tech Spec:** Inject a `data-locator-id` (Babel plugin) during the build process to map DOM elements back to source files.
* **FR-B3: State Synchronization:**
    * **Requirement:** If the AI writes to a file while the user is typing in it, changes must merge without conflict.
    * **Tech Spec:** **Y.js** (CRDTs) over WebSockets to manage shared state between the Human User and the AI Agent.

### Module C: Platform Infrastructure ("The Backend")
*Lovable provisions real backends. You cannot mock this.*

* **FR-C1: Automated Supabase Provisioning:**
    * **Requirement:** When a user asks for "Auth" or "Database," the system must programmatically create a Supabase project via the Management API.
    * **Output:** Inject `SUPABASE_URL` and `SUPABASE_ANON_KEY` directly into the WebContainer's `.env` file.
* **FR-C2: GitHub Sync:**
    * **Requirement:** One-click push to a new GitHub repository.
    * **Tech Spec:** GitHub App integration. OAuth flow -> `POST /repos` -> `git push` from inside the WebContainer (using `isomorphic-git`).
* **FR-C3: Deployment Pipeline:**
    * **Requirement:** "Publish to Live URL."
    * **Tech Spec:** Integration with **Netlify API** or **Vercel API**. Trigger a build and return the live URL to the chat interface.

---

## 3. User Experience (UX) Flow
**The "Magic" Moment:**
1.  **Prompt:** User types: *"Build a CRM with a dark mode dashboard."*
2.  **Plan:** Agent responds: *"I'm creating a Next.js project. I'll set up `dashboard/page.tsx` and a `components/Sidebar.tsx`."*
3.  **Action:** User sees files appearing in the file tree in real-time.
4.  **Boot:** The terminal auto-runs `npm install`. A spinner shows "Booting Dev Server...".
5.  **Live:** The Preview pane snaps to life with the working app.
6.  **Refine:** User clicks the sidebar in the preview: *"Make this blue."* -> The app hot-reloads instantly.

---

## 4. Technical Architecture Blueprint



### Stack Definition
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | Performance and server actions. |
| **Editor Component** | **Monaco Editor** | The VS Code standard. Best performance. |
| **Runtime Engine** | **WebContainers (Node.js)** | Runs user code in-browser. No backend compute cost. |
| **AI Model** | **Claude 3.5 Sonnet** | Currently SOTA for coding tasks (beats GPT-4o). |
| **Orchestration** | **Vercel AI SDK + LangChain** | Manages the agent state and tool calling. |
| **Database** | **Supabase (Postgres)** | Platform data & User App data. |
| **Styling** | **Tailwind CSS** | AI models are highly optimized for Tailwind class generation. |

---

## 5. Security & Risk Management

### Risk: Malicious Code Execution
* **Problem:** A user (or hallucinating AI) writes `rm -rf /` or a crypto miner script.
* **Mitigation:** WebContainers run in a browser sandbox. They cannot access the host machine's OS.
* **Policy:** Add a `headers` security layer (COOP/COEP) to ensure strict isolation.

### Risk: API Key Abuse
* **Problem:** Users draining your LLM credits.
* **Mitigation:**
    1.  **Hard Limits:** 50 messages/day per free user.
    2.  **Rate Limiting:** Redis-based sliding window limiter on the `/api/chat` endpoint.
    3.  **Billing:** Stripe integration for "Pro" tier (metered usage).

---

## 6. Phased Implementation Roadmap

### Phase 1: The "Engine" (Weeks 1-3)
* **Goal:** A working Monaco Editor that boots a Hello World React app via WebContainers.
* **Deliverable:** No AI yet. Just manual file editing + Live Preview.

### Phase 2: The "Brain" (Weeks 4-6)
* **Goal:** Connect Claude 3.5. Implement the "Apply Agent" that writes files.
* **Deliverable:** Chat-to-Code pipeline. User prompts -> File System updates.

### Phase 3: The "Platform" (Weeks 7-9)
* **Goal:** Supabase & GitHub integration.
* **Deliverable:** Users can sign up, save projects, and push code to their own GitHub.

### Phase 4: Polish & Launch (Week 10)
* **Goal:** UI/UX refinement. "Visual Edits" mode. Stripe Billing.
* **Deliverable:** Production Release.

---

