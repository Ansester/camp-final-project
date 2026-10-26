# CI and historical automation

`ci.yml` is the only active workflow. It runs on `main` pushes and pull requests, uses committed lockfiles on Node 22/24, and gates isolated backend integration tests, client lint, stubbed client API tests and the Webpack production build. Failures are not suppressed. It requires no service or deployment credentials.

`../archive/cd.yml.disabled` preserves the old DigitalOcean SSH deployment for historical context. `../archive/event-logger.yml.disabled` preserves the coursework event logger. Neither is a GitHub workflow or runs on pushes/PRs. The old remote host, SSH credentials, upstream branch and logging recipient have not been verified. Do not enable them without a fresh explicit deployment/recipient decision. This repository's CI does not establish production readiness or current live hosting.
