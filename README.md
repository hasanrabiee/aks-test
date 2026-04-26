# NestJS + Next.js Turborepo

This monorepo contains:

- `apps/web`: a Next.js frontend
- `apps/api`: a NestJS backend
- `packages/typescript-config`: shared TypeScript configuration

## Getting started

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:3001/api`.

## Docker and Helm

This repo includes:

- `apps/web/Dockerfile`: production image for the Next.js app
- `apps/api/Dockerfile`: production image for the NestJS API
- `deploy/helm/helm-try`: Helm chart for deploying both services to Kubernetes
- `deploy/helm/helm-try/values-azure.yaml`: AKS-oriented sample values

Helpful commands:

```bash
pnpm docker:build:web
pnpm docker:build:api
pnpm helm:lint
```

See [docs/azure-aks-deploy.md](/Users/hasan/Desktop/projects/helm-try/docs/azure-aks-deploy.md) for an AKS + Helm deployment flow.
