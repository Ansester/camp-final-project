# Contributing to CAMP

This document provides the rules and processes for contributing to the **CAMP (Campus Asset Management Platform)** project. Please review it before making contributions to ensure consistency and collaboration across the team.

---

## 📋 Table of Contents
1. [Team Norms](#team-norms)
2. [Git Workflow](#git-workflow)
3. [Development Environment Setup](#development-environment-setup)
4. [Coding Standards](#coding-standards)
5. [How to Contribute](#how-to-contribute)
6. [Pull Request Process](#pull-request-process)
7. [Building and Testing](#building-and-testing)

---

## 🧭 Team Norms

### Team Values
- **Respect:** Every voice matters; treat all feedback constructively.  
- **Communication:** Keep updates open and transparent.  
- **Collaboration:** Support teammates and review code with care.  
- **Accountability:** Own your assigned work and deliver on time.  
- **Quality:** Write maintainable, readable, and well-tested code.

### Work Expectations
- Commit regularly; don’t wait until the end of a sprint.  
- Review PRs within 24 hours.  
- Update task progress daily on the board.  
- Communicate blockers early.  
- Update documentation alongside new code.

---

## 🔁 Git Workflow

We follow the **Feature Branch Workflow**.

### Branch Naming
Use the format:  
`<type>/<short-description>`

Examples:
feature/add-login
fix/resolve-overdue-alert
docs/update-readme

perl
Copy code

### Commit Messages
Follow the format:
```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`  
**Scope:** The component/feature affected (optional but recommended)  
**Subject:** Brief description of the change  
**Example:** `feat(auth): implement JWT refresh token endpoint`

### Workflow Steps
```bash
# Create and checkout a feature branch
git checkout -b feature/add-dashboard

# Make your changes and commit regularly
git add .
git commit -m "feat(dashboard): add staff dashboard UI"

# Push to remote
git push origin feature/add-dashboard

# Open a Pull Request on GitHub
# All PRs go to the master branch
```

## ⚙️ Development Environment Setup

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB Atlas account (or local MongoDB 6.0+)
- Git
- VS Code (recommended)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/Ansester/camp-final-project.git
cd camp-final-project
```

**Backend Setup:**
```bash
cd back-end
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
nano .env

# Start development server
npm start
```

**Frontend Setup:**
```bash
cd ../front-end
npm install --legacy-peer-deps
npm run dev
```

### Environment Configuration

**Backend `.env` example:**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/camp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=8081
```

**Frontend `.env` example:**
```env
REACT_APP_USE_MOCK=false
REACT_APP_API_BASE=/api
```

### Default URLs
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:8081
- **API Health Check:** http://localhost:8081/health

## 💻 Coding Standards

### JavaScript & Node.js
- Use ES6+ syntax (const/let, arrow functions, destructuring)
- Prefer async/await over callbacks or promise chains
- Use meaningful variable names (camelCase)
- Keep functions focused on a single responsibility
- Add JSDoc comments for functions and complex logic

### React & Frontend
- Use functional components with React hooks exclusively
- Use PascalCase for component names
- Keep component files focused (one component per file when possible)
- Use meaningful prop names and include prop validation
- Extract reusable components to reduce duplication

### Backend Express.js
- Use middleware for cross-cutting concerns (auth, validation, logging)
- Keep route handlers clean; move business logic to models/services
- Use proper HTTP status codes
- Return consistent JSON error responses

### Formatting & Linting

**Frontend:**
```bash
cd front-end
npm run lint
npm run lint:fix
```

**Backend:**
Code should follow project conventions. Run tests to catch issues:
```bash
cd back-end
npm test
```
## 🧩 How to Contribute

1. **Select or Create an Issue**
   - Check the active GitHub Project Board for the repository or team workspace.
   - Find an unassigned task or create a new issue
   - Assign yourself and add the appropriate sprint milestone

2. **Create a Feature Branch**
   - Follow naming conventions: `feature/issue-description` or `fix/issue-description`
   - Example: `feature/add-notification-system`

3. **Implement & Test Changes**
   - Write code following our coding standards
   - Test your changes locally
   - Run linting and tests before committing
   - Update relevant documentation

4. **Commit & Push**
   - Commit with meaningful messages
   - Push regularly; don't wait until the end
   - Example: `git push origin feature/add-notification-system`

5. **Submit a Pull Request**
   - Open PR against the `master` branch
   - Include a clear description of changes
   - Reference the related issue (e.g., "Closes #42")
   - Request at least one team member to review

6. **Code Review**
   - Address reviewer feedback promptly
   - Re-request review after updates
   - Keep discussions constructive and collaborative

## 🔍 Pull Request Process

### Before Submitting a PR, Verify:
- [ ] Code follows our style guidelines
- [ ] All tests pass locally (`npm test` in relevant directory)
- [ ] No debugging code (console.logs, etc.)
- [ ] Documentation updated if adding new features
- [ ] Commit messages follow our convention
- [ ] No sensitive credentials in code

### PR Description Template
```markdown
## Description
Brief explanation of the changes made.

## Related Issue
Closes #<issue-number>

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested? Include any relevant test results.

## Screenshots
(if applicable)
```

### Review Process
- Team members will review and provide feedback within 24 hours
- Address feedback and push updates to the same branch
- Once approved, maintainer will merge using "Squash and Merge"
- Delete the feature branch after merging

## 🧪 Building and Testing

### Running Tests

**Backend Tests:**
```bash
cd back-end
npm test                    # Run all tests
npm run test:coverage      # Run with coverage report
npm test -- auth.test.js   # Run specific test file
```

**Frontend Build:**
```bash
cd front-end
npm run build              # Create production build
npm run lint               # Check code quality
```

### Test Coverage
- Backend tests use Mocha, Chai, and Supertest
- Aim for >80% code coverage on critical paths
- All new features should include corresponding tests
- Backend has 9 test suites covering major functionality

### CI/CD Pipeline
**Our project includes automated CI/CD:**
- **CI:** Runs on every PR (tests, linting, build)
- **CD:** Deploys to production on merge to master
- Configuration in `.github/workflows/`

View pipeline status in the README badges

## 👥 Team Members
- [Saad Iftikhar](https://github.com/saad-iftikhar)
- [Talal Naveed](https://github.com/TalalNaveed)
- [Shaf Khalid](https://github.com/Shaf5)
- [Akshith Karthik](https://github.com/Ak1016-stack)
- [Ashmit Mukherjee](https://github.com/ansester)

**Current Sprint (Sprint 4):**
- **Scrum Master:** Shaf Khalid
- **Product Owner:** Saad Iftikhar

For current role assignments, see the [README.md](./README.md#sprint-4-roles)

## 💬 Questions or Issues?

1. **Review this document** for answers
2. **Check existing GitHub issues** for similar problems
3. **Post in project discussions** or reach out via team chat
4. **Contact the Scrum Master** if the issue is urgent or process-related

---

**Thank you for contributing to CAMP!** Your work directly impacts the university community. Let's build something great together. 🚀
