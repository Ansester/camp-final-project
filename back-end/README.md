# CAMP API

Use the [root setup instructions](../README.md) for a local MongoDB replica set, `.env`, demo seeding, and startup. The API defaults to port 3000. This is coursework software with synthetic demo payments.

## Configuration

Copy [.env.example](.env.example) to `.env` and generate `JWT_SECRET` as described in the root README. `MONGODB_URI` and a secret of at least 32 characters are required at server startup. `JWT_EXPIRES_IN` defaults to `7d`. `CORS_ORIGIN` defaults to `http://localhost:3001`. Leave `TRUST_PROXY=0` for direct local access; set `1` only behind one trusted reverse proxy. Do not commit `.env`.

`npm start` connects before listening and schedules in-app reminder/fine checks after startup and hourly. `npm run dev` uses nodemon. `npm run seed` is restricted to an explicitly configured, local `camp_demo` database; `--drop` deletes only that demo data. Do not use seeded accounts on a shared service.

## Authentication and access

Use `Authorization: Bearer <token>` for private requests. Login responses contain the token and user without the password. Passwords are bcrypt hashes. Public registration accepts an omitted role or `student`; requests for staff/admin roles fail. Authorization loads the current active user from the database, so a role in a token cannot grant extra permissions. These same checks run in tests.

| Route | Access and response |
| --- | --- |
| `GET /api/health` | Public database readiness, 200 or 503 |
| `POST /api/auth/register` | Public student registration: `netId`, `email`, `password` (minimum six characters), `firstName`, `lastName`; optional `phone` |
| `POST /api/auth/login` | Public email/password login |
| `POST /api/auth/student/login` | Student email/password login |
| `POST /api/auth/staff/login` | Staff/admin email/password login |
| `GET /api/items`, `GET /api/items/:id` | Public catalog bundle / item detail |
| `GET /api/items/:id/suggested` | Public suggested-items bundle |
| `GET /api/facilities`, `GET /api/facilities/:slug/items` | Public facility array / item bundle |
| `GET /api/help`, `GET /api/policies` | Public demonstration content |
| `POST /api/items`, `PUT/DELETE /api/items/:id` | Staff/admin item create/update/soft-delete |
| `GET /api/reservations`, `POST /api/reservations` | Signed-in user's reservations; create with `itemId`, ISO `pickupDate` |
| `GET /api/reservations/slots` | Signed-in; static date/time labels, not a real availability calendar |
| `PUT /api/reservations/:id/cancel` | Owner or staff/admin |
| `GET /api/waitlist`, `POST /api/waitlist` | Signed-in user's entries; create with `itemId` |
| `DELETE /api/waitlist/:id` | Owner only |
| `GET /api/borrowals`, `GET /api/dashboard`, `GET /api/alerts` | Signed-in user's current data; query `userId` cannot impersonate another user |
| `GET /api/users` | Staff/admin user bundle |
| `GET/PUT /api/users/:userId` | Owner or staff/admin; profile updates allow names and phone only |
| `POST /api/users/add-funds` | Staff/admin; `userId`, positive finite `amount`; fictional funds only |
| `GET /api/fines` | Own fines; staff/admin may specify `userId` |
| `POST /api/fines` | Staff/admin; `userId`, nonnegative `amount`, `reason` |
| `POST /api/fines/:id/pay` | Owner; `paymentMethod: "demo-campus-cash"` |
| `POST /api/payments/:fineId/pay` | Owner; `method: "demo-campus-cash"`; same transaction as above |
| `GET /api/payments/history` | Own fictional payment history |
| `GET /api/notifications`, `GET /api/notifications/unread-count` | Own in-app notifications |
| `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all` | Own notifications |
| `GET/PUT /api/notifications/preferences` | Own persisted preferences; no outbound messaging |
| `/api/staff/*` | All routes require staff/admin; see below |

Staff endpoints include `GET /inventory`, `/reservations`, `/overdue`, `/alerts`, `/fines`, `/students/search?q=...`, `/students/:userId/borrowals`, `/borrowals/active`; `POST /items`, `/checkout`, and `/checkin`. Checkout takes `userId`, `itemId`, and optional ISO `dueDate`. Checkin takes `itemId` plus `borrowalId` or `userId`, with optional `condition` and `notes`. Legacy `POST /api/borrowals/checkout` and `PUT /api/borrowals/:id/return` are also staff-only.

IDs are MongoDB ObjectIds. Typical list routes use `page` (minimum 1) and `limit` (1–100). Item creation requires `name`, `description`, supported `category`, and a facility ObjectId. Models under [models/](models/) are the schema source.

## Tests

`npm test` runs Mocha/Chai/Supertest against a new temporary local MongoDB replica set. It never reads `.env`, seeds a configured service, or disables authentication. `npm run test:coverage` adds c8 coverage. First use downloads a MongoDB binary; unsupported platforms must supply a compatible binary to `mongodb-memory-server`, not a live database URI. [tests/setup.js](tests/setup.js) owns all database lifecycle/cleanup.

No deployment, penetration test, user study, real payment, email, or SMS validation is implied by these checks. The prior `readme.txt` has been replaced by this document because it described unimplemented Jest, refresh-token, cookie, logging, and deployment features.
