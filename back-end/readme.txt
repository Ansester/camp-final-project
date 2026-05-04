# CAMP Back-End API

Complete Express.js REST API with MongoDB database integration for the Campus Asset Management Platform (CAMP).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB 6.0+)
- Git

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB Atlas credentials
nano .env

# Seed database with sample data
node scripts/seed.js

# Start development server
npm run dev
```

Server runs on `http://localhost:8081`

Health check: `http://localhost:8081/health`

---

## 📚 Documentation

- **[Database Schema](./SCHEMA.md)** - Complete MongoDB schema with relationships and indexes
- **[Sprint 3 Implementation](./SPRINT3_IMPLEMENTATION_TRACKING.md)** - Team assignments and commit tracking
- **[Test Results](./SPRINT3_TEST_RESULTS.md)** - Sprint 3 testing documentation
- **[API Endpoints](#api-endpoints)** - Full endpoint reference below

---

## 🗄️ Database Setup

### MongoDB Atlas (Production)

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Copy connection string to `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/camp?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=8081
NODE_ENV=development
```

### Local MongoDB (Development)

```bash
# Install MongoDB Community Edition
brew install mongodb-community@6.0  # macOS
# or follow: https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
brew services start mongodb-community@6.0

# Use local connection string in .env
MONGODB_URI=mongodb://localhost:27017/camp-dev
```

### Seed Sample Data

```bash
# Seed database with sample users, items, facilities, etc.
node scripts/seed.js

# Drop existing data and reseed
node scripts/seed.js --drop
```

**Test Credentials:**
- Student: `si2356@univ.edu` / `Password123!`
- Staff: `staff@univ.edu` / `StaffPass123!`
- Admin: `admin@univ.edu` / `AdminPass123!`

---

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19
- **Database**: MongoDB 6.0+ with Mongoose ODM 8.1
- **Authentication**: JWT (jsonwebtoken 9.0) + bcrypt (bcryptjs 2.4)
- **Validation**: express-validator 7.0
- **Security**: express-rate-limit 7.1
- **Testing**: Jest 29.7 + Supertest 6.3

### Project Structure

```
back-end/
├── config/
│   └── database.js          # MongoDB connection with retry logic
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── validation.js        # Express-validator rules
│   └── rateLimiter.js       # Rate limiting configuration
├── models/
│   ├── User.js              # User schema with bcrypt hooks
│   ├── Item.js              # Equipment/resource schema
│   ├── Facility.js          # Physical location schema
│   ├── Borrowal.js          # Checkout tracking schema
│   ├── Reservation.js       # Reservation schema
│   ├── Fine.js              # Financial penalty schema
│   ├── Notification.js      # User notification schema
│   └── Waitlist.js          # Item waitlist queue schema
├── routes/
│   ├── auth.js              # Authentication endpoints (JWT)
│   ├── items.js             # Item CRUD with search/filter
│   ├── users.js             # User profile management
│   ├── borrowals.js         # Checkout/return/renew
│   ├── reservations.js      # Item reservations
│   ├── facilities.js        # Facility listings
│   ├── fines.js             # Fine management & payment
│   ├── notifications.js     # Notification preferences
│   ├── dashboard.js         # User dashboard statistics
│   ├── waitlist.js          # Waitlist management
│   ├── payments.js          # Payment processing
│   ├── staff.js             # Staff-only endpoints
│   ├── policies.js          # System policies
│   ├── alerts.js            # User alerts
│   └── help.js              # Help content
├── scripts/
│   └── seed.js              # Database seeding script
├── tests/
│   └── *.test.js            # Jest test suites
├── utils/
│   └── jwt.js               # JWT helper functions
├── app.js                   # Express app configuration
├── server.js                # HTTP server entry point
└── package.json             # Dependencies and scripts
```

### Security Features

1. **JWT Authentication**
   - Token expiration: 24 hours
   - Refresh token: 7 days
   - Secure httpOnly cookies

2. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Minimum 8 characters
   - Required: uppercase, lowercase, number, special char

3. **Rate Limiting**
   - General API: 100 requests / 15 minutes
   - Auth endpoints: 5 requests / 15 minutes
   - Payment endpoints: 10 requests / 15 minutes

4. **Input Validation**
   - Express-validator on all POST/PUT endpoints
   - MongoDB injection prevention
   - XSS protection via sanitization

5. **Authorization**
   - Role-based access control (RBAC)
   - Student/staff/admin roles
   - Route-level middleware enforcement

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new student account |
| POST | `/api/auth/login` | None | Login (returns JWT) |
| POST | `/api/auth/student/login` | None | Student-specific login |
| POST | `/api/auth/staff/login` | None | Staff-specific login |
| GET | `/api/auth/me` | User | Get current user info |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Staff | List all users (paginated) |
| GET | `/api/users/:userId` | User/Staff | Get user profile |
| PUT | `/api/users/:userId` | User/Staff | Update user profile |

### Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/items` | Public | List items (search, filter, paginate) |
| GET | `/api/items/:id` | Public | Get item details |
| GET | `/api/items/facility/:name` | Public | List items by facility |
| POST | `/api/items` | Staff | Create new item |
| PUT | `/api/items/:id` | Staff | Update item |
| DELETE | `/api/items/:id` | Staff | Soft delete item |

### Borrowals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/borrowals` | User | Get user's active borrowals |
| GET | `/api/borrowals/history` | User | Get borrowal history |
| GET | `/api/borrowals/overdue` | Staff | Get all overdue items |
| POST | `/api/borrowals/checkout` | Staff | Check out item to user |
| PUT | `/api/borrowals/:id/return` | Staff | Return item |
| PUT | `/api/borrowals/:id/renew` | User | Renew borrowal |

### Reservations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reservations` | User | Get user's reservations |
| POST | `/api/reservations` | User | Create reservation |
| GET | `/api/reservations/slots` | User | Get available time slots |
| PUT | `/api/reservations/:id/cancel` | User/Staff | Cancel reservation |

### Facilities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/facilities` | Public | List all facilities |
| GET | `/api/facilities/:slug/items` | Public | List items at facility |

### Fines

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/fines` | User | Get user's fines |
| POST | `/api/fines/:id/pay` | User | Pay a fine |
| POST | `/api/fines` | Staff | Create fine |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | User | Get user's notifications |
| PUT | `/api/notifications/:id/read` | User | Mark notification as read |
| PUT | `/api/notifications/read-all` | User | Mark all as read |
| GET | `/api/notifications/preferences` | User | Get notification preferences |
| PUT | `/api/notifications/preferences` | User | Update preferences |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | User | Get user dashboard stats |

### Waitlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/waitlist` | User | Get user's waitlist entries |
| POST | `/api/waitlist` | User | Join waitlist for item |
| DELETE | `/api/waitlist/:id` | User | Leave waitlist |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/:fineId/pay` | User | Process payment |
| GET | `/api/payments/history` | User | Get payment history |

### Staff Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff/inventory` | Staff | Get full inventory |
| POST | `/api/staff/items` | Staff | Add new item |
| POST | `/api/staff/checkout` | Staff | Check out item |
| POST | `/api/staff/checkin` | Staff | Check in item |
| GET | `/api/staff/reservations` | Staff | Get all reservations |
| GET | `/api/staff/overdue` | Staff | Get overdue items |
| GET | `/api/staff/alerts` | Staff | Get dashboard statistics |
| GET | `/api/staff/fines` | Staff | Get all fines |

### System Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/policies` | Public | Get borrowing policies |
| GET | `/api/alerts` | User | Get user alerts |
| GET | `/api/help` | Public | Get help content |
| GET | `/health` | Public | Health check endpoint |

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js

# Watch mode
npm test -- --watch
```

### Test Structure

```
tests/
├── api.test.js                              # Basic API connectivity
├── app.test.js                              # Express app configuration
├── auth_waitlist_borrowals.test.js          # Auth + borrowal workflows
├── fines.test.js                            # Fine management
├── items.test.js                            # Item CRUD operations
├── notifications.test.js                    # Notification system
├── payment_dashboard.test.js                # Payments + dashboard
├── policies_facilities_alerts_help.test.js  # System routes
└── staff.test.js                            # Staff-only routes
```

### Test Results (Sprint 3)

```
Test Suites: 9 passed, 9 total
Tests:       34 passed, 5 failed (expected without MongoDB), 39 total
Coverage:    ~75% (routes), ~85% (models), ~70% (middleware)
```

**Expected Failures** (without MongoDB Atlas):
- Database connection timeout (5 tests)
- Fixed by configuring `MONGODB_URI` in `.env`

---

## 🔧 Development

### NPM Scripts

```bash
npm start          # Production server (requires build)
npm run dev        # Development server with nodemon
npm test           # Run Jest tests
npm run test:coverage  # Run tests with coverage report
npm run lint       # Run ESLint
npm run seed       # Seed database with sample data
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...       # MongoDB Atlas connection string
MONGODB_URI_TEST=mongodb://...      # Test database (optional)

# Authentication
JWT_SECRET=your-secret-key          # JWT signing key (change in production!)
JWT_EXPIRES_IN=24h                  # Token expiration

# Server
PORT=8081                           # Server port
NODE_ENV=development                # Environment (development/production/test)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000         # 15 minutes in milliseconds
RATE_LIMIT_MAX=100                  # Max requests per window
```

### Code Style

- **Linting**: ESLint with Airbnb config
- **Formatting**: Prettier (2 spaces, single quotes)
- **Naming**: camelCase for variables/functions, PascalCase for models

---

## 🐛 Debugging

### Enable Debug Logging

```bash
# Set debug level
DEBUG=camp:* npm run dev

# MongoDB query logging
MONGOOSE_DEBUG=true npm run dev
```

### Common Issues

**Issue**: `MongooseServerSelectionError: connection timeout`

**Solution**: Check MongoDB Atlas IP whitelist and connection string

---

**Issue**: `JsonWebTokenError: invalid signature`

**Solution**: Ensure `JWT_SECRET` matches between requests

---

**Issue**: `ValidationError: Path 'x' is required`

**Solution**: Check request body includes all required fields

---

**Issue**: `E11000 duplicate key error`

**Solution**: Unique constraint violation (netId, email, assetId)

---

## 📈 Performance

### Optimization Tips

1. **Use Projection**: Only fetch needed fields
   ```javascript
   User.find({}, 'firstName lastName email')
   ```

2. **Lean Queries**: Skip Mongoose document overhead
   ```javascript
   Item.find({ status: 'available' }).lean()
   ```

3. **Populate Sparingly**: Only populate what you need
   ```javascript
   Borrowal.find().populate('item', 'name category')
   ```

4. **Index Coverage**: Ensure queries use indexes
   ```javascript
   db.items.find({ status: 'available' }).explain('executionStats')
   ```

### Monitoring

- **MongoDB Atlas**: Built-in performance monitoring
- **Application Logs**: Winston logger (production)
- **Health Endpoint**: `/health` returns server status + DB connection

---

## 🚀 Deployment

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create camp-api

# Set environment variables
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# Run seed script
heroku run node scripts/seed.js
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8081
CMD ["node", "server.js"]
```

```bash
# Build image
docker build -t camp-api .

# Run container
docker run -p 8081:8081 \
  -e MONGODB_URI=mongodb+srv://... \
  -e JWT_SECRET=... \
  camp-api
```

---

## 🤝 Contributing

### Git Workflow

1. Create feature branch: `git checkout -b feature/new-endpoint`
2. Make changes and commit: `git commit -m "Add new endpoint"`
3. Push branch: `git push origin feature/new-endpoint`
4. Create Pull Request

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:
```
feat(auth): add refresh token endpoint

Implement JWT refresh token mechanism to avoid frequent re-authentication.
Tokens expire after 7 days.

Closes #42
```

### Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Security best practices followed

---

## 📝 Sprint 3 Implementation

### Team Assignments

See [SPRINT3_IMPLEMENTATION_TRACKING.md](./SPRINT3_IMPLEMENTATION_TRACKING.md) for detailed commit tracking.

**Core Infrastructure** (saadiftikhar04):
- MongoDB connection configuration
- 8 Mongoose models with schemas
- Authentication middleware
- Validation middleware

**Authentication & Users** (TalalNaveed):
- JWT authentication routes
- User management routes
- Authorization middleware

**Items & Inventory** (Shaf5):
- Item CRUD routes
- Borrowal routes
- User routes

**Reservations & Facilities** (Ak1016-stack):
- Reservation routes
- Facility routes
- Database seed script

**Staff & System** (Ansester):
- Staff routes
- Dashboard/alerts routes
- Fine management routes

---

## 📞 Support

- **Documentation**: See `SCHEMA.md` for database details
- **Issues**: Create GitHub issue with `[Bug]` or `[Feature]` prefix
- **Email**: equipment@university.edu

---

## 📄 License

MIT License - See LICENSE.md for details

---

## 🎓 Academic Project

This is a student project for Agile Development course (Fall 2024).
Not intended for production use without security audit and enhancements.

// [Task #500] Update: Update backend documentation and API refs
