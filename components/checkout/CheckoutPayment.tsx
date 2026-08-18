"use client";

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

type CheckoutPaymentProps = {
  payment: PaymentMethod;

  senderNumber: string;

  transactionId: string;

  onPaymentChange: (method: PaymentMethod) => void;

  onSenderNumberChange: (value: string) => void;

  onTransactionIdChange: (value: string) => void;
};

export default function CheckoutPayment({
  payment,
  senderNumber,
  transactionId,
  onPaymentChange,
  onSenderNumberChange,
  onTransactionIdChange,
}: CheckoutPaymentProps) {
  return (
    <div className="checkout-payment-section">
      <strong>Payment Method</strong>

      <div className="checkout-payment-options">
        {/* COD */}

        <label
          className={`checkout-option ${payment === "cod" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => onPaymentChange("cod")}
          />

          <span>
            <strong>💵 Cash on Delivery</strong>

            <small>Pay when your order arrives</small>
          </span>
        </label>

        {/* BKASH */}

        <label
          className={`checkout-option ${payment === "bkash" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="payment"
            value="bkash"
            checked={payment === "bkash"}
            onChange={() => onPaymentChange("bkash")}
          />

          <span>
            <strong>📱 bKash</strong>

            <small>Send Money</small>
          </span>
        </label>

        {/* NAGAD */}

        <label
          className={`checkout-option ${payment === "nagad" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="payment"
            value="nagad"
            checked={payment === "nagad"}
            onChange={() => onPaymentChange("nagad")}
          />

          <span>
            <strong>🟠 Nagad</strong>

            <small>Send Money</small>
          </span>
        </label>

        {/* BANK */}

        <label
          className={`checkout-option ${payment === "bank" ? "active" : ""}`}
        >
          <input
            type="radio"
            name="payment"
            value="bank"
            checked={payment === "bank"}
            onChange={() => onPaymentChange("bank")}
          />

          <span>
            <strong>🏦 Bank Transfer</strong>

            <small>Direct bank transfer</small>
          </span>
        </label>
      </div>

      {/* BKASH */}

      {payment === "bkash" && (
        <div className="payment-details">
          <div className="payment-details-title">📱 bKash Payment</div>

          <div className="payment-number-box">
            <span>Send Money to</span>

            <strong>01778930553</strong>
          </div>

          <div className="payment-warning">
            ⚠️ This is a <strong>Personal bKash Account</strong>. Please use{" "}
            <strong>Send Money</strong> only.
          </div>

          <p className="payment-instruction">
            After sending the payment, enter your Sender Number and Transaction
            ID below.
          </p>

          <div className="payment-input-grid">
            <label>
              Sender Number
              <input
                type="tel"
                value={senderNumber}
                onChange={(e) => onSenderNumberChange(e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />
            </label>

            <label>
              Transaction ID
              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange(e.target.value)}
                placeholder="Enter Transaction ID"
              />
            </label>
          </div>
        </div>
      )}

      {/* NAGAD */}

      {payment === "nagad" && (
        <div className="payment-details">
          <div className="payment-details-title">🟠 Nagad Payment</div>

          <div className="payment-number-box">
            <span>Send Money to</span>

            <strong>01778930553</strong>
          </div>

          <div className="payment-warning">
            ⚠️ This is a <strong>Personal Nagad Account</strong>. Please use{" "}
            <strong>Send Money</strong> only.
          </div>

          <p className="payment-instruction">
            After sending the payment, enter your Sender Number and Transaction
            ID below.
          </p>

          <div className="payment-input-grid">
            <label>
              Sender Number
              <input
                type="tel"
                value={senderNumber}
                onChange={(e) => onSenderNumberChange(e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />
            </label>

            <label>
              Transaction ID
              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange(e.target.value)}
                placeholder="Enter Transaction ID"
              />
            </label>
          </div>
        </div>
      )}

      {/* BANK */}

      {payment === "bank" && (
        <div className="payment-details">
          <div className="payment-details-title">🏦 Bank Transfer</div>

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

          <p className="payment-instruction">
            After completing the bank transfer, enter your Transaction ID below.
          </p>

          <div className="payment-input-grid">
            <label>
              Transaction ID
              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange(e.target.value)}
                placeholder="Enter Transaction ID"
              />
            </label>
          </div>
        </div>
      )}

      {/* COD */}

      {payment === "cod" && (
        <div className="payment-cod-info">
          💵 You can pay when your order is delivered.
        </div>
      )}
    </div>
  );
}
