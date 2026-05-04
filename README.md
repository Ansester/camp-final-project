# CAMP – Campus Asset Management Platform

![CI Status](https://github.com/Ansester/camp-final-project/actions/workflows/ci.yml/badge.svg)
![CD Status](https://github.com/Ansester/camp-final-project/actions/workflows/cd.yml/badge.svg)

## Product Vision Statement

For students and campus staff who struggle with fragmented systems and manual processes for borrowing and managing equipment, **CAMP (Campus Asset Management Platform)** is a mobile-friendly web application that centralizes the borrowing, reserving, and tracking of campus assets across facilities such as the IM Lab, Arts Centre, and Library.  

Unlike traditional or department-specific systems that rely on spreadsheets or manual logging, **CAMP** unifies all campus inventories under one platform, enabling real-time availability checks, automated notifications, and secure, transparent transactions — ultimately improving convenience, accountability, and efficiency across the university.

---

## Project Description

University campuses often manage hundreds of items from cameras and lab kits to musical instruments and sports gear using disjointed or manual systems. This leads to misplaced assets, missed deadlines, and communication breakdowns between students and staff. CAMP solves these issues by offering a centralized, intelligent platform where students can easily reserve and borrow items, and staff can efficiently track inventory, manage returns, and monitor overdue items.

---

## Key Features
 
- **Centralized Inventory Management:** Unified view of all available items across departments and facilitis.  
- **Pre-Booking System:** Students can reserve items in advance with transparent availability.  
- **Real-Time Notifications:**  
  - Automated reminders before due dates.  
  - Alerts for overdue returns.  
  - Notifications when desired items become available again.  
- **Payment Integration:** Secure campus cash system for deposits, fines, or fees.  
- **Cross-Platform Access:** Fully responsive web app accessible via mobile, tablet, or desktop.  

---

## Who Is This For?

**CAMP** is designed for all campus community members who interact with shared resources, particularly:

- **Students:** Borrowing cameras, laptops, lab kits, or sports gear.  
- **Staff:** Managing item issuance, returns, and inventory across multiple departments.   

---

##  Example Use Case

A photography student needs a DSLR camera for a weekend project. Using **CAMP**, they log in with their NetID, browse available items, and reserve a camera from the Arts Centre. They receive automated reminders before pickup and return deadlines. Meanwhile, staff can view real-time borrowing records, send overdue alerts, and track all transactions in one dashboard with no need for spreadsheets or manual emails.

---

## Team Members

- [Saad Iftikhar](https://github.com/saad-iftikhar)  
- [Talal Naveed](https://github.com/TalalNaveed)  
- [Shaf Khalid](https://github.com/Shaf5)  
- [Akshith Karthik](https://github.com/Ak1016-stack)  
- [Ashmit Mukherjee](https://github.com/ansester)  

## Sprint 0 Roles

- Product Owner: [Shaf Khalid](https://github.com/Shaf5)  
- Scrum Master: [Akshith Karthik](https://github.com/Ak1016-stack)

Developers  
- [Saad Iftikhar](https://github.com/saad-iftikhar)
- [Talal Naveed](https://github.com/TalalNaveed)
- [Shaf Khalid](https://github.com/Shaf5)
- [Akshith Karthik](https://github.com/Ak1016-stack)
- [Ashmit Mukherjee](https://github.com/ansester)

---

### Sprint 1 Roles:
- Scrum Master: Talal Naveed
- Product Owner: Ashmit Mukherjee
- Dev 1: Shaf Khalid
- Dev 2: Akshith Karthik
- Dev 3: Saad Iftikhar
---

### Sprint 2 Roles:
- Scrum Master: Saad Iftikhar
- Product Owner: Akshith Karthik
- Dev 1: Shaf Khalid
- Dev 2: Ashmit Mukherjee
- Dev 3: Talal Naveed
---

### Sprint 3 Roles:
- Scrum Master: Ashmit Mukherjee
- Product Owner: Talal Naveed
- Dev 1: Shaf Khalid
- Dev 2: Akshith Karthik
- Dev 3: Saad Iftikhar
---

### Sprint 4 Roles:
- Scrum Master: Shaf Khalid
- Product Owner: Saad Iftikhar
- Dev 1: Talal Naveed
- Dev 2: Ashmit Mukherjee
- Dev 3: Akshith Karthik
---
_Note: Scrum Master and Product Owner roles rotate each sprint so everyone gets experience in each role._

## Project History

**CAMP** was born out of a shared observation: many university facilities rely on separate or outdated systems for asset management. This leads to inefficiency, confusion, and wasted time for both students and staff.  

Our team set out to create a unified, easy-to-use platform that not only simplifies borrowing and reservations but also automates the most tedious parts of the process like reminders and overdue tracking while keeping data secure and transparent.  

By centralizing inventory data and integrating modern features like SSO, payment processing, and notifications, **CAMP** aims to become the campus-wide standard for asset management and resource sharing.

---

##  Contributing

We welcome contributions to **CAMP!** Please refer to our `CONTRIBUTING.md` file for detailed guidelines on:

- Team norms and coding conventions  
- Development workflow and Git branching strategy  
- Local setup instructions for backend and frontend environments  
- How to test, submit pull requests, and report issues  

---

##  Building and Testing

Details will be updated as the project progresses to the development and deployment phase. Planned tools and frameworks include:

- **Frontend:** React (with Tailwind CSS for UI)  
- **Backend:** Node.js  
- **Database:** MongoDB  
- **Authentication:** JWT
- **Hosting:** Digital Ocean

---

## Documentation

- **Product Backlog:** maintained in the active GitHub Projects workspace for the course team
- **Sprint Backlogs:** maintained in the active GitHub Projects workspace for the course team
- [**Contributing Guidelines**](./CONTRIBUTING.md)

---

##  What Makes This Feasible

**CAMP** is designed as a modular, scalable platform. The core reservation and tracking system serves as a foundation upon which advanced features like payment integration, analytics dashboards, or cross-department syncing can be incrementally added.  

The modular architecture ensures that each new feature can be developed independently without disrupting the base functionality — keeping the project both manageable and sustainable.

---

## What Makes This Appropriately Challenging

Developing **CAMP** involves tackling real-world software engineering challenges such as:

- Designing a **multi-role user system** (students vs. staff) with different permissions.  
- Implementing **real-time item availability and notifications**.  
- Ensuring **data consistency** across multiple departments and assets.  
- Integrating **secure authentication** and **payment systems**.  
- Delivering a **mobile-first UI** that remains intuitive despite complex functionality.  

These challenges make **CAMP** both a technically engaging and impactful project that directly benefits the university community.


### Sprint1 Breakdown



### Front-end Structure:

<img width="985" height="870" alt="image" src="https://github.com/user-attachments/assets/518acdd1-06e0-4d56-b8a5-dba9eefad058" />

## How to Build and Run the Project

This project consists of a **React** front-end with **Tailwind CSS** and an **Express.js** back-end API.

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/Ansester/camp-final-project.git
cd camp-final-project
```

#### 2. Install Dependencies

**Backend:**
```bash
cd back-end
npm install
npm start
```

**Frontend:**
```bash
cd ../front-end
npm install --legacy-peer-deps
npm run dev
```

#### 3. Environment Configuration

**Backend:**
Create a `.env` file in the `back-end` directory (copy from `.env.example` if available):
```bash
cd back-end
touch .env
```

Add necessary environment variables (database credentials, API keys, etc.).

**Frontend:**
Create a `.env` file in the `front-end` directory:
```bash
cd ../front-end
cp .env.example .env
```

Edit `.env` to configure:
```env
REACT_APP_USE_MOCK=false
REACT_APP_API_BASE=/api
```

Set `REACT_APP_USE_MOCK=true` if you want to use mock data instead of the real API.

#### 4. Run the Application

**Start the Backend Server (Terminal 1):**
```bash
cd back-end
npm start
```
The backend will run on [http://localhost:3000](http://localhost:3000)

**Start the Frontend Development Server (Terminal 2):**
```bash
cd front-end
npm run dev
```
The frontend will run on [http://localhost:3001](http://localhost:3001)

Open [http://localhost:3001](http://localhost:3001) in your browser to view the application.

#### 5. Running Tests

**Backend Tests:**
```bash
cd back-end
npm test
```

### Available Scripts

**Frontend:**
- `npm run dev` - Runs the app in development mode with hot reload
- `npm run build` - Builds the app for production to the `dist` folder
- `npm run lint` - Runs ESLint to check code quality

**Backend:**
- `npm start` - Starts the Express server
- `npm test` - Runs the test suite with Mocha and Chai
- `npm run test:mocha` - Alternative test command for environments with c8 binary restrictions

### Technology Stack

- **Frontend:** React 19.1.1, Tailwind CSS 4.1.16, Webpack 5
- **Backend:** Express.js 4.19.0, Node.js 20.19.6
- **Database:** MongoDB Atlas (Cloud Database)
- **Testing:** Mocha, Chai, Supertest, c8 (Code Coverage)
- **Build Tools:** Webpack, Babel, PostCSS
- **Deployment:** Digital Ocean Droplet, Nginx, PM2
- **CI/CD:** GitHub Actions

### Project Structure

```
camp-final-project/
├── front-end/          # React frontend application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── services/   # API and mock data services
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── back-end/           # Express.js backend API
│   ├── routes/         # API route handlers
│   └── tests/          # Unit tests
└── README.md
```

### Notes

- All credentials and sensitive information must be stored in `.env` files and never committed to version control
- The frontend uses webpack dev server with proxy configuration to route `/api` requests to the backend on port 3000
- Mock data is available for development without a database connection by setting `REACT_APP_USE_MOCK=true`

---

## Deployment

### Live Application

The application is designed for deployment on a Node.js server behind Nginx. If a public demo is active, add the stable HTTPS URL here rather than a raw server IP address.

### Demo Accounts

Sample users for local development are generated by `back-end/scripts/seed.js`. Do not reuse seeded demo credentials in production.

### Deployment Architecture

- **Server:** Digital Ocean Droplet (Ubuntu 24.04)
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2
- **Database:** MongoDB Atlas
- **CI/CD:** GitHub Actions

### CI/CD Implementation

**Extra Credit:** Both Continuous Integration and Continuous Deployment are implemented.

**Continuous Integration:**
- Runs automated tests on every pull request
- Tests on Node.js 18.x and 20.x
- Builds and lints code
- ![CI](https://github.com/Ansester/camp-final-project/actions/workflows/ci.yml/badge.svg)

**Continuous Deployment:**
- Deploys automatically on merge to master
- Updates backend and frontend
- Restarts services
- ![CD](https://github.com/Ansester/camp-final-project/actions/workflows/cd.yml/badge.svg)

Configuration files: `.github/workflows/`

### Infrastructure

1. Frontend served by Nginx at `/`
2. Backend API proxied through Nginx at `/api`
3. MongoDB Atlas for database
4. PM2 for process management
5. UFW firewall configured

### Updating the Deployment

To deploy new changes:

```bash
# SSH into the application host
ssh <user>@<host>

# Navigate to project directory
cd /var/www/camp-final-project

# Pull latest changes
git pull

# Update backend
cd back-end
npm install --production
pm2 restart camp-backend

# Update frontend
cd ../front-end
npm install
npm run build

# Restart nginx
systemctl restart nginx
```

### Monitoring

```bash
# View backend logs
pm2 logs camp-backend

# Check backend status
pm2 status

# Monitor nginx
systemctl status nginx

# Check MongoDB connection
pm2 logs camp-backend --lines 50 | grep -i mongo
```

---

*CAMP — Simplifying campus borrowing, one platform at a time.*

