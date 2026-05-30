# CredSea Loan Management System (LMS)

A premium, modern, and secure Loan Management Platform designed for borrowers to apply for personal loans, and operations teams (Sales, Sanction, Disbursement, Collection) to review and service them through their entire lifecycle.

---

## 🚀 Live Hosted Application

The frontend client of this application is fully hosted and running online:
👉 **[CredSea Premium Client Portal](https://credit-sea-assignment-client.vercel.app/)**

---

## 🔑 Evaluator Login Credentials (Pre-created Seeds)

To test the role-based dashboard access, you can bypass borrower signup and immediately log in using our pre-created, pre-seeded accounts:

| Role | Username (Email) | Password | Access Rights & Dashboard Module |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `Admin@123` | Full access to **all** modules (Sales, Sanction, Disbursement, Collection) |
| **Sales** | `sales@lms.com` | `Sales@123` | Exclusive access to **Sales** Lead-Tracking |
| **Sanction** | `sanction@lms.com` | `Sanction@123` | Exclusive access to **Sanction** (Approve / Reject Applied Loans) |
| **Disbursement** | `disbursement@lms.com` | `Disbursement@123` | Exclusive access to **Disbursement** (Mark loans as Disbursed) |
| **Collection** | `collection@lms.com` | `Collection@123` | Exclusive access to **Collection** (Record payments & Auto-close loans) |
| **Borrower** | `borrower@lms.com` | `Borrower@123` | Exclusive access to **Borrower Portal** (Personal Details, Slips, Config & Apply) |

---

## 🔄 System Workflows & Loan Lifecycle

### 1. Loan Application Status Lifecycle
All loan applications flow through four strict, sequential database status stages:
$$\text{APPLIED} \longrightarrow \text{SANCTIONED} \longrightarrow \text{DISBURSED} \longrightarrow \text{CLOSED}$$
*(Additionally, an application can be transitioned from $\text{APPLIED} \longrightarrow \text{REJECTED}$ by the Sanction team.)*

---

### 2. End-to-End Workflow Breakdown

#### Step 1: Borrower SignUp & Login
* Borrowers create an account or sign in. Passwords are securely salted and hashed using `bcrypt` on the Node server.

#### Step 2: Personal Details + Business Rule Engine (BRE)
* The borrower enters: Full Name, PAN Card, Date of Birth, Monthly Income, and Employment Mode.
* When submitting, the server-side **Business Rule Engine (BRE)** checks eligibility in real-time. Rejection rules are:
  * **Age**: Must be between **23** and **50** years old.
  * **Salary**: Must be at least **₹25,000 / month**.
  * **Employment**: Applicant cannot be **Unemployed**.
  * **PAN Format**: Must match the standard uppercase regex (`/^[A-Z]{5}[0-9]{4}[A-Z]$/`).
* If any rule fails, the borrower is blocked from applying and a descriptive error state is rendered inside the portal.

#### Step 3: Secure Document Upload
* Eligible borrowers upload their **Salary Slip** (MIME/Extension restricted strictly to `PDF`, `JPG`, `PNG` up to **5MB**).
* *Security Feature*: State-validation middleware runs *before* Multer uploads to prevent ineligible accounts or bots from filling the server's disk.

#### Step 4: Loan Configuration & Live Repayment Math
* The user interacts with responsive sliders to select:
  * **Loan Amount**: ₹50,000 to ₹5,00,000
  * **Tenure**: 30 to 365 days
* The platform dynamically calculates fixed **12% p.a. Simple Interest** live:
  $$\text{SI} = \frac{P \times R \times T}{365 \times 100}$$
  $$\text{Total Repayment} = P + \text{SI}$$
* Upon clicking "Apply", the loan is created as `applied`, progress state resets so they can apply again later, and a dedicated **4th Page Success Confirmation Screen** pops up with a mechanical "OK" button to return to home.

#### Step 5: Operations & RBAC Dashboards
Executives log in to manage applications. Under **Role-Based Access Control (RBAC)**, APIs and the client-side Next.js route guards prevent cross-role dashboard views (unauthorized access returns a prompt `403 Forbidden` response):
* **Sales Module**: Displays registered borrowers (leads) who have not submitted an application yet.
* **Sanction Module**: Displays applied loans. Sanction officers can **Approve** (marks status as `sanctioned`) or **Reject** with a recorded comment (marks status as `rejected`).
* **Disbursement Module**: Displays sanctioned loans. Officers verify the slip, release funding, and click **Disburse** (marks status as `disbursed`).
* **Collection Module**: Displays disbursed active loans. Collection officers record borrower repayments using a **unique bank UTR number** (duplicates are rejected at the schema level).
  * **Auto-Close Rule**: When the cumulative payments recorded for a loan equal the `totalRepayment` amount, the server automatically transitions the loan status to **`closed`**.

---

## 🛠️ Local Installation & Setup

### 1. Prerequisites
* [Node.js](https://nodejs.org/) v18+ 
* [MongoDB](https://www.mongodb.com/) (either running locally or a MongoDB Atlas URI string)

---

### 2. Monorepo Setup Commands
This project is configured as an npm workspaces monorepo. Dependencies for both the backend and frontend are managed from the root directory.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sardul-byte/CreditSea_Assignment.git
   cd CreditSea_Assignment
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the **root** folder:
   ```bash
   cp .env.example .env
   ```
   Provide the following parameters:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lms?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Seed Database Accounts**:
   Initialize database profiles with our built-in DNS-safe seed utility script:
   ```bash
   npm run seed
   ```

5. **Start Dev Servers (Concurrent)**:
   Launches both Next.js and Express servers simultaneously in concurrent workspaces:
   ```bash
   npm run dev
   ```
   * **Frontend Client URL**: `http://localhost:3000`
   * **Backend API URL**: `http://localhost:5000`

---

## 💻 Tech Stack & Architecture

### Frontend (Folder: `/client`)
* **Core**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
* **Design System & Micro-Animations**:
  * Curved custom mesh background panels.
  * Wide focus input glow halos (`focus:ring-4 focus:ring-brand-500/15`).
  * Tactical physical scale click feedback (`active:scale-[0.97] transition-all duration-150`) on all buttons.
  * Opal-fade entrance animations (`.animate-fade-in`) on page transitions.
* **Middlewares**: Next.js client-side JWT middleware route guards.

### Backend (Folder: `/server`)
* **Core**: Node.js + Express.js + TypeScript
* **Database**: MongoDB + Mongoose Schemas (equipped with query indexes on key reference variables for high-performance scale).
* **Security**: Salted password hashing (`bcrypt`), JSON Web Token (`JWT`) session signatures, Express RBAC verification middleware, and strict logical validation layers.
