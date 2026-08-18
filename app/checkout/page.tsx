"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import { CartItem } from "@/models/types";

import CheckoutCustomerForm from "@/components/checkout/CheckoutCustomerForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

import { trackMetaEvent } from "@/lib/metaPixel";

type DeliveryType = "inside" | "outside";

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

export default function CheckoutPage() {
  /* =====================================================
     CART
  ===================================================== */

  const [items, setItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [successOrderId, setSuccessOrderId] = useState("");

  const initiateCheckoutFired = useRef(false);

  /* =====================================================
     CUSTOMER
  ===================================================== */

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [area, setArea] = useState("");

  const [district, setDistrict] = useState("Dhaka");

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("inside");

  /* =====================================================
     PAYMENT
  ===================================================== */

  const [payment, setPayment] = useState<PaymentMethod>("cod");

  const [senderNumber, setSenderNumber] = useState("");

  const [transactionId, setTransactionId] = useState("");

  const [note, setNote] = useState("");

  /* =====================================================
     LOAD CART
  ===================================================== */

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("loo_cart");

      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      setItems(Array.isArray(cart) ? cart : []);
    } catch (error) {
      console.error("Failed to load cart:", error);

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     PRICE
  ===================================================== */

  const getPrice = (item: CartItem) => {
    const regularPrice = Number(item.regularPrice || 0);

    const offerPrice = item.offerPrice != null ? Number(item.offerPrice) : null;

    if (offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice) {
      return offerPrice;
    }

    return regularPrice;
  };

  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + getPrice(item) * Number(item.quantity || 0),
      0,
    );
  }, [items]);

  /* =====================================================
     DELIVERY
  ===================================================== */

  const delivery = deliveryType === "outside" ? 130 : 80;

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = subtotal + delivery;

  /* =====================================================
     INITIATE CHECKOUT
  ===================================================== */

  useEffect(() => {
    if (loading) return;

    if (!items.length) return;

    if (initiateCheckoutFired.current) {
      return;
    }

    const contentIds = items.map((item) => String(item._id));

    const numItems = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    const fired = trackMetaEvent("InitiateCheckout", {
      content_ids: contentIds,

      content_type: "product",

      value: Number(total),

      currency: "BDT",

      num_items: numItems,
    });

    if (fired) {
      initiateCheckoutFired.current = true;
    }
  }, [loading, items, total]);

  /* =====================================================
     ITEM COUNT
  ===================================================== */

  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  /* =====================================================
     PAYMENT CHANGE
  ===================================================== */

  const handlePaymentChange = (method: PaymentMethod) => {
    setPayment(method);

    setSenderNumber("");

    setTransactionId("");
  };

  /* =====================================================
     SUBMIT ORDER
  ===================================================== */

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    /* BASIC VALIDATION */

    if (!items.length) {
      setError("Your cart is empty.");

      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");

      return;
    }

    if (!address.trim()) {
      setError("Please enter your delivery address.");

      return;
    }

    /* PAYMENT VALIDATION */

    if (payment === "bkash" || payment === "nagad") {
      if (!senderNumber.trim()) {
        setError("Please enter the Sender Number.");

        return;
      }

      if (!transactionId.trim()) {
        setError("Please enter the Transaction ID.");

        return;
      }
    }

    if (payment === "bank") {
      if (!transactionId.trim()) {
        setError("Please enter the Bank Transaction ID.");

        return;
      }
    }

    setSubmitting(true);

    try {
      /* ORDER ITEMS */

      const orderItems = items.map((item) => ({
        _id: String(item._id),

        name: item.name,

        quantity: Number(item.quantity || 0),

        variantId: item.variantId,

        variantColor: item.variantColor,

        variantImage: item.variantImage,
      }));

      /* CREATE ORDER */

      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          phone: phone.trim(),

          address: address.trim(),

          area: area.trim(),

          district: district.trim(),

          deliveryType,

          payment,

          senderNumber: senderNumber.trim(),

          transactionId: transactionId.trim(),

          note: note.trim(),

          items: orderItems,
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.error || "Order could not be placed.");
      }

      /* ORDER ID */

      const orderId = String(data?.orderId || "");

      if (!orderId) {
        throw new Error("Order was created but Order ID was not returned.");
      }

      /* =================================================
         PURCHASE
      ================================================= */

      const contentIds = items.map((item) => String(item._id));

      const numItems = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      );

      trackMetaEvent("Purchase", {
        content_ids: contentIds,

        content_type: "product",

        value: Number(total),

        currency: "BDT",

        num_items: numItems,

        order_id: orderId,
      });

      /* CLEAR CART */

      localStorage.removeItem("loo_cart");

      window.dispatchEvent(new Event("loo-cart"));

      /* SUCCESS */

      setSuccessOrderId(orderId);
    } catch (error) {
      console.error("Checkout error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="container section">
        <div className="empty">
          <div
            style={{
              fontSize: 45,
              marginBottom: 10,
            }}
          >
            🛒
          </div>

          <p>Loading checkout...</p>
        </div>
      </main>
    );
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  if (successOrderId) {
    return (
      <CheckoutSuccess
        orderId={successOrderId}
        payment={payment}
        senderNumber={senderNumber}
        transactionId={transactionId}
      />
    );
  }

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!items.length) {
    return (
      <main className="container section">
        <div className="empty checkout-empty">
          <div className="checkout-empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p className="muted">Add some products before checking out.</p>

          <Link href="/shop" className="btn">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     CHECKOUT
  ===================================================== */

  return (
    <main className="container section">
      <div className="checkout-header">
        <Link href="/cart" className="text-link">
          ← Back to Cart
        </Link>

        <h1>Checkout</h1>

        <p className="muted">Complete your details to place your order.</p>
      </div>

      {error && (
        <div className="checkout-error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <CheckoutCustomerForm
          name={name}
          phone={phone}
          address={address}
          area={area}
          district={district}
          deliveryType={deliveryType}
          payment={payment}
          senderNumber={senderNumber}
          transactionId={transactionId}
          note={note}
          total={total}
          submitting={submitting}
          onSubmit={submit}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onAddressChange={setAddress}
          onAreaChange={setArea}
          onDistrictChange={setDistrict}
          onDeliveryTypeChange={setDeliveryType}
          onPaymentChange={handlePaymentChange}
          onSenderNumberChange={setSenderNumber}
          onTransactionIdChange={setTransactionId}
          onNoteChange={setNote}
        />

        <CheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          itemCount={itemCount}
          getPrice={getPrice}
        />
      </div>
    </main>
  );
}
