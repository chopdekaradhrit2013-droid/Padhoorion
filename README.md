# PadhoOrion 🧡

A complete, production-ready school-wide notes-sharing and student homework community platform built with **Next.js 14**, **Prisma**, **SQLite**, and **Tailwind CSS**.

Styled with the **Claude Remix** theme from [21st.dev/@priyalove920/themes/claude-remix-1782959216691](https://21st.dev/@priyalove920/themes/claude-remix-1782959216691).

---

## 🎨 Color Palette: Claude Remix (`@priyalove920`)

PadhoOrion strictly integrates the Claude Remix design tokens:

- **Background:** `#faf9f5` (Warm Ivory Paper Canvas)
- **Foreground:** `#3d3929` (Rich Warm Charcoal Bronze Text)
- **Card:** `#ffffff` / `#faf9f5` with `#dad9d4` Border
- **Card Foreground:** `#141413`
- **Primary / Brand:** `#c96442` (Iconic Claude Terracotta / Burnt Sienna Orange)
- **Primary Hover:** `#b05536`
- **Secondary:** `#e9e6dc` (Warm Oatmeal Stone)
- **Secondary Foreground:** `#535146`
- **Muted:** `#ede9de` (Soft Sand)
- **Muted Foreground:** `#83827d`
- **Accent:** `#e9e6dc`
- **Accent Foreground:** `#28261b`
- **Border / Input:** `#dad9d4` & `#b4b2a7`
- **Ring:** `#c96442`
- **Sidebar:** `#f5f4ee` (Warm Cream Sidebar with `#dad9d4` Border)
- **Radius:** `0.5rem` (8px)

### Grade-Level Badges
- **6th Grade:** Sage Olive (`bg-[#edf3e8] text-[#34532b] border-[#cfe0c7]`)
- **7th Grade:** Warm Clay (`bg-[#f7efe9] text-[#9c4c2c] border-[#ebd4c7]`)
- **8th Grade:** Claude Terracotta (`bg-[#faece7] text-[#c96442] border-[#f0c8ba]`)
- **9th Grade:** Soft Lilac (`bg-[#f2effb] text-[#5e4db2] border-[#ded7f4]`)
- **10th Grade:** Ochre Amber (`bg-[#f9f3e4] text-[#855e1d] border-[#ede1c3]`)

---

## 🚀 Key Features

### 1. User Authentication & Identity
- **Registration:** Username, Email, Password, Confirm Password, optional Profile Picture (or automatic avatar displaying first initial), and **mandatory Grade selection** (6th to 10th Grade).
- **Password Visibility Toggle:** Show/hide password on login and registration.
- **Email Verification:** Token-based verification and instant one-click verification status.
- **Forgot Password Flow:** Secure password reset request and token verification.
- **Persistent Sessions:** Secure HTTP-only cookies with JWT verification (`jose`).
- **Public Grade Tag Everywhere:** Student's grade is displayed beside their username wherever their identity appears (e.g. `Adhrit [7th Grade]`).

### 2. Main Dashboard
- **Announcements Section:** Prominently featured banner at the top of the homepage with priority levels (`NORMAL`, `HIGH`, `URGENT`).
- **Welcome Banner:** Personalized welcome message with student name and grade tag.
- **Global Search:** Multi-faceted search bar for resources, topics, chapters, and users.
- **Grade Navigation Cards:** Quick-access cards for all 5 school grades with live file counts.
- **Recently Uploaded:** Real-time feed of newest study materials.
- **Popular Resources:** Ranked by downloads and likes.
- **Recently Active Discussions:** Threaded conversation previews.

### 3. Open Grade System & 5 Categories
- **5 Grades:** `6th Grade`, `7th Grade`, `8th Grade`, `9th Grade`, `10th Grade`.
- **Open Access Rule:** A student's selected grade does **not** restrict their access. Any student can view, comment, download, and upload to any grade.
- **5 Categories Inside Every Grade:**
  1. **Notebook** (Class lecture copies, lesson logs)
  2. **Worksheet** (Practice problems, numerical assignments)
  3. **Handwritten Notes** (Neat student-authored revision copies)
  4. **AI Notes** (Summaries, mindmaps, formula sheets)
  5. **Q&A** (Solved exam papers, textbook solutions)

### 4. Upload System with Mandatory Confirmation Modal
- **Fields:** Title, description, grade selector, category selector, subject, chapter, topic, file attachment (PDF and images up to 25MB), optional tags.
- **Pre-Publish Confirmation Modal:**
  - Displays prompt: *"Are you sure you want to upload this resource?"*
  - Shows exact destination: `[Selected Grade] → [Selected Subject] → [Selected Category]`
  - Buttons: `Yes, Upload` and `No, Go Back`. Nothing is published without confirmation.

### 5. Comments & Threaded Discussion System
- Add comments and nested replies.
- Author identity with mandatory grade tag (e.g. `Adhrit [7th Grade]`).
- Comment deletion (by author or admin).
- **Pre-Publish Comment Confirmation Modal:**
  - Displays prompt: *"Are you sure you want to post this comment here?"*
  - Shows destination resource title and grade.
  - Buttons: `Yes, Post` and `No, Go Back`.

### 6. Academic Grade Progression (Requirement 8)
- Students can advance their profile grade in **Settings** (e.g. `7th Grade → 8th Grade`).
- Updates their live grade tag across the platform.
- Preserves all historical uploads, comments, and replies with their original publication grade snapshot (`authorGradeAtPublish`).
- Logs a timeline activity record for grade progression.

### 7. Social Features
- Like / unlike resources with live counters.
- Bookmark / unbookmark resources with dedicated `/bookmarks` view.
- Real file downloads with download counter tracking.
- Report inappropriate resources or comments with moderation categories.
- In-app notification center for comments, replies, and school announcements.

### 8. Admin Moderation Console (`/admin`)
- Accessible strictly to users with `role === "ADMIN"`.
- Real-time system metrics (Users, Resources, Comments, Reports, Active Announcements).
- Registered Users Table: search users, view grades, **Ban / Unban** toggle.
- Content Moderation: delete inappropriate uploads, delete inappropriate comments.
- Report Review Queue: view reason, reporter, target resource/comment, and resolve or dismiss.
- Announcement Broadcaster: create announcements with **6 duration options** (`1 hour`, `12 hours`, `24 hours`, `7 days`, `30 days`, `Forever`), delete announcements.

---

## 🔑 Demo Accounts for Immediate Testing

You can use the one-click demo login buttons on the login page, or log in with these credentials:

| Role | Username / Identifier | Password | Grade |
|---|---|---|---|
| **Student** | `Adhrit` | `Student@123` | `7th Grade` |
| **Student** | `aarav_sharma` | `Student@123` | `9th Grade` |
| **Student** | `ananya_m` | `Student@123` | `8th Grade` |
| **Student** | `rohan_gupta` | `Student@123` | `10th Grade` |
| **Student** | `diya_patel` | `Student@123` | `6th Grade` |
| **Administrator** | `principal_orion` | `Admin@123` | `10th Grade` (ADMIN) |

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite via Prisma ORM (`prisma/dev.db`)
- **Authentication:** Salted bcrypt hashing & signed JWT cookies (`jose`)
- **Styling:** Tailwind CSS with custom Vintage Paper design tokens & responsive drawer
- **Icons:** Lucide React
- **Validation:** Server-side + client-side input validation and file-type verification

---

## 🏃 Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync database and generate seed:**
   ```bash
   npx prisma db push
   node prisma/generate-samples.js
   node prisma/seed.js
   ```

3. **Start the application:**
   ```bash
   npm run build
   npm start
   ```
   Or run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run End-to-End Tests:**
   ```bash
   node test-e2e.js
   ```

