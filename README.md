# 🏆 Feedants - National Dance Competition & Audition Platform

A full-stack mobile application and backend API built for managing large-scale dance competitions, team registrations, audition video uploads via **Cloudinary**, and automated applicant acceptance notifications via **Resend Email Service**.

---

## 📱 Project Overview

Feedants provides an end-to-end competition workflow for both **performers/dance crews** and **event organisers**:

1. **Competition Showcase (`/`)**: High-impact competition discovery page displaying prize pool breakdown (₹50,000), judge profiles, live registration spot counters, multi-language support (English & Hindi), previous winners, and rulebook.
2. **Team Audition Portal (`/apply`)**: Registration form allowing dance crews to submit team info, leader contacts, concept proposals, and directly select/record high-resolution audition videos uploaded securely to **Cloudinary**.
3. **Organiser Review Dashboard (`/organiser`)**: Management portal for event organisers to filter, search, view audition videos, accept/reject entries, and trigger automated selection emails to crew leaders via **Resend**.

---

## 🛠️ Tech Stack

### Mobile Frontend
- **Framework**: [React Native](https://reactnative.dev/) (v0.86) with [React 19](https://react.dev/)
- **Platform & Tooling**: [Expo SDK 57](https://expo.dev/)
- **Navigation & Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Media & File Handling**:
  - `expo-image-picker` (Camera & device gallery video selection)
  - `expo-image` (High-performance image rendering)
  - `expo-clipboard` (Instant link copying)
- **Language**: TypeScript with strict mode
- **UI & Gestures**: React Native Safe Area Context, React Native Reanimated, React Native Gesture Handler

### Backend API
- **Runtime & Framework**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose ODM](https://mongoosejs.com/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/) (v2 SDK with Multer stream upload)
- **Email Service**: [Resend](https://resend.com/) (HTML email delivery for acceptance letters)
- **Utilities & Middleware**: Multer, CORS, Morgan (HTTP request logging), Dotenv, Nodemon

---

## ✨ Key Features

### 1. Audition Video Upload via Cloudinary ☁️
- **Direct Gallery Integration**: Applicants tap the video upload card to open their native device gallery or launch the camera.
- **Multer Memory Streaming**: Videos are streamed directly to Cloudinary folder `dance_auditions` without consuming local disk space.
- **Metadata Feedback**: Displays filename, file size in MB, duration, and green Cloudinary storage verification badge.
- **Graceful Fallback**: If Cloudinary credentials are not yet entered in `.env`, a development simulation fallback allows uninterrupted testing.

### 2. Automated Selection Letters via Resend ✉️
- **Instant Email Trigger**: When an organiser clicks **"Accept & Send Email"** in the dashboard, the backend dispatches a congratulations letter directly to the crew leader's email.
- **Rich HTML Template**: Includes dance style, team size, venue info, stage pass instructions, and official organizer contact info.
- **Delivery Audit Log**: Tracks delivery status, timestamp, Resend email ID, or error message in MongoDB.

### 3. Comprehensive Competition Discovery 🌟
- **Multi-Language Support**: One-tap toggle between **English** and **हिन्दी (Hindi)**.
- **Dynamic Prize Pool Breakdown**: 1st Place (₹25,000), 2nd Place (₹15,000), 3rd Place (₹7,000), Top 10 badges.
- **Judge Portfolio**: Profile photo, judge bio, experience, and intro video modal.
- **Interactive Modals**: Full Rulebook, FAQs, Referral Earning Calculator, Refund Policy, and Terms & Conditions.

### 4. Organiser Dashboard 📊
- **Real-Time Status Filtering**: Filter entries by All, Pending, Accepted, or Rejected with instant counters.
- **Search**: Case-insensitive search across team name, leader name, dance style, or city.
- **Audition Video Launcher**: Open and watch applicant audition videos stored on Cloudinary directly.
- **Seed Data Generator**: One-click sample applicant generator for demo and testing.

---

## 📂 Project Architecture

```
assignment/
├── backend/                        # Express.js REST API
│   ├── config/
│   │   ├── db.js                   # MongoDB Atlas connection
│   │   └── cloudinary.js           # Cloudinary SDK configuration
│   ├── middleware/
│   │   └── errorHandler.js         # Centralized error handler
│   ├── models/
│   │   ├── Application.js          # Dance application schema
│   │   ├── Competition.js          # Competition schema
│   │   ├── Registration.js         # User registration schema
│   │   ├── User.js                 # User profile schema
│   │   └── Winner.js               # Competition winners schema
│   ├── routes/
│   │   ├── applications.js         # Application CRUD & accept/reject routes
│   │   ├── competitions.js         # Competition detail routes
│   │   ├── registrations.js        # Registration routes
│   │   ├── upload.js               # Multer + Cloudinary video upload route
│   │   ├── users.js                # User management routes
│   │   └── winners.js              # Previous winners routes
│   ├── services/
│   │   └── emailService.js         # Resend email templates & dispatcher
│   ├── .env                        # Backend environment configuration
│   ├── package.json
│   ├── seed.js                     # Seed script for competition data
│   └── server.js                   # API entry point
│
├── src/                            # Mobile React Native (Expo) App
│   ├── api.ts                      # Client API service layer & types
│   ├── translations.ts             # English & Hindi localization strings
│   └── app/                        # Expo Router file-based screens
│       ├── _layout.tsx             # Root layout with status bar & navigation
│       ├── index.tsx               # Main Competition Details screen
│       ├── apply.tsx               # Dance Crew Application & Cloudinary upload
│       └── organiser.tsx           # Organiser Review & Resend email dashboard
│
├── app.json                        # Expo app configuration
├── package.json                    # Frontend dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your physical device OR an Android Emulator / iOS Simulator

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   # MongoDB Connection
   MONGODB_URI=your_mongodb_atlas_connection_string

   # Server Port
   PORT=5000
   NODE_ENV=development

   # Resend Email Service (starts with re_)
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=Feedants Competitions <onboarding@resend.dev>

   # Cloudinary Media Storage
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   > [!NOTE]
   > If Resend or Cloudinary credentials are not yet entered, simulated fallbacks are provided in development mode so you can test without crashing.

4. Seed the initial competition data:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000/api`.

---

### Step 2: Mobile App Setup (Frontend)

1. Open a new terminal in the root directory:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm run android     # To launch directly in Android emulator
   # OR
   npx expo start      # To scan QR code with Expo Go on a physical phone
   ```

4. **Network Configuration**:
   - On **Android Emulator**, API calls reach the host machine via `http://10.0.2.2:5000/api`.
   - On **Physical Devices**, update the `HOST` IP in [src/api.ts](file:///c:/Users/satya/OneDrive/Desktop/assignment/src/api.ts) with your local machine's LAN IP (e.g. `192.168.x.x`).

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API health check & endpoint index |
| `GET` | `/api/competitions` | Get active competitions list |
| `GET` | `/api/competitions/:id` | Get full competition detail with winners |
| `POST` | `/api/upload/video` | Upload audition video file to Cloudinary |
| `POST` | `/api/applications` | Submit new dance team application |
| `GET` | `/api/applications` | List applications with filter (`?status=`) & search (`?q=`) |
| `GET` | `/api/applications/:id` | Get single application record |
| `PATCH` | `/api/applications/:id/status` | Update status (`accepted`/`rejected`) and trigger Resend email |
| `POST` | `/api/applications/seed` | Seed sample audition applications |

---

## 🧪 Verification & Code Quality

Run lint and type checks before committing:

```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint code quality check
npx expo lint
```

---

## 📄 License

This project is created for the Feedants assignment evaluation.
