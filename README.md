# CAMP &mdash; Campus Asset Management Platform

![CI Status](https://github.com/Ansester/camp-final-project/actions/workflows/ci.yml/badge.svg)
![CD Status](https://github.com/Ansester/camp-final-project/actions/workflows/cd.yml/badge.svg)

CAMP is a mobile-friendly web application that centralizes the borrowing, reserving, and tracking of campus assets across facilities such as the IM Lab, Arts Centre, and Library. It replaces the fragmented spreadsheets and per-department logging systems used by many universities with a single platform that supports real-time availability checks, automated notifications, and transparent transactions.

---

## Features

- **Centralized inventory.** Unified view of all available items across departments and facilities.
- **Pre-booking.** Students can reserve items in advance with transparent availability windows.
- **Real-time notifications.** Automated reminders before due dates, alerts for overdue returns, and notifications when desired items become available.
- **Payment integration.** Secure handling of deposits, fines, and fees through campus cash.
- **Cross-platform access.** Responsive web interface accessible from mobile, tablet, and desktop.
- **Multi-role access.** Differentiated permissions for students borrowing items and staff managing inventory.

---

## Architecture

- **Frontend:** React 19 with Tailwind CSS 4, bundled via Webpack 5.
- **Backend:** Express.js 4 on Node.js 20.
- **Database:** MongoDB Atlas.
- **Authentication:** JWT.
- **Testing:** Mocha, Chai, Supertest, c8 for coverage.
- **Deployment:** Digital Ocean droplet with Nginx reverse proxy and PM2 process management.
- **CI/CD:** GitHub Actions for test, lint, build, and deploy.

```
camp-final-project/
├── front-end/          React application
│   ├── src/
│   │   ├── pages/      Page components
│   │   ├── services/   API and mock data services
│   │   ├── hooks/      Custom React hooks
│   │   └── utils/      Utility helpers
│   └── public/         Static assets
└── back-end/           Express.js API
    ├── routes/         Route handlers
    └── tests/          Unit and integration tests
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Setup

Clone the repository:

```bash
git clone https://github.com/Ansester/camp-final-project.git
cd camp-final-project
```

Install backend dependencies and start the API:

```bash
cd back-end
npm install
npm start
```

The backend runs on [http://localhost:3000](http://localhost:3000).

In a separate terminal, install frontend dependencies and start the dev server:

```bash
cd front-end
npm install --legacy-peer-deps
npm run dev
```

The frontend runs on [http://localhost:3001](http://localhost:3001).

### Configuration

Create a `.env` file in `back-end/` with database credentials and any required API keys.

Create a `.env` file in `front-end/`:

```env
REACT_APP_USE_MOCK=false
REACT_APP_API_BASE=/api
```

Set `REACT_APP_USE_MOCK=true` to develop against the in-memory mock services without a database connection.

### Available Scripts

**Frontend:**

- `npm run dev` &mdash; development server with hot reload
- `npm run build` &mdash; production build to `dist/`
- `npm run lint` &mdash; ESLint

**Backend:**

- `npm start` &mdash; start the Express server
- `npm test` &mdash; full test suite with coverage (Mocha, Chai, c8)
- `npm run test:mocha` &mdash; run tests without c8 (for environments where the binary is restricted)

---

## CI/CD

Both continuous integration and continuous deployment are configured via GitHub Actions.

**CI** runs on every pull request, executing tests on Node 18 and 20 alongside lint and build steps.

**CD** deploys to the production droplet on merge to the default branch: pulls the latest code, installs dependencies, restarts the backend via PM2, rebuilds the frontend bundle, and reloads Nginx.

Workflow definitions live in `.github/workflows/`.

---

## Deployment

The production environment is a Digital Ocean droplet running Ubuntu 24.04 with Nginx as a reverse proxy and PM2 managing the Node process. The frontend bundle is served statically; backend API calls are proxied through `/api`.

Manual redeploy:

```bash
ssh <user>@<host>
cd /var/www/camp-final-project
git pull

cd back-end
npm install --production
pm2 restart camp-backend

cd ../front-end
npm install
npm run build

sudo systemctl restart nginx
```

---

## Team

CAMP was built collaboratively by:

- [Saad Iftikhar](https://github.com/saad-iftikhar)
- [Talal Naveed](https://github.com/TalalNaveed)
- [Shaf Khalid](https://github.com/Shaf5)
- [Akshith Karthik](https://github.com/Ak1016-stack)
- [Ashmit Mukherjee](https://github.com/Ansester)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow, branching strategy, and coding conventions.

---

## License

Released under the GNU General Public License v3.0. See [LICENSE.md](./LICENSE.md).
