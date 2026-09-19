# RSVP Tracker & Management — Wedding Edition

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Security](https://img.shields.io/badge/OWASP-Hardened-2E7D32?style=flat-square&logo=shield&logoColor=white)](#-security-engineering--owasp-mitigations)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

An enterprise-grade, zero-cost, serverless RSVP (Répondez S'il Vous Plaît) tracking platform developed with modern web standards, strict defense-in-depth security policies, and mobile-first responsive design.

---

## 🏛️ Architecture & Engineering Highlights

This project was built as a demonstration of software engineering best practices applied to single-event applications:

- **Clean Architecture & Separation of Concerns:** UI components, domain formatters, security sanitizers, and external services are strictly decoupled.
- **Zero-Cost Cloud Infrastructure:** Runs entirely within Firebase's Spark tier (up to 50,000 reads/day) and Netlify's free edge hosting.
- **Strict Typing:** 100% TypeScript with zero `any` compromises and strict compiler flags.
- **Next-Gen Tooling:** Built on Vite 8 and Oxlint for sub-second builds and static analysis with zero lint warnings.

```
src/
├── components/          # Encapsulated UI components
│   ├── AdminDashboard.tsx   # Authenticated metrics, search, filters & export
│   ├── AdminLogin.tsx       # Secure credentials-based authentication
│   ├── AlphabetFilter.tsx   # Dynamic A-Z categorical index
│   ├── ConfirmationModal.tsx# Confirmation dialog
│   ├── DuplicateBadge.tsx   # Visual indicator for duplicated records
│   ├── RsvpForm.tsx         # Guest submission with throttling & validation
│   └── SuccessState.tsx     # Post-confirmation state
├── config/              # Environment configuration & SDK initialization
│   └── firebase.ts
├── services/            # Isolated business logic & Firestore/Auth queries
│   └── rsvpService.ts
├── types/               # Domain interfaces & TypeScript contracts
│   └── rsvp.ts
└── utils/               # Pure functions, security sanitizers & formatters
    ├── exportCsv.ts         # OWASP-compliant CSV export
    └── formatters.ts        # String normalization & duplicate detection
```

---

## 🔒 Security Engineering & OWASP Mitigations

### 1. Real Firebase Authentication (No Frontend Shared Secrets)
- Administrative access is guarded by Firebase Authentication (Google Identity Platform) generating cryptographic JWT tokens verified on every database transaction.
- Elimination of shared `PIN` or client-side bypassable flags from bundles.
- Persistent session handling via `onAuthStateChanged` lifecycle observers.

### 2. Zero-Trust Firestore Security Rules (`firestore.rules`)
- **Web Mutability Lockdown:** `update` and `delete` operations are permanently disabled for all web clients (`allow update, delete: if false;`), reserving record purges strictly to the Firebase Console.
- **Role-Based Read Restriction:** Collection reads are restricted exclusively to authenticated administrative UIDs (`request.auth.uid in ['ADMIN_UID']`) or verified administrator emails (`request.auth.token.email_verified == true`).
- **Strict Schema, Name Regex & Clock-Skew Validation:** Document creation is subjected to strict type, regex and size constraints, rejecting undeclared fields or non-name strings:
  ```javascript
  allow create: if request.resource.data.keys().hasOnly(['name', 'normalizedName', 'createdAt'])
                && request.resource.data.name is string
                && request.resource.data.name.size() >= 3
                && request.resource.data.name.size() <= 80
                && request.resource.data.name.matches('^[a-zA-ZÀ-ÿ\\s\'.-]+$')
                && request.resource.data.normalizedName is string
                && request.resource.data.normalizedName.size() >= 3
                && request.resource.data.normalizedName.size() <= 80
                && request.resource.data.createdAt is number
                && request.resource.data.createdAt >= (request.time.toMillis() - 300000)
                && request.resource.data.createdAt <= (request.time.toMillis() + 300000);
  ```

### 3. Abuse Prevention & Client-Side Sanitization
- **Rate-Limiting Cooldown:** 30-second browser-level cooldown prevents rapid-fire duplicate submissions.
- **Flight Lock:** Form submission triggers a disabled lock preventing double-submit race conditions.
- **Control Character & Injection Stripping:** Input is sanitized removing ASCII control characters (`U+0000` to `U+001F`, `U+007F` to `U+009F`), angle brackets (`< >`), and strictly permitting valid unicode person names (`^[\p{L}\s'.-]+$`).

### 4. OWASP CSV Formula Injection Mitigation
Spreadsheet software (Microsoft Excel, Google Sheets, LibreOffice Calc) treats cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` as executable formulas (Dynamic Data Exchange / Formula Injection). All exported cells are defensively sanitized:
```typescript
const DANGEROUS_PREFIXES = ['=', '+', '-', '@', '\t', '\r']

export function sanitizeCsvCell(value: unknown): string {
  let content = String(value ?? '')
  if (DANGEROUS_PREFIXES.some((prefix) => content.startsWith(prefix))) {
    content = `'${content}`
  }
  return `"${content.replace(/"/g, '""')}"`
}
```

---

## ⚡ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Concurrent rendering, typed contracts |
| **Styling** | Tailwind CSS v4 | Zero-runtime CSS engine, design consistency |
| **Icons** | Lucide React | Lightweight, tree-shakable SVG icons |
| **Database** | Cloud Firestore | Serverless real-time NoSQL, sub-100ms latency |
| **Auth** | Firebase Auth | OAuth 2.0 / OpenID Connect token validation |
| **Build & Lint** | Vite 8 + Oxlint | Instant HMR, sub-20ms linting |
| **Hosting** | Netlify | Global Edge CDN, automated HTTPS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install
```bash
git clone https://github.com/hisennn/rsvp-tracker.git
cd rsvp-tracker
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAIL=admin@example.com
```

> **Note:** The application includes a resilient local mock fallback. If Firebase variables are absent, guest confirmations and preview sessions run locally in browser storage for development and UI inspection.

### 3. Run Locally
```bash
# Start development server
npm run dev

# Run static analysis
npm run lint

# Build production bundle with type-checking
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment

### 1. Cloud Firestore Rules
Publish the provided rules to your Firestore instance:
```bash
firebase deploy --only firestore:rules
```

### 2. Netlify Deployment
Connect the repository to Netlify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Configure the environment variables in the Netlify Dashboard (**Site settings** > **Environment variables**).

---

## 📄 License
MIT License. Free for personal and commercial adaptation.
