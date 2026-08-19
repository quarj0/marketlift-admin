# Marketlift admin ↔ marketplace contract

This admin frontend must model the same product rules as the consumer marketplace. The API will become authoritative when backend integration starts.

## Account model

- Marketlift has one user account type.
- Buying and selling use the same account.
- Selling is an optional capability/profile attached to a user account.
- Suspending a selling profile does not automatically delete or suspend the underlying user account.

## Listing lifecycle

Supported listing states:

- `draft`
- `published`
- `paused`
- `sold`
- `expired`
- `under_review`
- `rejected`
- `removed`

Ordinary listings publish after automated validation. `under_review` is exceptional and should be driven by risk signals, reports or category policy rather than a universal admin approval queue.

## Verification

- Buyers do not need CPF verification.
- Seller identity verification is optional by default.
- Verification may be required for higher-risk categories or activity.
- CPF is private and must never be displayed publicly.
- A verified badge is a trust signal, not a transaction guarantee.

## Product payments

Marketlift does not process buyer-to-seller product payments and does not provide escrow in V1. The service-payment ledger is only for Marketlift fees:

- selling-plan subscriptions
- listing promotions

Supported service-payment methods are Pix, card and boleto. Statuses are pending, paid, failed and cancelled.

## Selling plans

| Plan | Monthly | Yearly | Active listing limit | Featured credits | Visibility weight |
| --- | ---: | ---: | ---: | ---: | ---: |
| Free | R$ 0 | R$ 0 | 5 | 0 | 1.0× |
| Basic | R$ 39,90 | R$ 399 | 25 | 0 | 1.1× |
| Pro | R$ 89,90 | R$ 899 | 100 | 4/month | 1.35× |
| Business | R$ 199,90 | R$ 1.999 | 300 | 12/month | 1.6× |

## Promotion products

| Product | Duration | Price |
| --- | ---: | ---: |
| Featured | 7 days | R$ 19,90 |
| Top of Search | 3 days | R$ 14,90 |
| Urgent | 7 days | R$ 9,90 |
| Homepage Featured | 3 days | R$ 29,90 |

## Top-level category IDs

The stable IDs are API contracts and should not change when display labels are renamed:

- `phones` — Mobile Phones
- `electronics` — Electronics
- `computers` — Computers
- `vehicles` — Vehicles
- `properties` — Properties
- `land` — Land
- `home` — Home & Garden
- `fashion` — Fashion
- `services` — Services
- `jobs` — Jobs
- `agriculture` — Agriculture
- `business` — Business
- `other` — Other

## Availability reports

A buyer can report that a seller said an item is sold or unavailable while its listing remains live. A single report is a moderation signal and must not automatically remove another user's listing. Production policy may use seller confirmation, multiple independent reports, risk signals and moderator decisions before changing listing status.

## Admin listings collection

The admin Listings screen is the operational view over the complete marketplace listing collection. It must not depend on a client-side copy of all records in production.

Recommended endpoint shape:

```http
GET /api/admin/listings?q=&status=&category=&seller_type=&attention=&page=1&page_size=25
```

Supported filters should include:

- listing title, listing ID, seller and location search
- all listing lifecycle statuses
- stable category ID
- individual/business seller profile
- reported listings
- availability reports
- promoted listings
- high-risk listings

Recommended response:

```json
{
  "count": 128459,
  "page": 1,
  "page_size": 25,
  "results": []
}
```

The frontend pagination and filters are intentionally structured so the mock array can be replaced by this server-paginated collection without redesigning the Listings page.
