# Little One Outlet
littleoneoutlet
MIVj5ajs0c4jQ4o3
A simple, mobile-first e-commerce starter for Little One Outlet using Next.js, MongoDB and Cloudinary.

## Included now

- Brand logo + hero banner from the supplied assets
- Brand color `#3742fa`
- Home, Shop, Product Details, Cart, Checkout, Order Success, Track Order, About
- Search and category filtering
- Cash on Delivery, bKash, Nagad and Bank Transfer selection
- Delivery charge: Inside Dhaka ৳80, Outside Dhaka ৳130
- Delivery estimate: 3–5 working days
- Admin login
- Admin product CRUD
- Cloudinary product image upload
- Admin order list + status updates
- MongoDB persistence
- Vercel-friendly Next.js app

## Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Create a MongoDB Atlas database and put the connection string in `MONGODB_URI`.
4. Create a Cloudinary account and add cloud name, API key and API secret.
5. Generate an admin password hash after installing dependencies:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD',12).then(console.log)"
```

Put the printed value in `ADMIN_PASSWORD_HASH` and your admin email in `ADMIN_EMAIL`.
6. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin`.

## Vercel

Add the same environment variables in Vercel Project Settings and deploy. MongoDB Atlas must allow the Vercel runtime to connect. Cloudinary upload runs server-side through `/api/upload`.

## Payment note

The checkout currently records the selected payment method. Actual bKash/Nagad/bank account numbers and/or a payment gateway should be configured before accepting prepaid payments. For a first release, COD can be used immediately.

## Recommended next phase

- Payment gateway integration
- Combo builder (choose any 3 bath toys)
- Coupon system
- Customer reviews
- Wishlist
- Courier API integration (Steadfast)
- Admin settings page for payment numbers, delivery fees and homepage banners
- Order confirmation WhatsApp/SMS automation
