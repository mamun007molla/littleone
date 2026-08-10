import Link from "next/link";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Home,
  MessageCircle,
} from "lucide-react";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
  }>;
}) {
  const q = await searchParams;

  const orderId = q.id || "";

  return (
    <main className="success-page">
      <div className="container">
        <div className="success-card">
          {/* =========================
              SUCCESS ICON
          ========================= */}

          <div className="success-icon-wrap">
            <CheckCircle2 size={52} strokeWidth={2.2} />
          </div>

          {/* =========================
              TITLE
          ========================= */}

          <span className="success-label">ORDER CONFIRMED</span>

          <h1>Order Placed Successfully!</h1>

          <p className="success-description">
            Thank you for shopping with
            <strong> Little One Outlet </strong>
            ❤️
          </p>

          {/* =========================
              ORDER ID
          ========================= */}

          {orderId && (
            <div className="success-order-id">
              <span>Your Order ID</span>

              <strong>#{orderId}</strong>
            </div>
          )}

          {/* =========================
              MESSAGE
          ========================= */}

          <div className="success-message">
            <Package size={22} />

            <div>
              <strong>What happens next?</strong>

              <p>
                We will contact you soon to confirm your order and delivery
                details.
              </p>
            </div>
          </div>

          {/* =========================
              ACTIONS
          ========================= */}

          <div className="success-actions">
            {orderId && (
              <Link
                href={`/track-order?id=${encodeURIComponent(orderId)}`}
                className="btn success-primary-btn"
              >
                Track Order
                <ArrowRight size={18} />
              </Link>
            )}

            <Link href="/shop" className="btn secondary success-secondary-btn">
              Continue Shopping
            </Link>
          </div>

          {/* =========================
              WHATSAPP
          ========================= */}

          <a
            href="https://wa.me/8801577008007"
            target="_blank"
            rel="noopener noreferrer"
            className="success-whatsapp"
          >
            <MessageCircle size={18} />
            Need help? Chat with us on WhatsApp
          </a>

          {/* =========================
              HOME
          ========================= */}

          <Link href="/" className="success-home">
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
