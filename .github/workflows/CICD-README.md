# GitHub Actions Workflows

CI/CD workflows for the CAMP application.

## Workflows

### Continuous Integration (`ci.yml`)

Runs on every pull request and push to main. Tests backend on Node.js 18.x and 20.x, builds and lints frontend.

### Continuous Deployment (`cd.yml`)

Deploys to Digital Ocean on merge to main. Connects via SSH, updates code, restarts services.

## Required GitHub Secrets

Add these secrets to repository settings under `Settings` → `Secrets and variables` → `Actions`:

- `DROPLET_IP`: Public IP or hostname for the deployment server
- `SSH_PRIVATE_KEY`: Content of `~/.ssh/digitalocean_rsa` (full private key including BEGIN/END lines)

## Setup

1. Add secrets to GitHub (see above)
2. Enable workflows in repository Actions tab
3. CI runs on pull requests automatically
4. CD deploys on merge to main

View workflow status in the Actions tab.

## Troubleshooting

**CI Failures:** Check Actions tab logs, ensure tests pass locally.

**CD Failures:** Verify secrets are set correctly, check droplet accessibility, review PM2 logs with `pm2 logs camp-backend`.

**Build Warnings:** `CI=false` is set in workflow to prevent React warnings from failing builds.
