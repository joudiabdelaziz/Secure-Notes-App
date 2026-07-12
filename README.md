# SecureNotes — End-to-End Encrypted Note-Taking Application

SecureNotes is a university web-development project implementing a production-grade, zero-knowledge, end-to-end encrypted note-taking application. Every note body is encrypted client-side in the browser using the native Web Crypto API before hitting the network or being stored in the database. Even a compromised database or malicious server operator cannot read the contents of your notes.

---

## 🔒 Security & Encryption Model

### 1. Key Derivation (PBKDF2)
- **Algorithm:** PBKDF2 (Password-Based Key Derivation Function 2) with SHA-256.
- **Iterations:** 310,000 (compliant with NIST guidelines to prevent brute-force attacks).
- **Salt:** Derived deterministically from the user's Supabase UUID and an application-specific namespace suffix:
  `salt = TextEncoder().encode(userId + ":secure-notes-v1")`
  This ensures the salt is unique per user (since UUIDs are unique) and repeatable across sessions/devices without needing to store a plaintext salt in the database.
- **Output:** A 256-bit AES CryptoKey.

### 2. Encryption/Decryption (AES-GCM)
- **Algorithm:** AES-GCM (Galois/Counter Mode) with 256-bit keys.
- **Initialization Vector (IV):** A cryptographically random 96-bit (12-byte) IV is generated for *every single note save operation* using `crypto.getRandomValues()`. IV reuse is completely prevented.
- **Database Storage:** Only the base64-encoded ciphertext and base64-encoded IV are sent to and stored in the database. The plain text body never leaves the browser.
- **Authentication:** AES-GCM is an authenticated encryption mode. It validates the integrity of the note upon decryption; any tempering of the ciphertext will fail authentication and throw a `DecryptionError`.

### 3. In-Memory Key Store
- The derived CryptoKey is stored exclusively in a module-level variable singleton (`lib/crypto/key-store.ts`).
- **Why not `localStorage` or `sessionStorage`?** Storing keys in browser storage makes them vulnerable to XSS (Cross-Site Scripting) attacks that can dump storage. Storing the key in-memory ensures it is completely lost when the tab is closed or the page refreshed, forcing a re-entry of the passphrase.
- **Passphrase Setup & Unlock:** First-time users are prompted to set their passphrase. On subsequent visits or tab returns, the app checks for the in-memory key and displays an unlock modal if it is absent, verifying the entered passphrase by attempting to decrypt a note.

### 4. Honest Security Tradeoffs
- **Cleartext Titles:** Note titles are stored as cleartext to enable fast listing, categorization, and client-side searching. Users must avoid putting highly sensitive information in note titles.
- **Forgotten Passphrase:** Because encryption is zero-knowledge and client-side, **if you lose your passphrase, your notes are permanently unrecoverable.** Neither the database admin nor the app operators can reset your passphrase or recover your notes.
- **No Passphrase Change:** Passphrase rotation is not supported in V1, as it would require decrypting and re-encrypting all notes with the new key in a single browser session.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript (Strict Mode), Tailwind CSS v4 (CSS-first design tokens), `clsx`, `tailwind-merge`
- **Backend:** Next.js Server Actions (for mutations) and REST Route Handlers (for API consumers)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Validation:** Zod (Single source of truth schemas imported client & server side)
- **Icons & UI:** Custom modern layout with dot-grid pattern, glassmorphism, responsive navigation drawer, and React Hot Toast notifications.

---

## 🗃 Database Schema & Row Level Security (RLS)

The database schema resides in `supabase/migrations/001_initial_schema.sql` and includes the following schema definition:

```sql
create table if not exists folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  name       text not null check (char_length(name) between 1 and 100),
  created_at timestamptz default now() not null
);

create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  folder_id  uuid references folders on delete set null,
  title      text not null check (char_length(title) between 1 and 300),
  ciphertext text not null,
  iv         text not null,
  tags       text[] default '{}' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table folders enable row level security;
alter table notes   enable row level security;

-- Row Level Security Policies
create policy "Users manage their own folders"
  on folders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own notes"
  on notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### RLS Isolation Verification
- **Cross-User Protection:** Every database request is implicitly filtered by Postgres RLS using the JWT payload (`auth.uid()`). A user attempting to query or guess notes belonging to another user will receive `404 Not Found` (0 rows returned) instead of data.
- **Server Enforcement:** Server Actions and Route Handlers always ignore the user ID provided by client payloads, inserting `auth.uid()` from the authenticated server session to prevent user impersonation.

---

## 📁 File Structure

```
secure-notes-app/
├── app/
│   ├── layout.tsx                    # Root layout, Inter font, metadata, Toaster
│   ├── page.tsx                      # Landing page with hero, features, security model
│   ├── error.tsx                     # Root error boundary
│   ├── not-found.tsx                 # 404 page
│   ├── globals.css                   # Tailwind v4 directives + custom tokens
│   ├── (auth)/
│   │   ├── layout.tsx                # Centered glow card layout
│   │   ├── login/page.tsx            # Login form
│   │   └── signup/page.tsx           # Signup form + strength meter
│   ├── (app)/
│   │   ├── layout.tsx                # Main app panel layout with Sidebar
│   │   ├── notes/
│   │   │   ├── page.tsx              # Notes panel list with dynamic query search
│   │   │   ├── loading.tsx           # Skeletons
│   │   │   ├── error.tsx
│   │   │   ├── new/page.tsx          # NoteEditor wrapper
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # NoteEditor details
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   └── folders/
│   │       ├── page.tsx              # FolderManager wrapper
│   │       ├── loading.tsx
│   │       └── error.tsx
│   └── api/                          # REST API Handlers
│       ├── notes/route.ts
│       ├── notes/[id]/route.ts
│       ├── folders/route.ts
│       └── folders/[id]/route.ts
├── components/
│   ├── ui/                           # Button, Input, Textarea, Modal, Badge, Spinner, EmptyState
│   ├── notes/                        # NoteCard, NoteList, NoteEditor
│   ├── folders/                      # FolderManager, CreateFolderModal
│   ├── auth/                         # LoginForm, SignupForm
│   ├── crypto/                       # PassphraseSetupModal, PassphraseUnlockModal
│   └── layout/                       # Sidebar
├── lib/
│   ├── supabase/                     # client.ts, server.ts, middleware.ts
│   ├── crypto/                       # encryption.ts, key-derivation.ts, key-store.ts, utils.ts
│   ├── validation/                   # auth.ts, notes.ts, folders.ts
│   ├── actions/                      # notes.ts, folders.ts (Server Actions)
│   └── utils.ts                      # cn(), formatRelativeDate(), etc.
├── types/                            # database.ts, notes.ts, folders.ts
├── middleware.ts                     # Auth session refresh & protected routes redirect
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql    # Database migration script
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Clone and Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and copy the contents of `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
1. Create a project in your **Supabase Dashboard**.
2. Go to **SQL Editor** → **New Query**.
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` and run the script. This creates the tables, enabling Row Level Security (RLS), triggers, and query indexes.

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Audit Commands

Run the type check and linter to verify code safety and clean state:

```bash
# Type Check (TypeScript strict compiler checks)
npm run type-check

# Lint Check
npm run lint

# Build Check (runs tsc and compiles code under Turbopack)
npm run build
```
