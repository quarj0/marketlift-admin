# Marketlift Admin

Standalone administration frontend for Marketlift (`dash.marketlift.br`).

## Stack

- Next.js 16.3.1 (App Router)
- React 19.2.8
- TypeScript
- Tailwind CSS 4

## Included admin areas

- Secure admin login shell
- Dashboard and action queues
- Users and user detail
- Sellers and seller detail
- Listings and listing detail
- Categories
- Moderation
- Seller verification and review detail
- User reports and investigation detail
- Subscription plans
- Payments and transaction monitoring
- Promotions
- Analytics
- Support
- Immutable activity/audit log UI
- Platform settings

The current data layer is mocked in `src/data/mock-data.ts` so the frontend can be reviewed independently before Django API integration.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`. The root route redirects to `/dashboard`; `/login` shows the admin sign-in experience.
