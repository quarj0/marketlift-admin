# Marketlift Admin

Standalone Next.js administration console for Marketlift.

## Production administration areas

- Dashboard and operational queues
- Users, sellers and listings
- Categories and moderation
- Seller identity verification/manual review
- Reports and support
- Seller plans, payments and promotions
- **Markets**: enable/disable/default countries, provider methods and per-market prices
- **Analytics** with market scoping
- Activity/audit log
- Platform settings
- **Production readiness**: safe status for security, database/PostGIS, Redis/realtime, email, storage, geocoder, providers and market launch blockers

Provider secrets are never stored or displayed in the browser. Configure them in the backend deployment secret store, then use Markets/Production readiness to finish activation.

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

Use `.env.example` as the deployment-variable contract. Frontend feature flags are no longer required for payments or verification; backend capabilities are authoritative.
