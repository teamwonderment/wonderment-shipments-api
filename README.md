# Shipment Tracking API Example

A minimal TypeScript/JavaScript example of a **headless tracking page** built on Wonderment’s **Shipments Search API**.

Use this repo to learn how the API works end-to-end: look up a shipment by tracking number or order name, pass a small customer auth token, and render status + events in a simple browser widget.

## What you’ll learn

1. How Wonderment’s Shipments Search endpoint is called (`GET /2022-10/shipments/search/...`)
2. Why your **API key stays on a server** (never in the browser)
3. How the optional **`t` auth token** proves the visitor is allowed to see that order
4. How a tiny widget turns the JSON response into a tracking UI

## How the pieces fit together

```
Browser (TrackingWidget)
    → POST /api/tracking/:searchTerm?t=...   (your local Express server)
        → GET https://api.wonderment.com/2022-10/shipments/search/:searchTerm?t=...
            (Wonderment Shipments Search API + your access token)
```

| Piece | Role |
| --- | --- |
| `index.html` | Demo page that creates the widget and calls `track(...)` |
| `tracking-client.ts` / `.js` | Browser widget: calls your server, renders status + events |
| `server.js` | Local proxy: holds the API key, forwards the search to Wonderment |
| `ShipmentsApiExample.ts` | Alternate typed Express wrapper (cache, rate limit, validation) |

The browser never talks to Wonderment directly. That keeps `X-Wonderment-Access-Token` secret.

## Prerequisites

- Node.js (v14 or higher) and npm
- A Wonderment API key (from your Wonderment / Track by Loop account)
- A real tracking number **or** order name from that same shop
- A matching customer auth token (`t`) when search auth is enabled for the shop

## Quick Start

1. Clone this repository:

```bash
git clone https://github.com/teamwonderment/wonderment-shipments-api.git
cd wonderment-shipments-api
```

2. Install dependencies:

```bash
npm install
```

3. Set your API key in a `.env` file in the project root (recommended):

```bash
WONDERMENT_DEMO_API_KEY=your_api_key_here
```

`server.js` reads that value and sends it as the `X-Wonderment-Access-Token` header. Do **not** put the key in `index.html` or `tracking-client.js`.

4. Update the sample lookup in `index.html` with a tracking number (or order name) and auth token from your shop:

```javascript
// Format: "<searchTerm>?t=<base64-token>"
widget.track('9200190379218000011551?t=eyJlbWFpbCI6IndvbmdiaW5AZ21haWwuY29tIn0=');
```

5. Start the server:

```bash
node server.js
```

6. Open [http://localhost:3000](http://localhost:3000). You should see shipment status and a table of tracking events.

## Understanding the Shipments Search API

### Endpoint

```http
GET https://api.wonderment.com/2022-10/shipments/search/{searchTerm}?t={token}
```

Headers:

```http
Accept: application/json
X-Wonderment-Access-Token: <your Wonderment API key>
```

This example’s server builds that request for you in `server.js`.

### `searchTerm`

The value in the path is what you are looking up. It is typically one of:

- A **carrier tracking number** (e.g. `9200190379218000011551`)
- An **order name** from Shopify (e.g. `#1234` or `1234`, depending on how the shop stores it)

If nothing matches (or auth fails), Wonderment responds as if the order was not found.

### The `t` auth token

Many shops require a small proof that the visitor owns the order. That proof is the query param `t`: a **Base64-encoded JSON** object.

Example JSON:

```json
{ "email": "customer@example.com" }
```

Encode it (any Base64 tool works):

```bash
echo -n '{"email":"customer@example.com"}' | base64
# eyJlbWFpbCI6ImN1c3RvbWVyQGV4YW1wbGUuY29tIn0=
```

Supported fields inside the JSON:

| Field | Purpose |
| --- | --- |
| `email` | Customer email associated with the order |
| `phone` | Customer phone associated with the order |
| `query` | Optional alternate search string (overrides the path `searchTerm` when present) |

In the demo page, the widget accepts a combined string:

```text
<searchTerm>?t=<base64-token>
```

It splits on `?t=`, then calls your local route:

```http
POST /api/tracking/<searchTerm>?t=<base64-token>
```

Your server then calls Wonderment with the same `searchTerm` and `t`.

### Example response

A successful search returns one or more shipments. The widget uses the first one:

```json
{
  "shipments": [
    {
      "trackingCode": "9200190379218000011551",
      "carrierName": "USPS",
      "statusDetails": {
        "status": "DELIVERED",
        "details": "Delivered",
        "date": "2024-04-09T14:30:00Z"
      },
      "events": [
        {
          "date": "2024-04-09T14:30:00Z",
          "status": "Delivered",
          "locationDisplay": "New York, NY"
        }
      ],
      "order": {
        "id": "...",
        "name": "#1234"
      }
    }
  ]
}
```

Useful fields for a tracking UI:

- `statusDetails.status` — high-level status (`IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, …)
- `events` — timeline rows (date, status, location)
- `trackingCode` / `carrierName` — what to show the customer
- `order.name` — Shopify order label when the search was by order

## Implementing the widget

1. Add a container:

```html
<div id="tracking-container"></div>
```

2. Import the widget and call `track` with search term + token:

```html
<script type="module">
  import { TrackingWidget } from './tracking-client.js';

  const widget = new TrackingWidget('tracking-container');
  widget.track('YOUR_TRACKING_OR_ORDER?t=YOUR_BASE64_TOKEN');
</script>
```

Styling lives in `index.html` (status tag colors) and in the HTML returned by `TrackingWidget.render` in `tracking-client.ts` / `.js`.

## Project structure

| File | Description |
| --- | --- |
| `server.js` | Runnable Express proxy used by the Quick Start |
| `tracking-client.ts` / `.js` | Browser widget (TypeScript source + JS used by the page) |
| `index.html` | Demo page |
| `ShipmentsApiExample.ts` | Typed server class with caching and rate limiting |
| `TrackingWidget.ts` | Alternate minimal widget sketch |
| `routes/tracking.ts` | Router-style version of the proxy |

For learning the live API path used by the demo, start with **`server.js` + `tracking-client.ts` + `index.html`**.

## Common issues

| Symptom | Likely cause |
| --- | --- |
| `Token (t) is required` | `track(...)` was called without `?t=...`, or the string did not split correctly |
| `401` / “We couldn't find that order” | Email/phone in the token does not match the order, or the search term is wrong |
| `402` | Shop needs an active Wonderment paid plan for Shipments Search |
| `403` | API key missing the `shipments:read` (or equivalent) scope |
| Empty “No tracking information found” | Search returned `shipments: []` — check term, shop, and token |
| Module import errors in the browser | Use `type="module"` on the script tag (see `index.html`) |

## Security notes

- Keep `WONDERMENT_DEMO_API_KEY` only on the server (`.env` / environment), never in client JS
- Treat `t` as customer-scoped proof of access; generate it on a trusted system when you send tracking links
- This demo is intentionally small — add rate limiting and stricter validation before production (see `ShipmentsApiExample.ts` for a starting point)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
