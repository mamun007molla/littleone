"use client";

import { FormEvent } from "react";
import CheckoutPayment from "./CheckoutPayment";

type DeliveryType = "inside" | "outside";

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

type CheckoutCustomerFormProps = {
  name: string;
  phone: string;
  address: string;
  area: string;
  district: string;

  deliveryType: DeliveryType;

  payment: PaymentMethod;

  senderNumber: string;

  transactionId: string;

  note: string;

  total: number;

  submitting: boolean;

  onSubmit: (e: FormEvent<HTMLFormElement>) => void;

  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onDistrictChange: (value: string) => void;

  onDeliveryTypeChange: (value: DeliveryType) => void;

  onPaymentChange: (value: PaymentMethod) => void;

  onSenderNumberChange: (value: string) => void;

  onTransactionIdChange: (value: string) => void;

  onNoteChange: (value: string) => void;
};

export default function CheckoutCustomerForm({
  name,
  phone,
  address,
  area,
  district,
  deliveryType,
  payment,
  senderNumber,
  transactionId,
  note,
  total,
  submitting,
  onSubmit,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onAreaChange,
  onDistrictChange,
  onDeliveryTypeChange,
  onPaymentChange,
  onSenderNumberChange,
  onTransactionIdChange,
  onNoteChange,
}: CheckoutCustomerFormProps) {
  return (
    <form onSubmit={onSubmit} className="checkout-layout">
      <div className="form">
        <h2>Delivery Details</h2>

        {/* NAME */}

        <label>
          Full Name
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </label>

        {/* PHONE */}

        <label>
          Phone Number
          <input
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>

        {/* ADDRESS */}

        <label>
          Full Address
          <textarea
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="House, road, area..."
            rows={4}
            required
          />
        </label>

        {/* AREA */}

        <label>
          Area
          <input
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            placeholder="e.g. Mirpur, Uttara"
          />
        </label>

        {/* DISTRICT */}

        <label>
          District
          <input
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            placeholder="Dhaka"
          />
        </label>

        {/* DELIVERY */}

        <div className="checkout-section-block">
          <strong>Delivery Area</strong>

          <div className="checkout-delivery-options">
            <label
              className={`checkout-option ${
                deliveryType === "inside" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="inside"
                checked={deliveryType === "inside"}
                onChange={() => onDeliveryTypeChange("inside")}
              />

              <span>
                <strong>Inside Dhaka</strong>

                <small>৳80 delivery</small>
              </span>
            </label>

            <label
              className={`checkout-option ${
                deliveryType === "outside" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="outside"
                checked={deliveryType === "outside"}
                onChange={() => onDeliveryTypeChange("outside")}
              />

              <span>
                <strong>Outside Dhaka</strong>

                <small>৳130 delivery</small>
              </span>
            </label>
          </div>
        </div>

        {/* PAYMENT */}

        <CheckoutPayment
          payment={payment}
          senderNumber={senderNumber}
          transactionId={transactionId}
          onPaymentChange={onPaymentChange}
          onSenderNumberChange={onSenderNumberChange}
          onTransactionIdChange={onTransactionIdChange}
        />

        {/* NOTE */}

        <label>
          Order Note
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Any special instruction? (Optional)"
            rows={3}
          />
        </label>

        {/* SUBMIT */}

        <button
          type="submit"
          className="btn checkout-submit"
          disabled={submitting}
        >
          {submitting ? "Placing Order..." : `Place Order • ৳${total}`}
        </button>
      </div>
    </form>
  );
}
