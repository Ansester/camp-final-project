# Contributing to CAMP

CAMP is a five-person NYU Abu Dhabi coursework project. Preserve team attribution and describe individual contributions precisely; do not represent historical deployments, synthetic data, or demo payments as current live services.

Use a feature branch and open pull requests against `main`. Follow [README.md](README.md) for Node, MongoDB and environment setup. Commit both npm lockfiles and use `npm ci` to reproduce dependencies. Never commit `.env`, credentials, database contents, or generated bundles.

Before review, run:

```sh
cd back-end
npm test
cd ../front-end
npm run lint
npm run test:api
npm run build
```

Backend tests own a disposable local database. Do not change them to use a shared service or bypass authentication. New access-control and state-transition changes should cover forbidden cases as well as successful requests. Document actual checks and limitations; do not invent coverage or passing-test totals.

CI runs tests, lint and builds on `main` pushes and pull requests. It does not deploy or post coursework activity to another service. Historical SSH deployment and event-logging workflows remain disabled in `.github/archive/`; enabling either requires a fresh infrastructure and recipient review.

Team: Saad Iftikhar, Talal Naveed, Shaf Khalid, Akshith Karthik, Ashmit Mukherjee. See the root README for Ashmit's bounded contribution record. License: [GPL-3.0](LICENSE.md).
