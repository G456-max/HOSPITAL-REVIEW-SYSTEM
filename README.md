# 🏥 AI-Powered In-Patient Review System

An advanced, multi-dimensional patient feedback and sentiment analytics portal designed for **Visakha Steel General Hospital (VSGH)**. The system enables hospital administrators to monitor patient satisfaction across 9 distinct categories, perform automated aspect-based sentiment analysis using **Google Gemini 1.5 Flash**, handle API fallbacks locally, and manage real-time alerts.

---

## 📂 Project Architecture

The application is built on a modern **three-tier client-server architecture**:

```
 ┌────────────────────────────────────────────────────────┐
 │                   React Presentation                   │ (Frontend Tier: React 19, Vite, Tailwind CSS)
 └──────────────────────────┬─────────────────────────────┘
                            │ (REST HTTP / JSON / Axios)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                    Node.js & Express                   │ (Application Tier: Services, Controllers, JWT)
 └──────────────────┬─────────────────┬───────────────────┘
                    │                 │
       (Mongoose)   ▼                 ▼ (Google SDK)
 ┌──────────────────────┐        ┌────────────────────────┐
 │  MongoDB Database    │        │ Google Gemini 1.5 API  │ (AI & Sentiment Classification)
 └──────────────────────┘        └────────────────────────┘
```

1. **Frontend (Presentation):** React (v19) compiled with Vite. Uses Tailwind CSS for responsive layouts and Axios for asynchronous API client calls.
2. **Backend (Application):** Node.js and Express. Exposes REST endpoints, validates inputs, manages JWT login sessions, records administrative audit logs, and coordinates Gemini calls.
3. **Database (Persistence):** MongoDB using Mongoose schemas to map Patient, Review, Admin, Warning Alert, and Audit Log collections.

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | **React** (v19) | Component-based interactive UI rendering. |
| **Build Tool (FE)** | **Vite** | Ultra-fast local bundler and dev server. |
| **Styling** | **Tailwind CSS** | Premium utility-first responsive styling. |
| **API Client** | **Axios** | Sends HTTP requests to the backend server. |
| **Backend** | **Node.js** & **Express** | Asynchronous business services and REST router. |
| **Database** | **MongoDB** | NoSQL document storage. |
| **ORM** | **Mongoose** | Schema validation and database modeling. |
| **AI Engine** | **Google Gemini 1.5 Flash** | Aspect-based sentiment analysis and draft generation. |
| **Security** | **JWT & bcryptjs** | Hashed credentials and stateful admin sessions. |
| **Data Export** | **pdfkit & exceljs** | Generates PDF summary sheets and Excel spreadsheets. |

---

## ✨ Core Features

* **Patient verification:** Look up active inpatient registrations. Automatically pulls details (Name, Doctor, Ward, Bed, Admission dates) to speed up submission.
* **9-Category Aspect Survey:** Patients rate specific sections from 1 to 5 stars (Registration, Doctors, Nurses, Ward Hygiene, Lab diagnostics, Pharmacy queues, Catered food, Discharge billing, Security).
* **✨ AI Review Generator:** Automatically drafts a natural-sounding, polite review comment matching the patient's rating scores.
* **AI Sentiment Pipeline:** Analyzes suggestions and ratings using Gemini 1.5 Flash to output sentiment scores (Positive, Negative, Mixed), positive/negative percentages, clinical summaries, and urgency levels.
* **🔒 Local Fallback Engine:** Features a rules-based JavaScript parser that scores surveys locally if the Gemini API is offline, guaranteeing 100% submission uptime.
* **Admin Analytics Dashboard:** Role-based access for SuperAdmins, HospitalAdmins, and DepartmentAdmins to inspect ratings trends, sentiment ratios, and alerts.
* **Warning Notifications:** Automatically creates warning alerts when a department's average rating drops below 3.0 stars.
* **Administrative Audit Trails:** Records all edit, delete, and alert resolution actions.

---

## 🗄️ Database Schemas (Mongoose Models)

### 1. `Patient` Model (`patients` collection)
Represents patient stay records:
* `patientId` (String, PK, Unique): Upper-case ID (e.g. `P101`).
* `patientName` (String, Required)
* `age` / `gender` (Number / String)
* `mobileNumber` / `patientType` (String): Enum `['Inpatient', 'Outpatient']`.
* `department` / `doctorName` / `ward` / `bedNumber` (String)
* `admissionDate` / `dischargeDate` (Date)
* `reviewSubmitted` (Boolean): Prevents multiple submissions.

### 2. `Review` Model (`reviews` collection)
Stores patient rating profiles and AI analytics:
* `patientId` (String, Unique): Linked patient reference.
* `ratings` (Nested Object): Contains ratings for the 9 categories.
* `overallRating` (Number, 1-5 stars)
* `suggestions` (String, max 1000 chars)
* `sentiment` (String): `['Positive', 'Negative', 'Mixed']`.
* `positivePercentage` / `negativePercentage` (Number)
* `reviewSummary` (String)
* `positivePoints` / `negativePoints` (Array of Strings)
* `doctorFeedback` (String)
* `urgencyLevel` (String): `['Low', 'Medium', 'High']`.

### 3. `Notification` Model (`notifications` collection)
Triggers department alert warning logs:
* `department` (String, Required)
* `message` (String, Required)
* `resolved` (Boolean): Resolution status.
* `resolvedBy` / `resolvedAt` (String / Date)

---

## 🔌 API Route Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create administrative account.
* `POST /api/auth/login` - Authenticate admin and return JWT.

### Patients (`/api/patient`)
* `GET /api/patient/:id` - Query patient details by stay ID.
* `POST /api/patient` - Register a new patient stay.

### Feedback Reviews (`/api/review`)
* `POST /api/review` - Register feedback. Calls Gemini API for sentiment mapping.
* `GET /api/review` - Fetch all reviews (with filters).
* `GET /api/review/:id` - Fetch single review by ID.
* `PUT /api/review/:id` - Edit review and run re-analysis (SuperAdmin only).
* `DELETE /api/review/:id` - Remove feedback and permit re-submission (SuperAdmin only).
* `POST /api/review/generate-comments` - Draft feedback suggestion based on rating scores.

### Administrative Alerts (`/api/review/notifications`)
* `GET /api/review/notifications` - Retrieve warning notifications list.
* `PUT /api/review/notifications/:id/resolve` - Resolve low-rating alert warnings.

---

## 🚀 Installation & Local Execution

### Prerequisites
* **Node.js** (v18.x or v20.x LTS)
* **MongoDB Community Server** (running locally on port 27017)

### 1. Set Up Environment variables
Create a `.env` file in the `backend` folder:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_review
JWT_SECRET=your_jwt_signature_key
GEMINI_API_KEY=AIzaSyYourGoogleGeminiKey
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install Dependencies & Seed Databases
```bash
# Install backend dependencies
cd backend
npm install

# Run database seeder (populates default departments and mock patients)
npm run seed

# Run Express server
npm run dev
```

### 3. Start Presentation Client
Open a new terminal:
```bash
# Install client dependencies
cd client
npm install

# Start Vite server
npm run dev
```
Open `http://localhost:5173` in your web browser.
