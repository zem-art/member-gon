# BeliKilat

Modern e-commerce web app built with React, TypeScript, Zustand, and Tailwind CSS v4.

## Tech Stack

| Tech                          | Purpose                              |
| ----------------------------- | ------------------------------------ |
| **React 19** + **TypeScript** | UI framework with type safety        |
| **Vite 7**                    | Dev server & bundler                 |
| **Tailwind CSS v4**           | Utility-first styling with dark mode |
| **Zustand**                   | Lightweight global state management  |
| **React Router v7**           | Client-side routing (HashRouter)     |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout, Navigation, Toast
│   │   ├── Layout.tsx
│   │   ├── DesktopNav.tsx
│   │   ├── MobileNav.tsx
│   │   └── Toast.tsx
│   ├── features/        # Cart, Checkout
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutModal.tsx
│   └── pages/           # Route pages
│       ├── HomePage.tsx
│       ├── TrackingPage.tsx
│       ├── HistoryPage.tsx
│       └── PaymentPage.tsx
├── stores/              # Zustand state management
│   ├── useCartStore.ts      # Cart (localStorage persisted)
│   ├── useOrderStore.ts     # Orders (API-backed)
│   ├── useThemeStore.ts     # Dark/Light theme
│   └── useUIStore.ts        # Toast notifications
├── services/
│   └── api.ts           # Centralized API service layer
├── types/
│   └── index.ts         # TypeScript interfaces
├── data/
│   └── products.ts      # Static product data (fallback)
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
└── index.css            # Tailwind + global styles
```

## API Integration

The app is **API-ready**. All data operations go through `src/services/api.ts`.

### Setup

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-api.com/api
```

Restart the dev server. All functions will automatically call your API instead of using localStorage.

**Without** `.env`, the app runs fully offline using static data and localStorage.

### API Endpoints

| Function                       | Method | Endpoint                     | Description               |
| ------------------------------ | ------ | ---------------------------- | ------------------------- |
| `fetchProducts()`              | GET    | `/products`                  | List all products         |
| `fetchProductById(id)`         | GET    | `/products/:id`              | Get single product        |
| `createOrderAPI()`             | POST   | `/orders`                    | Create new order          |
| `getOrderHistory(memberCode?)` | GET    | `/orders?member=:code`       | Order history             |
| `getOrderById(id)`             | GET    | `/orders/:id`                | Get single order          |
| `trackOrderAPI(id)`            | GET    | `/orders/:id/tracking`       | Track order status        |
| `getPaymentDetail(orderId)`    | GET    | `/payments/:orderId`         | Payment details           |
| `confirmPayment(orderId)`      | POST   | `/payments/:orderId/confirm` | Confirm payment           |
| `getPaymentMethods()`          | GET    | `/payment-methods`           | Available payment methods |

### Expected Response Formats

```typescript
// GET /products
Product[]

// POST /orders → Request body
{ customer: CustomerInfo, items: CartItem[], total: number }

// POST /orders → Response
Order { id, date, customer, items, total, bank, va, status }

// GET /orders/:id/tracking → Response
TrackingInfo { orderId, status, steps: TrackingStep[] }

// GET /payments/:orderId → Response
PaymentDetail { orderId, bank, va, total, status, expiredAt }
```

See `src/types/index.ts` for full type definitions.

## Features

- 🛒 **Cart** — Add/remove products, quantity controls, persisted in localStorage
- 💳 **Checkout** — Customer info form with courier & payment method selection
- 💰 **Payment** — Virtual Account details with copy-to-clipboard
- 📦 **Order Tracking** — Visual timeline with status progression
- 📋 **Order History** — View past orders with quick actions
- 🌙 **Dark Mode** — Toggle with system preference detection & persistence
- 📱 **Responsive** — Desktop nav + mobile bottom tab bar

## State Management

| Store           | Persistence        | Source                              |
| --------------- | ------------------ | ----------------------------------- |
| `useCartStore`  | localStorage       | Client-side only                    |
| `useOrderStore` | API / localStorage | API when `VITE_API_BASE_URL` is set |
| `useThemeStore` | localStorage       | Client-side only                    |
| `useUIStore`    | None (ephemeral)   | Client-side only                    |

## License

Private project.
