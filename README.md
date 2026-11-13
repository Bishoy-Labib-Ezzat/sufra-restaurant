# Sufra: restaurant ordering + kitchen dashboard

A complete frontend for a restaurant that serves food and drinks:

- **Shop** (`/`): browse the menu, add to an order, check out (delivery or pickup), then follow the order's status live.
- **Dashboard** (`/dashboard`): staff sign in, run incoming orders on a ticket board, change statuses, manage menu items and categories, and see the day's numbers.

There is no backend yet. Every request goes through a real HTTP client and is answered **in the browser** by a mock backend that persists to `localStorage`. An order placed in the shop shows up in the dashboard (even in another tab), and status changes made there show up on the customer's tracking page.

## Run it

```bash
npm install
npm run dev        # http://localhost:5180
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |

### Demo accounts (mock backend only)

| Role | Email | Password | Can do |
| --- | --- | --- | --- |
| Manager | `nour@sufra.test` | `sufra-admin` | Everything |
| Floor staff | `karim@sufra.test` | `sufra-staff` | Orders and overview, not the menu |

The login page offers one-click buttons for both. **Reset demo data** in the dashboard sidebar restores the original menu and a fresh week of orders.

## Try the whole flow

1. Open `/menu`, add a few dishes and a drink, open the order, and check out.
2. Note the order number on the confirmation page and keep that tab open.
3. In another tab, open `/dashboard` and sign in. The new order is in the **New** lane.
4. Move it along (Start review, Confirm, Send to kitchen, and so on). The customer tab updates within about 10 seconds.

## Project structure

```
src/
  app/              App shell: providers, router (dashboard code-split), error and 404 pages
  main-shopping/    Customer side
    components/     home, menu, cart, checkout, order (tracking) UI
    hooks/          useMenu, useCheckout, useTrackOrder, scroll-spy, ...
    lib/            Pure logic: menu grouping and filtering, checkout schema and request mapping
    store/          Cart (persisted) and shop UI state (zustand)
    layout/ pages/
  dashboard/        Restaurant side
    components/     orders (board, ticket, panel, table), overview (charts, tally), menu, categories
    hooks/          Order queries and optimistic status updates, menu mutations, stats, new-order alerts
    lib/            Form schemas, date-range presets
    layout/ pages/
  shared/           Used by both sides
    api/            HTTP client, error type, endpoint map, query keys, React Query client
    services/       One service per feature: auth, categories, products, orders, stats
    types/          Domain models and request/response contracts
    auth/           AuthProvider, token storage, RequireAuth / RequirePermission, role permissions
    lib/            Pricing, order status flow, phone rules, formatting, image helpers
    ui/             Design-system components: Button, form fields, Overlay, Toast, states, ...
    styles/         Tailwind v4 theme tokens and base styles
  mocks/            The in-browser backend: seed data, a localStorage "database", MSW handlers
```

Rules that keep it maintainable:

- **UI never calls `fetch`.** Components use hooks, hooks use services, services use `apiClient`.
- **Business rules live in plain functions** (`shared/lib`, `*/lib`), so the client and the mock server share the same pricing and status-flow logic.
- **Server state** is React Query (loading, error, cache, polling, optimistic updates). **Client state** is zustand (cart, UI).
- **Every form** uses react-hook-form + zod, with inline errors and server-side field errors mapped back to fields.

## Switching to a real backend

1. Implement the endpoints in `src/shared/api/endpoints.ts` with the request and response types in `src/shared/types`. The mock handlers in `src/mocks/handlers` are a working reference for each one, including validation and error shapes (`{ code, message, fieldErrors? }`).
2. Create `.env` (see `.env.example`):

   ```bash
   VITE_API_BASE_URL=https://api.example.com
   VITE_USE_MOCKS=false
   ```

That is the whole switch. With mocks off, the mock code is never downloaded.

Auth expects `POST /auth/login` to return `{ token, expiresAt, user }`. The client sends `Authorization: Bearer <token>` and signs the user out on any `401`.

## Design notes

- One visual system across both sides: sage paper, forest-black ink, tomato as the single accent. Bricolage Grotesque (condensed) for display, Geist for text, Geist Mono for numbers and order codes.
- The order **ticket** is the shared motif: customers get a perforated receipt, and staff move the same ticket across the board.
- Light theme only, English only, as specified.
- Food photos are real photography from Unsplash.
