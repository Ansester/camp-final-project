# CAMP – Campus Asset Management Platform

CAMP (Campus Asset Management Platform) is a full-stack web application designed for centralizing resource scheduling, equipment reservation, and inventory management across university campus facilities.

---

## Context & Provenance

* **Project Context**: Team software-engineering project (NYU Abu Dhabi).
* **Team**: Saad Iftikhar, Talal Naveed, Shaf Khalid, Akshith Karthik, Ashmit Mukherjee.
* **My Contributions**:
  * Implemented backend REST API endpoints for staff workflows, equipment alerts, and dashboard statistics in Express.js.
  * Configured backend testing setup (Mocha/Chai integration tests) and client API integration utilities.
  * Served as Product Owner (Sprint 1) and Scrum Master (Sprint 3) during agile team sprint rotations.

---

## Technical Stack & Architecture

* **Frontend**: React, Webpack, Tailwind CSS
* **Backend**: Node.js, Express.js (REST APIs)
* **Database**: MongoDB Atlas
* **Authentication**: JWT, role-based access control (Student vs. Staff permissions)
* **Testing & Quality**: Mocha, Chai, Supertest, ESLint
* **CI/CD & Deployment**: GitHub Actions CI workflow; the project was deployed on a DigitalOcean droplet (Ubuntu) using Nginx and PM2 process management.

---

## Core Implemented Functionality

1. **Inventory Management**: Browse and search equipment categories across campus departments.
2. **Pre-Booking & Reservation**: Submit reservation requests with automated conflict resolution checks against existing bookings.
3. **Role-Based Access Control (RBAC)**: Distinct permissions for student borrowers and staff administrators.
4. **Staff Management Dashboard**: View real-time reservation logs, manage item issuance, and record returns.

---

## Running Locally

### Prerequisites

* Node.js (v18 or higher)
* npm (v9 or higher)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Ansester/camp-final-project.git
cd camp-final-project

# Start Backend Server (Terminal 1)
cd back-end
npm install
npm start

# Start Frontend Server (Terminal 2)
cd ../front-end
npm install --legacy-peer-deps
npm run dev
```

### Running Integration Tests

```bash
cd back-end
npm test
```

---

## Repository Structure

```
camp-final-project/
├── front-end/          # React frontend application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── services/   # API and mock data services
│   │   └── utils/      # Utility functions
│   └── public/         # Static web assets
├── back-end/           # Express.js backend API
│   ├── routes/         # API route handlers
│   ├── config/         # Database configuration
│   └── tests/          # Integration test suite
├── .github/workflows/  # CI/CD GitHub Actions pipelines
└── README.md
```

---

## License

This repository's source code is licensed under the [GNU General Public License v3.0](LICENSE.md).
