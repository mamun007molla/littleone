import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* =========================
              BRAND
          ========================= */}

          <div className="footer-brand">
            <h2>Little One Outlet</h2>

            <p>Cute, fun and carefully selected toys for your little ones.</p>

            <strong>Trusted by Parents, Loved by Little Ones 💙</strong>
          </div>

          {/* =========================
              SHOP
          ========================= */}

          <div>
            <h3>Shop</h3>

            <Link href="/shop">All Products</Link>

            <Link href="/shop?category=Bath%20Toys">Bath Toys</Link>

            <Link href="/shop?category=Educational%20Toys">
              Educational Toys
            </Link>

            <Link href="/shop?offer=true">Offers</Link>
          </div>

          {/* =========================
              HELP
          ========================= */}

          <div>
            <h3>Customer Care</h3>

            <Link href="/track-order">Track Order</Link>

            <Link href="/cart">My Cart</Link>

            <Link href="/about">About Us</Link>

            <a
              href="https://wa.me/8801577008007"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>

          {/* =========================
              DELIVERY
          ========================= */}

          <div>
            <h3>Delivery</h3>

            <p>
              Inside Dhaka
              <strong>৳80</strong>
            </p>

            <p>
              Outside Dhaka
              <strong>৳130</strong>
            </p>

            <small>Estimated delivery: 3–5 working days</small>
          </div>
        </div>

        {/* =========================
            BOTTOM
        ========================= */}

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Little One Outlet. All rights reserved.
          </span>

          <span>Made with 💙 for little ones.</span>
        </div>
      </div>
    </footer>
  );
}
