# Multi-Role MERN E-Commerce — Backend

A complete Node.js / Express / MongoDB backend for a multi-role (Admin, Vendor, Customer) e-commerce platform: auth + JWT, role-based authorization, brands, categories, products (with search/filter/sort/pagination), cart, orders, reviews, image uploads, and email notifications.

## 1. Requirements

- Node.js 18+
- MongoDB (local install, or a free MongoDB Atlas cluster)
- An email account for Nodemailer (Gmail + an **App Password** is easiest)

## 2. Setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Notes |
|---|---|
| `MONGO_URI` | e.g. `mongodb://127.0.0.1:27017/mern_ecommerce` or your Atlas connection string |
| `JWT_SECRET` | any long random string |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | SMTP creds for Nodemailer. For Gmail: enable 2FA, then generate an **App Password** at myaccount.google.com/apppasswords and use that as `EMAIL_PASS` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | used only by the seed script below |

## 3. Run it

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

You should see:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

Visit `http://localhost:5000/` — you should get `{ "success": true, "message": "MERN E-Commerce API is running" }`.

## 4. Create your first Admin

Since only an Admin can promote other users to `admin` or `vendor`, there's a bootstrap script for the very first admin account:

```bash
npm run seed:admin
```

This creates (or promotes) the user defined by `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` in `.env`. Log in with those credentials to get an admin JWT, then use `PUT /api/users/updateRole/:id` for everyone else (e.g. promoting a user to `vendor`).

## 5. Folder structure

```
server/
├── config/          # MongoDB connection
├── controllers/      # Route handler logic (business logic)
├── models/          # Mongoose schemas (User, Brand, Category, Product, Cart, Order)
├── routes/          # Express routers, one per resource
├── middleware/       # auth, role-based access, multer uploads, validation, error handling
├── validators/       # express-validator rules
├── services/         # emailService, cartService, orderService (calculation helpers)
├── utils/            # generateToken, sendEmail, calculatePrice, asyncHandler
├── seed/             # createAdminUser.js
├── uploads/           # profiles/ brands/ categories/ products/ (served at /uploads/...)
├── app.js            # Express app + route mounting
└── server.js         # entry point — connects DB, then starts listening
```

## 6. Quick test with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Sharma","email":"rahul@gmail.com","password":"Rahul@123","contactNumber":"9876543210"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@gmail.com","password":"Rahul@123"}'
# -> copy the "token" from the response

# Get logged in user info
curl http://localhost:5000/api/auth/getUserInfo -H "Authorization: Bearer YOUR_TOKEN"
```

For endpoints that upload images (brand/category/product creation, profile image), use `multipart/form-data` — this is easiest to test in **Postman** or **Thunder Client** (VS Code extension) rather than curl.

## 7. API reference (all routes)

Base URL: `http://localhost:5000/api`

**Auth** (`/auth`) — register, login, getUserInfo, changePassword, forgotPassword, resetPassword

**Users** (`/users`, admin unless noted) — getAllUsers, getUserById/:id, updateProfile *(any logged-in user)*, uploadProfileImage *(any logged-in user)*, updateRole/:id, updateStatus/:id, deleteUser/:id

**Brands** (`/brands`, admin for writes) — createBrand, getAllBrands, getActiveBrands, getBrandById/:id, updateBrand/:id, deleteBrand/:id, updateBrandStatus/:id

**Categories** (`/categories`, admin for writes) — same pattern as Brands

**Products** (`/products`, admin/vendor for writes) — createProduct, getAllProducts *(paginated: `?page=&limit=`)*, getProductById/:id, updateProduct/:id, deleteProduct/:id, getProductsByCategory/:id, getProductsByBrand/:id, getProductsByVendor/:id, getMyProducts *(vendor)*, getFeaturedProducts, getLatestProducts, getTopRatedProducts, search *(`?query=`)*, filter *(`?category=&brand=&minPrice=&maxPrice=&rating=`)*, sort *(`?sortBy=price|newest|oldest|discount|rating&order=asc|desc`)*

**Cart** (`/cart`, customer only) — addToCart, getCart, increaseQuantity/:id, decreaseQuantity/:id, updateQuantity/:id, removeProduct/:id, clearCart

**Orders** (`/orders`) — placeOrder *(customer)*, getMyOrders *(customer)*, getOrderById/:id *(owner or admin)*, cancelOrder/:id *(customer, owner)*, getAllOrders *(admin)*, updateOrderStatus/:id *(admin)*, getVendorOrders *(vendor)*

**Reviews** (`/reviews`) — addReview/:productId *(customer)*, getReviews/:productId, updateReview/:productId/:reviewId *(own review)*, deleteReview/:productId/:reviewId *(own review, or admin)*

## 8. Notes on implementation choices

- **Role field**: your spec's model draft called this field `type`; it's implemented as `role` throughout (matches the rest of your spec, e.g. `updateRole`, `authorizeRoles`), since that's clearer alongside `type` potentially meaning something else.
- **Pricing**: `finalPrice = price - (price × discount / 100)` and `averageRating = totalRating / totalReviews` are implemented both as Mongoose virtuals on the Product model (for reads) and again in `utils/calculatePrice.js` (for cart/order calculations), matching your spec's suggestion to use virtuals + backend logic.
- **Delivery charge**: a simple flat `DELIVERY_CHARGE` in `.env`, waived above `FREE_DELIVERY_THRESHOLD`. Adjust or remove this logic in `services/orderService.js` if you don't need it.
- **Stock**: `isAvailable` auto-flips to `false` when `quantity` hits 0, and is restored automatically if an order is cancelled.
- **Security**: passwords are hashed with bcryptjs, all sensitive routes are protected by JWT + role middleware, and file uploads are restricted to jpg/jpeg/png/webp with a 5MB limit.
- Email sending is wrapped in a try/catch so a misconfigured SMTP account won't break registration, checkout, etc. — it just logs the error to the console.

## 9. Next steps for your portfolio

- Wire this up to a React frontend (Axios + Redux Toolkit / Context API as your spec lists)
- Deploy backend to Render/Railway and connect a free MongoDB Atlas cluster
- Consider adding a Postman collection to document the API for anyone reviewing your project
