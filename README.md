# CAMP — Campus Asset Management Platform

CAMP is a [Fall 2025 team coursework project](https://github.com/agile-students-fall2025/4-final-camp) for browsing campus equipment, making reservations, and managing checkouts and returns. The current repository contains a React/Webpack client and an Express/Mongoose API. It is a demonstration, not a university-operated service.

## Team and contributions

The team was Saad Iftikhar, Talal Naveed, Shaf Khalid, Akshith Karthik, and Ashmit Mukherjee. Ashmit contributed staff API endpoints, equipment alerts and dashboard statistics, the Mocha/Chai testing setup, and client API utilities. He served as Product Owner in Sprint 1 and Scrum Master in Sprint 3. Application-wide design and implementation were shared team work. Later maintenance does not change this attribution.

## Run a local demo

Use Node.js 24 (`nvm use`; Node 22.15+ is supported), npm, and a local MongoDB replica set. Transactions are required for inventory changes, reservations and the fictional fine-payment ledger. No Atlas account or real payment account is required.

An optional Docker setup for an **empty local demo database**:

```sh
docker run --rm --name camp-demo-mongo -p 127.0.0.1:27017:27017 mongo:8.0 --replSet rs0 --bind_ip_all
```

In another terminal, initialize the local replica set once:

```sh
docker exec camp-demo-mongo mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"127.0.0.1:27017"}]})'
```

Start the backend from the repository root:

```sh
cd back-end
npm ci
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste that generated value into JWT_SECRET in .env.
npm run seed
npm start
```

The seed script accepts only a loopback MongoDB URI whose database is named `camp_demo`. It creates fictional records and publicly documented demo accounts. Run it once against an empty database; duplicate records are errors. `npm run seed -- --drop` clears that local demo database before reseeding. The guard refuses remote databases and `NODE_ENV=production`.

| Demo account | Email | Password |
| --- | --- | --- |
| Student | `si2356@univ.edu` | `Password123!` |
| Staff | `staff@univ.edu` | `StaffPass123!` |

These credentials are for the local seed only. Public registration creates students; staff/admin privileges must be provisioned through a trusted database administration process, never the public registration request.

Start the client in another terminal:

```sh
cd front-end
npm ci
npm run dev
```

Open **http://localhost:3001**. Webpack proxies `/api` to **http://localhost:3000**. Backend readiness is **http://localhost:3000/api/health** and reports 503 while disconnected. The server refuses to start without MongoDB and a JWT secret of at least 32 characters. Importing `app.js` does not open a connection or start jobs.

## Verify changes

```sh
cd back-end
npm ci
npm test
npm run test:coverage
cd ../front-end
npm ci
npm run lint
npm run test:api
npm run build
```

The backend suite starts its own temporary MongoDB replica set on loopback with `mongodb-memory-server`. It ignores `.env` and any supplied `MONGODB_URI`, creates synthetic fixtures, and stops/deletes its owned database afterward. The first run downloads a MongoDB binary. Tests exercise real password checks, bearer tokens, persisted roles, ownership, reservation/checkout concurrency, shared checkout/return aliases, persisted preferences, and inventory/payment rollback. There is no authentication bypass in test mode. Coverage is a report, not a claim of complete verification.

Client API tests replace `fetch` with a local stub; they make no network calls. CI gates tests, lint (including warnings), and the production build on Node 22/24 for `main` pushes and pull requests. It does not deploy. Historical droplet deployment and coursework event-logging workflows are disabled under `.github/archive/`.

## Demo boundaries

- **Payments and balances are fictional.** Neither payment URL contacts a payment provider or NYU Campus Cash. Only the authenticated fine owner can settle a pending fine using their demo balance. Both URLs use one transaction so duplicate requests cannot debit twice or overdraw the ledger. Card/cash payment methods are rejected. Staff can add fictional funds; no real money is collected.
- Notifications are stored in-app. Saving email/SMS preferences does not send email or SMS. There is no mail, SMS, SSO, or production identity integration.
- Reservation slot labels are a static demonstration schedule; creation checks overlapping reservations and current physical stock. Checkout, return, booking and cancellation serialize on the item in MongoDB transactions. The covered concurrent requests are local synthetic checks, not production load testing.
- JWTs are sent as bearer tokens and kept in browser local storage. The ten-minute inactivity prompt is a client convenience; server tokens expire according to `JWT_EXPIRES_IN` (seven days by default). There are no refresh tokens or HTTP-only authentication cookies.
- A historical team deployment used DigitalOcean/Nginx/PM2. This review did not verify or change any live deployment, database, infrastructure, or credentials.

Backend API details: [back-end/README.md](back-end/README.md). Client configuration: [front-end/README.md](front-end/README.md). Design artifacts: [UX-DESIGN.md](UX-DESIGN.md). Source license: [GPL-3.0](LICENSE.md).
