# AuthShield – Secure Authentication & Brute-Force Detection System

> **A Comprehensive Cybersecurity Laboratory Application**  
> Implementing Enterprise-Grade Password Hashing, Signed Session Management, Rolling Brute-Force Attack Detection, Dynamic Account Lockout Policies, and Persistent MongoDB Security Telemetry.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
   - [Problem Statement](#problem-statement)
   - [Key Capabilities & Features](#key-capabilities--features)
   - [Technology Stack](#technology-stack)
   - [Security Architecture & Defense Workflow](#security-architecture--defense-workflow)
2. [Prerequisites](#2-prerequisites)
   - [Mandatory Requirements](#mandatory-requirements)
   - [Optional / Recommended Tools](#optional--recommended-tools)
3. [Repository Setup & Cloning](#3-repository-setup--cloning)
4. [Dependency Installation](#4-dependency-installation)
5. [Environment Variables Configuration](#5-environment-variables-configuration)
   - [Environment Variable Reference](#environment-variable-reference)
   - [Creating the Local `.env` File](#creating-the-local-env-file)
6. [Database Setup (MongoDB)](#6-database-setup-mongodb)
   - [Option A: MongoDB Atlas (Cloud - Recommended)](#option-a-mongodb-atlas-cloud---recommended)
   - [Option B: Local MongoDB Server](#option-b-local-mongodb-server)
   - [Option C: Automatic In-Process Fallback](#option-c-automatic-in-process-fallback)
   - [Automated Schema Creation & Sample Seed Data](#automated-schema-creation--sample-seed-data)
7. [Running the Application](#7-running-the-application)
   - [Development Mode (Unified Server)](#development-mode-unified-server)
   - [Production Build & Preview](#production-build--preview)
   - [Service Ports & Endpoints](#service-ports--endpoints)
8. [Installation Verification & Testing Guide](#8-installation-verification--testing-guide)
   - [Phase-by-Phase Verification Checklist](#phase-by-phase-verification-checklist)
   - [Step-by-Step Test Scenarios](#step-by-step-test-scenarios)
9. [Project Structure](#9-project-structure)
10. [Troubleshooting Guide (Windows & Cross-Platform)](#10-troubleshooting-guide-windows--cross-platform)
11. [Security & Compliance Guidelines](#11-security--compliance-guidelines)
12. [API Reference Summary](#12-api-reference-summary)

---

## 1. Project Overview

**AuthShield** is a full-stack cybersecurity web application designed to demonstrate defensive access control mechanisms against credential attacks. Developed as an interactive laboratory and presentation system, AuthShield provides a working defense architecture that detects repeated authentication failures in real time, enforces rolling account lockouts, prevents account enumeration, and records immutable audit telemetry into MongoDB.

### Problem Statement

Web authentication interfaces remain the primary target for automated credential stuffing, dictionary attacks, and distributed brute-force attacks:
- **Credential Guessing**: Attackers cycle through common passwords against targeted user accounts.
- **Account Enumeration**: Poorly configured endpoints leak whether an email address exists through timing disparities or distinct error messages.
- **Resource Exhaustion**: Unthrottled login endpoints can overwhelm identity databases.
- **Lack of Visibility**: Without persistent audit logs, security analysts cannot detect attack patterns or analyze adversary IP signatures.

AuthShield provides end-to-end mitigation against these vulnerabilities using industry-standard defenses.

### Key Capabilities & Features

- **Robust Cryptographic Password Hashing**: Passwords are salted and hashed using `bcryptjs` (10 rounds). Plaintext passwords are never stored in the database and never appear in memory dumps or logs.
- **Stateless JWT Sessions with HTTP-Only Cookies**: Issues signed JSON Web Tokens stored inside `httpOnly`, `sameSite: 'lax'` cookies with bearer fallback, mitigating Cross-Site Scripting (XSS) token theft.
- **Rolling Brute-Force Detection Engine**: Enforces a configurable sliding window (default: 15 minutes). Multiple failed login attempts within this window increment the failure counter.
- **Automated Account Lockout**: Upon reaching the threshold (default: 5 failed attempts), the targeted account is immediately locked for a configured duration (default: 15 minutes). Subsequent login attempts are blocked immediately—even if the attacker provides the correct password.
- **Automatic Lockout Expiration**: Once the lockout duration passes, the account automatically unlocks upon the next authentication attempt without requiring manual database manipulation.
- **Enumeration-Resistant Error Messages**: Returns generic responses (e.g., *"Invalid email or password"*) for both unregistered emails and incorrect passwords, preventing username enumeration.
- **Persistent Security Audit Logging**: Every authentication event (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `BRUTE_FORCE_DETECTED`, `ACCOUNT_LOCKED`, `ACCOUNT_UNLOCKED`, `LOGOUT`) is logged to the MongoDB `SecurityLog` collection with IP addresses, user agents, attempt counts, and timestamps.
- **Interactive Security Operations Center (SOC) Dashboard**: Includes an analytics dashboard displaying live threat telemetry, locked account inventories, an interactive Brute-Force Attack Simulator for live classroom demonstrations, and analyst manual unlock controls.
- **Zero-Config Database Flexibility**: Connects natively to MongoDB Atlas or local MongoDB, and automatically falls back to an in-process MongoDB instance (`mongodb-memory-server`) if external database connectivity is unavailable.

### Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, React Router v7, Lucide React, Motion |
| **Backend** | Node.js (LTS), Express 4, TypeScript (`tsx` runtime execution engine) |
| **Security & Auth** | `bcryptjs`, `jsonwebtoken` (JWT), `cookie-parser`, `cors`, `helmet`, `express-rate-limit` |
| **Database** | MongoDB with Mongoose 9 ODM (compatible with Atlas, Local MongoDB, and In-Memory Server) |
| **Tooling & Build** | Vite 8, TypeScript 7 |

### Security Architecture & Defense Workflow

```
[ User / Attacker ]
        │
        ▼ (POST /api/auth/login)
[ Express Security Headers & Rate Limiter ]
        │
        ▼
[ Query User by Normalized Email ]
 ├── Account Not Found ───► Log LOGIN_FAILURE (Generic 401: "Invalid email or password")
 └── Account Found
        │
        ▼
[ Check Lockout Status ]
 ├── Account Locked & Active (lockUntil > now)
 │      └──► Log ACCOUNT_LOCKED attempt ──► Return 423 Locked (Deny immediately)
 └── Account Lockout Expired (lockUntil <= now)
        └──► Auto-clear lockout state ──► Log ACCOUNT_UNLOCKED ──► Proceed
        │
        ▼
[ Verify Password Hash (bcrypt.compare) ]
 ├── Password Mismatch
 │      ├── Increment failedLoginAttempts inside rolling 15-minute window
 │      ├── If attempts < 5 ──► Log LOGIN_FAILURE ──► Return 401 with remaining attempts
 │      └── If attempts >= 5 ──► Set accountLocked=true, lockUntil=now+15min
 │                                ├── Log BRUTE_FORCE_DETECTED
 │                                ├── Log ACCOUNT_LOCKED
 │                                └── Return 423 Locked
 └── Password Matches
        ├── Reset failedLoginAttempts = 0, accountLocked = false, lockUntil = null
        ├── Log LOGIN_SUCCESS
        ├── Sign JWT & set secure httpOnly cookie
        └── Return 200 OK with safe user profile
```

---

## 2. Prerequisites

Before installing AuthShield, ensure your environment meets the following requirements:

### Mandatory Requirements

1. **Git**
   - Required for cloning the repository and version tracking.
   - Download: [https://git-scm.com/downloads](https://git-scm.com/downloads) (Ensure *"Git Bash"* is included for Windows users).
2. **Node.js & npm**
   - **Recommended Version**: Node.js **v20.x** LTS or **v22.x** LTS.
   - **Minimum Supported**: Node.js **v18.18.0** or higher.
   - Verify in your terminal:
     ```bash
     node -v
     npm -v
     ```
   - Download: [https://nodejs.org/](https://nodejs.org/)

### Optional / Recommended Tools

1. **MongoDB Database** *(Choose one)*:
   - **MongoDB Atlas (Recommended)**: Cloud-hosted Free M0 cluster. Requires no local database installation.
   - **Local MongoDB Community Server**: Version 6.0 or 7.0+ running on port 27017.
   - **In-Memory Fallback**: If no MongoDB server is configured or reachable, AuthShield automatically starts an in-process instance using `mongodb-memory-server` without extra installation.
2. **Visual Studio Code (VS Code)**
   - Recommended extensions: *Tailwind CSS IntelliSense*, *ESLint*, *Prettier*.
3. **API Testing Client (Optional)**
   - Postman, Thunder Client, or cURL for testing backend endpoints directly.

---

## 3. Repository Setup & Cloning

Clone the repository from GitHub to your local machine:

```bash
# Clone the repository (replace <YOUR_GITHUB_REPOSITORY_URL> with your actual repo link)
git clone <YOUR_GITHUB_REPOSITORY_URL>

# Navigate into the project root directory
cd <YOUR_PROJECT_DIRECTORY>
```

> **Windows Note**: You can run these commands in **Windows PowerShell**, **Command Prompt (CMD)**, or **Git Bash**.

---

## 4. Dependency Installation

AuthShield is architected as a **unified full-stack repository**. The Express backend server integrates the Vite development middleware directly. You only need to run a single installation command in the project root:

```bash
npm install
```

This installs all required dependencies:
- Frontend: React 19, React Router 7, Tailwind CSS v4, Lucide icons, Motion.
- Backend: Express, Mongoose, bcryptjs, jsonwebtoken, cookie-parser, cors, helmet, tsx.
- Database tools: mongodb-memory-server (for in-process fallback execution).

---

## 5. Environment Variables Configuration

The project includes an environment template file: `.env.example`.

### Environment Variable Reference

| Variable | Description | Default / Example Value |
|---|---|---|
| `PORT` | Local network port for the full-stack server | `3000` |
| `NODE_ENV` | Application environment (`development` or `production`) | `development` |
| `MONGODB_URI` | Connection URI for MongoDB Atlas or local MongoDB | `mongodb://localhost:27017/authshield` |
| `SESSION_SECRET` | Cryptographic secret for signing session data | `your-super-secret-session-key` |
| `JWT_SECRET` | Cryptographic key used to sign and verify JWT tokens | `your-jwt-secret-key-change-in-production` |
| `AUTH_MAX_FAILED_ATTEMPTS` | Maximum failed attempts allowed before triggering lockout | `5` |
| `AUTH_WINDOW_MINUTES` | Rolling time window in minutes for failure tracking | `15` |
| `AUTH_LOCKOUT_MINUTES` | Duration in minutes that an account remains locked | `15` |
| `RATE_LIMIT_LOGIN_MAX` | Maximum IP requests allowed per 15-minute window | `60` |
| `APP_URL` | Base application URL | `http://localhost:3000` |

### Creating the Local `.env` File

Copy `.env.example` to create your local `.env` configuration file:

**On Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**On Windows Command Prompt (CMD):**
```cmd
copy .env.example .env
```

**On Git Bash / macOS / Linux:**
```bash
cp .env.example .env
```

> **Security Note**: The `.env` file is excluded from version control in `.gitignore`. Never commit real passwords, secrets, or production connection strings to Git.

---

## 6. Database Setup (MongoDB)

AuthShield supports three database configurations:

### Option A: MongoDB Atlas (Cloud - Recommended)

MongoDB Atlas provides a free cloud database that allows all teammates to connect to the same test database:

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Click **Create Deployment** and select the free **M0 Shared Cluster**.
3. Under **Security > Database Access**:
   - Create a database user (e.g., `authshield_admin`).
   - Assign a secure password.
   - Assign the **Read and write to any database** privilege.
4. Under **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) for development/classroom testing, or add your current IP address.
5. Under **Deployments > Database**:
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/authshield?retryWrites=true&w=majority
     ```
6. Update your local `.env` file with this string (replace `<username>` and `<password>` with your database user credentials):
   ```env
   MONGODB_URI="mongodb+srv://authshield_admin:YourPassword123@cluster0.abcde.mongodb.net/authshield?retryWrites=true&w=majority"
   ```

### Option B: Local MongoDB Server

If you prefer running MongoDB locally on your Windows laptop:

1. Download and install **MongoDB Community Server**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Start the Windows MongoDB service:
   ```powershell
   net start MongoDB
   ```
3. Set your `.env` connection string:
   ```env
   MONGODB_URI="mongodb://localhost:27017/authshield"
   ```

### Option C: Automatic In-Process Fallback

If you run AuthShield without setting up MongoDB Atlas or a local MongoDB service:
- The server will detect that no external MongoDB instance is reachable within 1.5 seconds.
- It will automatically launch an in-process MongoDB instance via `mongodb-memory-server`.
- **Zero configuration required**: teammates can run and test all features immediately!

### Automated Schema Creation & Sample Seed Data

You do **not** need to manually run SQL scripts, create collections, or import JSON dumps. 

When the server connects to MongoDB for the first time, Mongoose creates all indexes automatically, and `backend/config/seed.ts` automatically populates the initial database with cybersecurity research accounts:

| Email | Default Password | Role | Description |
|---|---|---|---|
| `analyst@cyber.edu` | `Password123!` | `security_analyst` | Primary security analyst account (Active, 0 failed attempts). |
| `student@cyber.edu` | `Password123!` | `user` | Standard student account (Active). |
| `target@cyber.edu` | `Password123!` | `user` | **Pre-locked demonstration account** (5 failed attempts recorded, locked for presentation). |

Baseline security logs (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `BRUTE_FORCE_DETECTED`, `ACCOUNT_LOCKED`) are also seeded automatically for instant visual telemetry in the dashboard.

---

## 7. Running the Application

### Development Mode (Unified Server)

AuthShield uses a unified runtime where Express and Vite operate concurrently under a single process on port `3000`.

Start the application:

```bash
npm run dev
```

You will see output similar to:
```text
[INFO] Attempting MongoDB connection...
[INFO] MongoDB connected successfully.
[INFO] Vite development server middleware mounted.
[INFO] AuthShield Full-Stack Server running on http://0.0.0.0:3000
[INFO] Health check available at http://0.0.0.0:3000/api/health
```

Now open your web browser and navigate to:
```text
http://localhost:3000
```

### Production Build & Preview

To verify that the application compiles and bundles cleanly for production:

```bash
# Compile TypeScript and bundle frontend with Vite
npm run build

# Start production server
npm run start
```

### Service Ports & Endpoints

| Service / Resource | Address / URL |
|---|---|
| **Web Application (SPA Frontend)** | `http://localhost:3000` |
| **System Health Check API** | `http://localhost:3000/api/health` |
| **Authentication Status API** | `http://localhost:3000/api/auth/status` |
| **Security Defense Policy API** | `http://localhost:3000/api/security/policy` |

---

## 8. Installation Verification & Testing Guide

Follow this verification procedure to confirm that all security controls and modules are functioning properly.

### Phase-by-Phase Verification Checklist

- [ ] **1. Health Endpoint Operational**: Open `http://localhost:3000/api/health` in your browser. Verify that `status: "OPERATIONAL"` and database status is `"connected"`.
- [ ] **2. Frontend Landing Page**: Open `http://localhost:3000`. Confirm the AuthShield landing page and navigation bar load without errors.
- [ ] **3. User Registration**:
  - Navigate to `http://localhost:3000/register`.
  - Register a new account with a strong password (minimum 8 characters, uppercase, lowercase, number, special character; e.g., `TestUser99!`).
  - Verify redirection to the authenticated `/dashboard`.
- [ ] **4. Duplicate Email Prevention**:
  - Logout, return to `/register`, and attempt to register using the exact same email address.
  - Verify the server returns HTTP 409 Conflict with *"An account with this email address already exists."*
- [ ] **5. Successful Authentication**:
  - Navigate to `http://localhost:3000/login`.
  - Log in with `analyst@cyber.edu` and password `Password123!`.
  - Confirm successful sign-in, user avatar display, and dashboard telemetry loading.
- [ ] **6. Invalid Password Handling**:
  - Logout and attempt to log in as `student@cyber.edu` using an incorrect password (e.g., `WrongPassword123!`).
  - Verify the error message: *"Invalid email or password. Attempt 1 of 5."*
  - Notice that the message does not reveal password hashes or internal secrets.
- [ ] **7. Brute-Force Lockout Enforcement**:
  - Submit 4 more incorrect passwords for `student@cyber.edu` (5 failed attempts total).
  - On the 5th attempt, confirm the response triggers an account lockout warning banner:
    *"Your account is temporarily locked due to repeated failed login attempts (5/5). Please try again in 15 minutes."*
- [ ] **8. Locked Account Protection**:
  - Immediately attempt to log in using `student@cyber.edu` with the **correct** password (`Password123!`).
  - **Expected Result**: Login is **rejected** (HTTP 423 Locked). The lockout countdown is enforced by the backend before password checking.
- [ ] **9. Security Audit Telemetry**:
  - Log in with `analyst@cyber.edu` and navigate to the **Security Events** page (`/security-events`).
  - Verify the immutable audit log table displays `LOGIN_FAILURE`, `BRUTE_FORCE_DETECTED`, and `ACCOUNT_LOCKED` events with IP addresses and timestamps.
- [ ] **10. Attack Simulator (Demo Tool)**:
  - On the Dashboard, locate the **Interactive Brute-Force Attack Simulator**.
  - Click **Simulate Brute-Force Attack** on a test account.
  - Observe the automated 5-attempt attack burst, the immediate generation of SOC alerts, and real-time UI state updates.
- [ ] **11. Manual Administrative Unlock**:
  - In the **Locked Accounts** section of the dashboard, locate the locked user.
  - Click **Unlock Account**.
  - Verify that the lockout state is cleared and an `ACCOUNT_UNLOCKED` security event is recorded in MongoDB.
- [ ] **12. Session Invalidation & Protected Routes**:
  - Click **Logout**.
  - Attempt to navigate directly to `http://localhost:3000/dashboard` or `http://localhost:3000/profile`.
  - Verify that unauthenticated requests are intercepted and redirected to `/login`.

---

## 9. Project Structure

```text
authshield/
├── backend/                         # Backend Express Server Architecture
│   ├── config/                      # Configuration & Database
│   │   ├── db.ts                    # MongoDB connection logic & in-process fallback
│   │   ├── env.ts                   # Centralized environment variable parser
│   │   ├── securityConfig.ts        # Brute-force & rate-limiting policies
│   │   └── seed.ts                  # Database seeder (seed accounts & baseline logs)
│   ├── controllers/                 # Route Request Handlers
│   │   ├── authController.ts        # Register, login, logout, me, auth status
│   │   ├── healthController.ts      # Health check telemetry endpoint
│   │   └── securityController.ts    # SOC stats, logs, unlock, attack simulation
│   ├── middleware/                  # Express Security & Auth Middlewares
│   │   ├── authMiddleware.ts        # JWT cookie & Bearer token verification
│   │   ├── errorHandler.ts          # Centralized error formatting
│   │   ├── rateLimitMiddleware.ts   # IP-based rate limiting
│   │   └── securityMiddleware.ts   # Helmet headers & request audit logger
│   ├── models/                      # Mongoose Database Schemas
│   │   ├── SecurityLog.ts           # Audit log model (events, IPs, attempt counts)
│   │   └── User.ts                  # User model (bcrypt hash, lockout fields)
│   ├── routes/                      # Modular API Router Definitions
│   │   ├── authRoutes.ts            # /api/auth routes
│   │   ├── healthRoutes.ts          # /api/health routes
│   │   ├── index.ts                 # Main router aggregator (/api)
│   │   └── securityRoutes.ts        # /api/security routes
│   ├── services/                    # Business Logic Layer
│   │   ├── authService.ts           # Credential hashing, lockout logic & validation
│   │   └── securityLogService.ts    # Secure audit log writer
│   └── utils/                       # Server Helpers
│       ├── apiResponse.ts           # Standardized JSON response envelope
│       └── logger.ts                # Structured console logging
├── src/                             # Frontend React 19 Client Application
│   ├── components/                  # Reusable UI & Security Components
│   │   ├── AttackSimulatorModal.tsx # Interactive brute-force simulation modal
│   │   ├── Navbar.tsx               # Header navigation & user status
│   │   ├── ProtectedRoute.tsx       # Client-side authentication guard
│   │   ├── SecurityBadge.tsx        # Status pill indicators (ACTIVE, LOCKED)
│   │   └── ...                      # UI elements (Cards, Buttons, Tables)
│   ├── context/                     # React Context State Management
│   │   └── AuthContext.tsx          # Authentication & session provider
│   ├── layouts/                     # Application Page Shells
│   │   ├── DashboardLayout.tsx      # Authenticated sidebar layout
│   │   └── MainLayout.tsx           # Global responsive layout
│   ├── pages/                       # Application Views
│   │   ├── DashboardPage.tsx        # Security operations center (SOC) dashboard
│   │   ├── LandingPage.tsx          # Public overview and architecture diagrams
│   │   ├── LoginActivityPage.tsx    # User login history view
│   │   ├── LoginPage.tsx            # Secure login interface with lockout banner
│   │   ├── ProfilePage.tsx          # Authenticated user security profile
│   │   ├── RegisterPage.tsx         # Account registration with password meter
│   │   └── SecurityEventsPage.tsx   # Global security audit log table
│   ├── services/                    # Client API Client Services
│   │   └── api.ts                   # Axios/fetch API client with credentials
│   ├── types/                       # Shared Frontend TypeScript Interfaces
│   │   └── index.ts                 # User, Log, and Security type definitions
│   ├── App.tsx                      # Main Application Router
│   ├── index.css                    # Tailwind CSS v4 directives & theme styles
│   └── main.tsx                     # React DOM entry point
├── .env.example                     # Environment configuration template
├── .gitignore                       # Git exclusion rules
├── index.html                       # HTML5 entry template
├── package.json                     # Project scripts and dependency declarations
├── server.ts                        # Unified Full-Stack Server Entry Point
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite bundler configuration
```

---

## 10. Troubleshooting Guide (Windows & Cross-Platform)

### 1. `'node'` or `'npm'` is not recognized as an internal or external command
- **Cause**: Node.js is not installed or its installation directory is not added to your system `PATH`.
- **Solution**:
  1. Download and run the official Node.js installer from [nodejs.org](https://nodejs.org/).
  2. Check the box labeled **"Add to PATH"** during setup.
  3. Close and reopen your terminal or Command Prompt.
  4. Verify with:
     ```cmd
     node -v
     npm -v
     ```

### 2. Port 3000 is already in use (`EADDRINUSE: address already in use :::3000`)
- **Cause**: Another instance of Node.js, Vite, or another web server is already running on port 3000.
- **Solution**:
  - **Option A (Find and terminate the process on Windows)**:
    ```powershell
    # Find the process ID (PID) using port 3000
    netstat -ano | findstr :3000

    # Kill the process using the PID found (replace <PID> with the actual number)
    taskkill /PID <PID> /F
    ```
  - **Option B (Change the port)**:
    Open `.env` and set a different port (e.g., `PORT=3001`), then restart:
    ```env
    PORT=3001
    ```

### 3. MongoDB Connection Timeout or Network Failure
- **Error**: `MongooseServerSelectionError: connection timed out` or `ECONNREFUSED`.
- **Solutions**:
  - **If using MongoDB Atlas**:
    1. Log in to MongoDB Atlas and verify **Network Access**. Ensure `0.0.0.0/0` (Allow from anywhere) is listed.
    2. Check that the database user password in `MONGODB_URI` does not contain unencoded special characters (e.g., replace `@` with `%40`).
  - **If using Local MongoDB**:
    1. Ensure the Windows MongoDB service is running:
       ```powershell
       net start MongoDB
       ```
  - **Zero-Install Solution**: If your external database is unreachable, AuthShield will automatically fall back to its internal in-process memory database so you can continue development.

### 4. Dependency Installation Errors on Windows (`npm install` failure)
- **Error**: `gyp ERR!` or permission access denied.
- **Solution**:
  1. Open PowerShell or Command Prompt as **Administrator**.
  2. Clear the npm cache:
     ```bash
     npm cache clean --force
     ```
  3. Run the installation again:
     ```bash
     npm install
     ```

### 5. Frontend Cannot Communicate with Backend or CORS Errors
- **Cause**: In production or custom setups, API requests might target an incorrect domain or port.
- **Solution**:
  - In development mode (`npm run dev`), Express mounts Vite's middleware directly under the same origin (`http://localhost:3000`). All API requests to `/api/*` are processed by the same server instance, eliminating CORS cross-origin discrepancies.
  - Ensure you open the application at `http://localhost:3000` rather than an isolated external port.

### 6. Authentication Cookies Not Persisting (Immediate Logout or 401 on reload)
- **Cause**: Browser privacy settings or browser extensions blocking third-party/local cookies.
- **Solution**:
  - AuthShield sets `httpOnly` session cookies with `sameSite: 'lax'`.
  - Ensure cookies are allowed for `localhost`.
  - If testing in an incognito window, make sure "Block third-party cookies" does not interfere with localhost session storage.
  - The client automatically stores the fallback JWT token in memory for continuous session continuity.

---

## 11. Security & Compliance Guidelines

When developing or demonstrating AuthShield, adhere to the following best practices:

1. **Protect Environment Secrets**: Never commit `.env` files containing production database passwords or encryption keys to public GitHub repositories.
2. **Dedicated Development Database**: Always use an isolated MongoDB Atlas sandbox database (or local database) dedicated to testing. Never run tests against production collections.
3. **Password Security Policy**: AuthShield requires passwords to contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a symbol. Do not disable this policy in `authService.ts`.
4. **Ethical Testing of Brute-Force Protection**: The brute-force detection and lockout capabilities are intended solely for educational security demonstrations. Conduct attack simulations only against designated test accounts (`target@cyber.edu` or newly registered test users).

---

## 12. API Reference Summary

All API endpoints are prefixed with `/api`. Standard responses follow a unified JSON envelope: `{ success: boolean, message: string, data?: any, error?: any }`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status, database health, uptime, and active security modules. |
| `GET` | `/api/auth/status` | Public | Architecture overview and active defense parameters. |
| `POST` | `/api/auth/register` | Public | Register a new user account with bcrypt salted hashing. |
| `POST` | `/api/auth/login` | Public | Authenticate user, check lockout status, and issue JWT cookie. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and security state. |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session and clear authentication cookie. |
| `GET` | `/api/security/stats` | Authenticated | Real-time security statistics and attack counters. |
| `GET` | `/api/security/logs` | Authenticated | Retrieve historical security audit log records from MongoDB. |
| `GET` | `/api/security/policy` | Public | View configured thresholds (attempt limits, lockout window). |
| `GET` | `/api/security/locked-accounts` | Authenticated | List currently locked accounts and remaining lock durations. |
| `POST` | `/api/security/unlock` | Public / Demo | Manually unlock a locked account and reset failure counters. |
| `POST` | `/api/security/simulate-attack` | Public / Demo | Simulate a brute-force attack burst against a specified target account. |

---

*AuthShield – Secure Authentication & Brute-Force Detection System*  
*Developed for Cybersecurity Education & Demonstration.*
