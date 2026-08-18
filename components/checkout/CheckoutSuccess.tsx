"use client";

import Link from "next/link";

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

type CheckoutSuccessProps = {
  orderId: string;
  payment: PaymentMethod;
  senderNumber: string;
  transactionId: string;
};

const PAYMENT_TITLES: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
};

export default function CheckoutSuccess({
  orderId,
  payment,
  senderNumber,
  transactionId,
}: CheckoutSuccessProps) {
  return (
    <main className="container section">
      <div className="checkout-success">
        <div className="success-icon-wrap">✓</div>

        <span className="eyebrow">ORDER CONFIRMED</span>

        <h1>Order Placed Successfully! 🎉</h1>

        <p className="success-description">
          Thank you for shopping with <strong>Little One Outlet</strong> ❤️
        </p>

        <div className="success-order-id">
          <span>Your Order ID</span>

          <strong>#{orderId}</strong>

          <small>Please save this Order ID to track your order.</small>
        </div>

        <div className="checkout-payment-success">
          <div className="checkout-payment-success-header">
            <span>💳</span>

            <div>
              <strong>Payment Method</strong>

              <small>{PAYMENT_TITLES[payment]}</small>
            </div>
          </div>

          {/* COD */}

          {payment === "cod" && (
            <div className="checkout-payment-details">
              <div className="payment-method-icon">💵</div>

              <strong>Cash on Delivery</strong>

              <p>You can pay when your order is delivered.</p>
            </div>
          )}

          {/* BKASH */}

          {payment === "bkash" && (
            <div className="checkout-payment-details">
              <span className="payment-detail-label">bKash Payment</span>

              <div className="payment-number-box">
                <span>Send Money to</span>

                <strong>01778930553</strong>
              </div>

              <div className="payment-warning">
                ⚠️ This is a <strong>Personal bKash Account</strong>. Please use{" "}
                <strong>Send Money</strong> only.
              </div>

              <p>
                Sender Number: <strong>{senderNumber}</strong>
              </p>

              <p>
                Transaction ID: <strong>{transactionId}</strong>
              </p>
            </div>
          )}

          {/* NAGAD */}

          {payment === "nagad" && (
            <div className="checkout-payment-details">
              <span className="payment-detail-label">Nagad Payment</span>

              <div className="payment-number-box">
                <span>Send Money to</span>

                <strong>01778930553</strong>
              </div>

              <div className="payment-warning">
                ⚠️ This is a <strong>Personal Nagad Account</strong>. Please use{" "}
                <strong>Send Money</strong> only.
              </div>

              <p>
                Sender Number: <strong>{senderNumber}</strong>
              </p>

              <p>
                Transaction ID: <strong>{transactionId}</strong>
              </p>
            </div>
          )}

          {/* BANK */}

          {payment === "bank" && (
            <div className="checkout-payment-details">
              <span className="payment-detail-label">Bank Transfer</span>

              <div className="bank-details">
                <div>
                  <span>Bank Name</span>

                  <strong>BRAC Bank PLC</strong>
                </div>

                <div>
                  <span>Account Name</span>

                  <strong>MD MAMUN MOLLA</strong>
                </div>

                <div>
                  <span>Account Number</span>

                  <strong>1053335630001</strong>
                </div>

                <div>
                  <span>Branch Name</span>

                  <strong>KONABARI SME/KRISHI BR</strong>
                </div>

                <div>
                  <span>Routing Number</span>

                  <strong>060330952</strong>
                </div>

                <div>
                  <span>SWIFT Code</span>

                  <strong>BRAKBDDH</strong>
                </div>
              </div>

              <p>
                Transaction ID: <strong>{transactionId}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="checkout-next-step">
          <span>📦</span>

          <div>
            <strong>What happens next?</strong>

            <p>
              We will contact you soon to confirm your order and delivery
              details.
            </p>
          </div>
        </div>

        <div className="success-actions">
          <Link
            href={`/track-order?orderId=${encodeURIComponent(orderId)}`}
            className="btn"
          >
            Track Order →
          </Link>

          <Link href="/shop" className="btn secondary">
            Continue Shopping
          </Link>
        </div>

        <Link href="/" className="success-home">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
