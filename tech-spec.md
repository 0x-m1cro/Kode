

# 📜 Master Technical Specification: "Project Lovable-Enterprise"

This document serves as the "Source of Truth" for the engineering team. It describes the data structures, API contracts, and core logic for the entire platform.

-----

## 🏗️ 0. Global Architecture & Stack

**Core Principle:** "Thick Client, Thin Server."
The browser does the heavy lifting (compiling, rendering, file management) to minimize server costs. The server acts only as an orchestrator for AI and Database.

  * **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Shadcn UI.
  * **State Management:** `UseQuery` (Server State) + `Zustand` (Local UI State).
  * **Editor Engine:** Monaco Editor (`@monaco-editor/react`).
  * **Runtime:** WebContainers API (Node.js in browser).
  * **Database:** Supabase (PostgreSQL 15 + pgvector).
  * **AI:** Anthropic Claude 3.5 Sonnet (via Vercel AI SDK).

-----

## 🛠️ Phase 1 Spec: The Runtime Engine (Weeks 1-3)

*Objective: Boot a Node.js environment in the browser and enable bidirectional file editing.*

### 1.1 Security Configuration (Critical)

WebContainers require **Cross-Origin Isolation**. You must configure `next.config.js` headers or the application will not boot.

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};
```

### 1.2 The Virtual File System (VFS) Store

Do not rely on React State for the file system. Use a global store to prevent re-renders on every keystroke.

**Data Structure: `FileMap`**

```typescript
type FileNode = {
  type: 'file' | 'folder';
  content?: string; // Only for files
  children?: string[]; // IDs of children (for folders)
  isOpen: boolean;
  isUnsaved: boolean;
};

type FileSystemState = Record<string, FileNode>; // Key = absolute path
```

### 1.3 The WebContainer Singleton

Refer to the code provided in the previous turn.

  * **Boot Logic:** Check `if (instance) return instance`.
  * **Mounting:** On load, fetch `project_files` from Supabase and map them to `FileMap`, then call `webcontainerInstance.mount(tree)`.

-----

## 🧠 Phase 2 Spec: The AI Orchestrator (Weeks 4-6)

*Objective: Move from "Chatbot" to "Coding Agent" that can read, plan, and edit specific files.*

### 2.1 The Agent State Machine

The AI is not a single call. It is a loop using **Vercel AI SDK Core**.

1.  **Input:** User Prompt + (Optional) Selected Code Snippet.
2.  **Context Retrieval (RAG):**
      * Generate embeddings for all file paths and simplified contents.
      * Query: "Find files relevant to [User Prompt]".
      * Select Top 5 files.
3.  **Prompt Construction:**
      * System Prompt must enforce **XML-based Tool Calling** (Claude 3.5 excels at this).

**System Prompt Strategy:**

```text
You are an expert Full Stack Engineer.
You have access to a file system.
To edit a file, output:
<edit_file path="src/components/Header.tsx">
  // ... code ...
</edit_file>

To run a command, output:
<run_command>npm install lucide-react</run_command>

NEVER output the full file unless requested. Use diffs or complete component rewrites for small files.
```

### 2.2 The "Diff Application" Engine (The Hardest Part)

When the AI streams code, you cannot just append it. You must parse the stream.

**Algorithm: Stream Parser**

1.  Listen to LLM stream.
2.  Detect opening tag `<edit_file path="...">`.
3.  Buffer content until `</edit_file>`.
4.  **Action:**
      * *If File Exists:* Overwrite (MVP approach) or Fuzzy Match Replace (Advanced). *Recommendation for Team of 5: Overwrite entire file for small components; use string replacement for large files.*
      * *If New File:* Create entry in `FileMap` -\> Call `webcontainer.fs.writeFile`.

-----

## 🗄️ Phase 3 Spec: Platform Data & Auth (Weeks 7-9)

*Objective: User management, Project persistence, and Backend provisioning.*

### 3.1 Database Schema (Supabase)

**Table: `profiles`**

  * `id` (uuid, PK, refs auth.users)
  * `tier` (enum: 'free', 'pro')
  * `credits` (int)

**Table: `projects`**

  * `id` (uuid, PK)
  * `owner_id` (uuid, refs profiles)
  * `name` (text)
  * `description` (text)
  * `created_at` (timestamptz)

**Table: `files` (Persistence Layer)**

  * `id` (uuid)
  * `project_id` (uuid, refs projects)
  * `path` (text) - e.g., "src/app/page.tsx"
  * `content` (text)
  * `updated_at` (timestamptz)

*Note: You do not save to DB on every keystroke. Implement a "Debounced Save" (every 5s) or "Save on Run" trigger.*

### 3.2 Backend Provisioning (Supabase Management API)

When a user needs a database for their *generated app*:

1.  **Trigger:** User asks "Add a database."
2.  **API Call:** Backend calls Supabase Management API (`POST /v1/projects`).
3.  **Wait:** Poll for status `ACTIVE` (takes \~60s).
4.  **Inject:** Retrieve `db_url` and `anon_key`.
5.  **Action:** Write to `.env.local` in the WebContainer.

-----

## 🚀 Phase 4 Spec: Deployment & Export (Week 10)

*Objective: Get the code out of the browser.*

### 4.1 GitHub Sync (OAuth App)

1.  **Register:** Create a GitHub OAuth App.
2.  **Scopes:** Request `repo` and `workflow`.
3.  **Library:** Use `isomorphic-git` to run git commands *inside* the browser/WebContainer.
      * *Why?* It keeps credentials client-side and avoids sending the whole codebase to your server to push.

### 4.2 Netlify/Vercel Deploy

1.  **API:** Use the Vercel API `POST /v13/deployments`.
2.  **Payload:** You must zip the `FileMap` content.
3.  **Constraint:** Vercel API has a payload limit.
      * *Alternative:* Push to GitHub first (4.1), then trigger a Vercel import from that Repo (standard GitOps workflow). **This is the recommended stable path.**

-----

