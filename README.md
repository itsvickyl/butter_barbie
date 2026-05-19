# Butter Barbies — CampusShare Platform

> **Hackathon Project for Ramaiah University Fest — Yugastra**

## Introduction

**Butter Barbies** is the team behind **CampusShare** — a community-driven academic resource sharing platform built for **Yugastra**, the annual university fest of **Ramaiah University**. This hackathon project tackles the problem of siloed study materials on campus.

Students spend hours hunting for notes, past papers, and solved assignments that already exist somewhere. CampusShare changes that by creating a **trusted, searchable, campus-specific repository** where contributors are recognized and rewarded, and seekers find what they need — fast.

---

## Problem Statement

Academic resources on campus are fragmented:
- **WhatsApp groups** have no search
- **Google Drive** links expire
- **Library systems** are bureaucratic
- **Existing platforms** (StudyLib, Scribd) aren't campus-specific and lack community trust

**CampusShare** bridges this gap with a platform built *by students, for students*.

## Project Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project scaffolding (React + Vite + Tailwind)
- [x] Supabase Auth integration
- [x] Responsive Glassmorphism UI
- [x] Fixed WebGL Background (LightPillar)

### ✅ Phase 2: Core Resources (Complete)
- [x] **Upload System**: Drag-and-drop file upload to Supabase Storage with metadata.
- [x] **Browse Page**: Filter by subject, semester, and type. Search functionality.
- [x] **Resource Details**: PDF preview, download tracking, and star ratings.
- [x] **Backend Integration**: Real-time data with Supabase Database.

### ✅ Phase 3: Community & Gamification (Complete)
- [x] **User Profiles**: Track uploads, downloads, and points.
- [x] **Leaderboard**: Top contributors ranked by engagement points.
- [x] **Gamification**: +10 points for uploads, +2 for downloads (to uploader), +1 for ratings.

### 🚧 Phase 4: Polish & Deploy (In Progress)
- [ ] Final UI/UX refinements
- [ ] Performance optimization
- [ ] Deployment to Vercel/Netlify

---

## Key Features

### Must-Have (Core MVP)
- User registration & login (Supabase Auth)
- Upload resources with metadata (subject, semester, type)
- Browse & filter by subject / semester / type
- Download resources
- Keyword search
- Resource detail pages
- Recognition points & rewards system for contributors

### Should-Have (High Value)
- User profile page with upload history and points display
- Contributor leaderboard (top contributors by points)
- Sort by: newest / most downloaded
- Preview PDF in-browser
- File type filter (PDF, DOCX, etc.)

### Nice-to-Have
- Bookmarking / saved resources
- Comment threads on resources
- Share via link / QR code

---

## Tech Stack

| Layer          | Technology                          |
|---------------|-------------------------------------|
| **Frontend**   | React + Vite + TailwindCSS        |
| **Backend**    | Supabase (BaaS)                   |
| **ORM**        | Prisma ORM                        |
| **Database**   | Supabase PostgreSQL               |
| **File Storage** | Supabase Storage                |
| **Auth**       | Supabase Auth                     |
| **Search**     | PostgreSQL Full-Text Search       |
| **Deployment** | Vercel (Frontend) + Supabase (Backend) |

---

## Architecture

```
+------------------------------+
|    Browser / React SPA       |
+-------------+----------------+
              |
              v
+------------------------------+
|   Supabase Client SDK        |
+-------------+----------------+
              |
              v
+----------+----------+--------+
| Auth     | Storage  | Search |
| Service  | Service  | (DB)   |
+----------+----------+--------+
              |
              v
+------------------------------+
|   Supabase PostgreSQL        |
|       (Prisma ORM)           |
+------------------------------+
```

---

## Recognition Points & Rewards System

CampusShare incentivizes contributions through a points-based recognition system. The more you share, the more you earn.

| Action                          | Points |
|--------------------------------|--------|
| Upload a resource              | +10    |
| Per download of your resource  | +2     |
| Per positive rating received   | +1     |
| Daily login streak (3+ days)   | +3     |

**How it works:**
- Points are tracked on each user's profile and displayed publicly
- A **Leaderboard** showcases the top contributors on campus
- Points accumulate over time, rewarding consistent contributors
- The system creates a positive feedback loop — contributors upload more because they see recognition

---

## Team — Butter Barbies

- **PradeepArjunSam** — Frontend & UI
- **hemantsaini404** — Backend & Database

Built for **Yugastra — Ramaiah University Fest**

---

## License

This project was created as part of a hackathon and is open for academic and educational purposes.

# butter_barbie
