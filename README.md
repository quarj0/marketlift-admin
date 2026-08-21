# Marketlift Admin

Standalone administration frontend for Marketlift (`admin.marketlift.com.br`).

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
- Seller verification and review detail (**Upcoming**)
- User reports and investigation detail
- Subscription plans (**Upcoming**)
- Payments and transaction monitoring (**Upcoming**)
- Promotions (**Upcoming**)
- Analytics
- Support
- Immutable activity/audit log UI
- Platform settings

The console uses the authenticated Marketlift REST and GraphQL APIs. Payments, paid subscriptions, listing promotions and CPF verification remain behind disabled release flags until their providers complete production certification.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`. The root route redirects to `/dashboard`; `/login` shows the admin sign-in experience.

For production, use `.env.production.example`, deploy this application at
`https://admin.marketlift.com.br`, and keep both provider feature flags set to
`false` until the backend providers are certified.
