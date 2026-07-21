# Multikart — Frontend (React + Bootstrap)

A React + Bootstrap frontend for the Multi-Role MERN E-Commerce backend — Customer storefront, Vendor dashboard, and Admin dashboard in one app.

Built with: React 18, Vite, React Router v6, React Bootstrap, Axios, **Redux Toolkit** (cart state), **Context API** (auth/session state), React Toastify, React Icons.

## 1. Requirements

- Node.js 18+
- Your backend server running (see the `server` project) — by default expected at `http://localhost:5000`

## 2. Setup

```bash
cd client
npm install
cp .env.example .env
```

`.env` just needs your backend's URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

## 3. Run it

```bash
npm run dev
```

Open `http://localhost:3000`. Make sure your backend (`npm run dev` inside `server/`) is running at the same time — this app talks to it for everything.

## 4. Trying out all three roles

1. **Customer**: click "Sign up" and register normally — new accounts are customers by default. Browse products, add to cart, check out, leave reviews.
2. **Admin**: run `npm run seed:admin` in the backend, then log in with those credentials here. You'll see an "Admin" link in the navbar leading to `/admin` — manage users, brands, categories, products, and orders.
3. **Vendor**: as an Admin, go to Admin → Users → change a user's role to "Vendor" (or promote your own second test account). Log in as that user to reach `/vendor` — add products, view orders containing them.

## 5. Project structure

```
client/
├── src/
│   ├── api/axiosInstance.js       # axios instance, attaches JWT, handles 401s
│   ├── context/AuthContext.jsx    # auth/session state (Context API)
│   ├── store/                     # cart state (Redux Toolkit)
│   │   ├── store.js               # configureStore
│   │   ├── cartSlice.js           # createSlice + async thunks calling the Cart API
│   │   └── CartSync.jsx           # bridges AuthContext login state -> cart fetch/reset
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, ProtectedRoute, DashboardLayout
│   │   ├── common/                # Loader, Pagination, StarRating, ConfirmModal, EmptyState
│   │   └── product/ProductCard.jsx
│   ├── pages/
│   │   ├── Home, ProductDetails, Cart, Checkout, MyOrders, OrderDetails, Profile, Login, Register
│   │   ├── admin/                 # AdminDashboard, AdminUsers, AdminBrands, AdminCategories, AdminProducts, AdminOrders
│   │   └── vendor/                # VendorDashboard, VendorProducts, VendorProductForm, VendorOrders
│   ├── utils/                     # imageUrl.js, formatCurrency.js
│   ├── styles/theme.css           # design tokens (see below)
│   └── App.jsx                    # all routes
```

## 6. Why Redux for cart, but Context for auth?

Your spec listed "Redux Toolkit or Context API" as options — this app deliberately uses **both**, each where it fits best:

- **Cart → Redux Toolkit** (`src/store/cartSlice.js`): the cart is genuinely shared, frequently-updated app state (navbar badge, cart page, checkout page, every product card's "Add to cart" button all read/write it), which is exactly the kind of state Redux's centralized store + DevTools time-travel debugging is built for.
- **Auth → Context API** (`src/context/AuthContext.jsx`): session state is simpler — read in a few places, updated only on login/logout/profile-edit — so a Context avoids the boilerplate of a slice for something this small.

`src/store/CartSync.jsx` is the small bridge between the two: it watches `AuthContext`'s login state and dispatches `fetchCart()` or `resetCart()` into the Redux store accordingly, so logging in/out keeps the cart correct without the two systems needing to know about each other directly.

If you'd rather have everything in Redux (e.g. for a resume bullet point, or consistency), moving `AuthContext` into an `authSlice.js` alongside `cartSlice.js` following the same pattern is a small, contained change.

## 7. Design notes

The app is themed as **"Multikart"** — indigo (`#4F46E5`) + amber (`#F59E0B`) accents, Sora for headings, Inter for body text — all set as CSS variable overrides on top of Bootstrap in `src/styles/theme.css`, so every built-in Bootstrap component (buttons, badges, forms, navbar) inherits the theme automatically. To restyle it, that one file is the place to start.

The home page's category rail (the pill-shaped row under the search bar) is the one deliberately designed "signature" element — real product categories pulled live from your backend, doubling as both navigation and filtering.

Admin/Vendor dashboards use a quieter, data-dense register (dark sidebar + white content) since they're utility screens, not the storefront.

Two more deliberate touches:
- **Home page hero**: an indigo gradient with a subtle dot-grid texture (not a generic pink/purple blob) and a live stats strip pulling real product/brand/category counts from your backend — no placeholder numbers.
- **Login/Register**: a split-screen layout — a decorative brand panel on the left (desktop only), the form on the right — instead of a plain centered card.

## 8. How data fetching is wired to your backend's API shape

A couple of things worth knowing since your backend's product endpoints are split across `getAllProducts` (paginated), `search`, and `filter` (neither paginated nor sortable) rather than one combined endpoint:

- The Home page picks whichever endpoint fits the current search/filter state, then applies **sort client-side** on whatever list came back. This keeps the UI responsive without needing backend changes — but if you later add combined query support server-side, `src/pages/Home.jsx` → `loadProducts()` is the place to simplify.
- Cart totals, order totals, and price-after-discount all come straight from what the backend computes and returns — the frontend doesn't recompute money values itself, it just formats them for display (`src/utils/formatCurrency.js`).

## 9. Known non-issue

`npm audit` will report a moderate vulnerability in `esbuild`, pulled in transitively by Vite 5's dev server. It only affects the local dev server accepting cross-origin requests during development — it does not affect your production build. Fixing it requires a Vite major-version bump; leaving it as-is is standard for current Vite 5 projects.

## 10. Building for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

Deploy `dist/` to Netlify/Vercel like your portfolio site, and update `VITE_API_BASE_URL` / `VITE_SERVER_URL` to your deployed backend's URL before building.
