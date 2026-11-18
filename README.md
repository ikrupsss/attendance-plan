# ATTENDANCE PLAN 📚
> **Stay ahead of every class.**

A mobile-first attendance tracking web application built specifically for Android Chrome and personal productivity. Designed with a soft lavender and cream aesthetic, pastel mint accents, rounded cards, and zero external database dependencies. All attendance records, timetable configurations, and settings persist securely in your browser's `localStorage`.

---

## 🚀 Key Features

1. **Daily Attendance Update (Central Workflow)**:
   - Designed for daily check-in at 7:30 PM.
   - Automatically detects subjects scheduled for today from the Division C1 timetable.
   - Individual period marking: **Attended**, **Missed**, or **Not Conducted** (cancelled).
   - Multi-period lab support (e.g. 2-period lab counts accurately).
   - "Attended everything today" one-tap shortcut.
   - Instant dashboard recalculation and friendly toast confirmations.
   - Re-editing support without duplicate counting.

2. **Precise Mathematical Calculation Engine**:
   - Current Attendance: $\frac{\text{Present}}{\text{Present} + \text{Absent}} \times 100$
   - Projected Attendance: $\frac{\text{Present} + \text{Remaining}}{\text{Conducted} + \text{Remaining}} \times 100$
   - Future Absence Allowance: Exact integer calculation of maximum classes that can still be missed while maintaining $\ge 75\%$ and $\ge 70\%$.
   - Deficit recovery calculation: Number of consecutive classes needed to return to $\ge 75\%$.
   - Special handling for Professional Communication (PC): Monitored without strict 75% warning.

3. **Division C1 Timetable & Academic Calendar**:
   - Initial semester window: **17 November 2026 – 7 December 2026**.
   - Timetable covering all 7 subjects (Maths, Chemistry, PC, C Programming, DED, BEE, Social Innovation).
   - Sunday holidays and normally off Saturdays.
   - 27 November 2026: Kannada Rajyotsava university holiday.
   - Working Saturday: Follows Friday's timetable.
   - Fully editable timetable: Add/edit periods, times, and types (lecture vs. lab).

4. **Visual Attendance History**:
   - Monthly calendar matrix with color badges:
     - 🟢 **Green**: Fully attended day
     - 🟡 **Yellow**: Partial attendance
     - 🔴 **Red**: Missed classes
     - ⚪ **Grey**: Holiday / unconducted
   - Search & filter past records by subject or attendance status.
   - 1-tap past date editor.

5. **What-If Simulation Sandbox**:
   - Test "What if I miss $X$ classes?" or "What if I attend $Y$ classes?".
   - Non-destructive: Calculations run in isolated memory without touching saved records.

6. **Local Backup & Data Portability**:
   - Automatic local storage saves.
   - **Export Backup**: Downloads full configuration and logs as a portable `.json` file.
   - **Import Backup**: Restores records with strict schema validation.
   - **Reset Application**: Returns to the 17 Nov baseline.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom lavender & cream design tokens)
- **Icons**: Lucide React
- **Storage**: Browser `localStorage` (Zero external databases, no Supabase/Firebase)
- **Deployment**: Vercel

---

## 📱 How to Deploy to GitHub & Vercel

### Step 1: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `attendance-plan`.
2. In your local terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Attendance Plan mobile web application"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/attendance-plan.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Locate `attendance-plan` in your GitHub repository list and click **"Import"**.
4. Leave all build settings as standard defaults:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Click **"Deploy"**. Vercel will build and assign you a live HTTPS URL (e.g. `https://attendance-plan.vercel.app`).

---

## 📲 Add to Android Chrome Home Screen

1. Open your live Vercel URL in **Chrome on your Android phone**.
2. Tap the three-dot menu (**⋮**) in the top right corner of Chrome.
3. Select **"Add to Home screen"** (or **"Install application"**).
4. Tap **Add**.
5. The ATTENDANCE PLAN icon will appear on your home screen. Tapping it opens the tracker in full-screen standalone mode without URL bars, providing an authentic native app experience!

---

## 🔒 Privacy & Storage Note

> **Important**: All attendance records and settings are stored locally in your browser's `localStorage`. Export backups regularly from the **Settings** tab. Clearing your browser cache or switching devices will not carry over data unless imported via backup JSON.
