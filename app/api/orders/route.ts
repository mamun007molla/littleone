import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/mongodb";
import { Resend } from "resend";

/* =========================================================
   RESEND
========================================================= */

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================================================
   HELPERS
========================================================= */

function normalizeId(value: unknown): string {
  return String(value || "").trim();
}

function normalizePhone(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/[\s-]/g, "");
}

/*
 * Current cart:
 * _id = actual MongoDB product ID
 *
 * Older cart:
 * productId-variantId
 */
function getProductId(item: any): string {
  const directId = normalizeId(item?.productId);

  if (directId) {
    return directId;
  }

  const rawId = normalizeId(item?._id);

  if (!rawId) {
    return "";
  }

  if (ObjectId.isValid(rawId)) {
    return rawId;
  }

  const firstPart = rawId.split("-")[0];

  if (ObjectId.isValid(firstPart)) {
    return firstPart;
  }

  return rawId;
}

function getDeliveryCharge(deliveryType: unknown) {
  return String(deliveryType || "").toLowerCase() === "outside" ? 130 : 80;
}

function getProductPrice(product: any) {
  const regularPrice = Number(product?.regularPrice || 0);

  const offerPrice =
    product?.offerPrice != null ? Number(product.offerPrice) : null;

  if (offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice) {
    return offerPrice;
  }

  return regularPrice;
}

/* =========================================================
   GET ORDERS
========================================================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get("orderId")?.trim();

    const rawPhone = searchParams.get("phone")?.trim();

    const phone = rawPhone ? normalizePhone(rawPhone) : "";

    const d = await db();

    /* =====================================================
       CUSTOMER TRACK ORDER
    ===================================================== */

    if (orderId || phone) {
      let order = null;

      /* Order ID + Phone */

      if (orderId && phone) {
        order = await d.collection("orders").findOne({
          orderId,
          phone,
        });
      } else if (orderId) {

      /* Order ID */
        order = await d.collection("orders").findOne({
          orderId,
        });
      } else if (phone) {

      /* Phone */
        const phoneCandidates = [phone, phone.replace(/^(\+?88)/, "")].filter(
          Boolean,
        );

        order = await d.collection("orders").findOne(
          {
            $or: [
              {
                phone: {
                  $in: phoneCandidates,
                },
              },
              {
                phone: {
                  $regex: phone.replace(/\D/g, "").split("").join("\\s*-?\\s*"),
                },
              },
            ],
          },
          {
            sort: {
              createdAt: -1,
            },
          },
        );
      }

      if (!order) {
        return NextResponse.json(
          {
            error:
              "Order not found. Please check your Order ID or phone number.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        order: {
          orderId: order.orderId,

          name: order.name,

          phone: order.phone,

          address: order.address,

          area: order.area,

          district: order.district,

          deliveryType: order.deliveryType,

          delivery: Number(order.delivery || 0),

          payment: order.payment,

          note: order.note,

          items: order.items || [],

          subtotal: Number(order.subtotal || 0),

          total: Number(order.total || 0),

          status: order.status || "pending",

          createdAt: order.createdAt,

          updatedAt: order.updatedAt,
        },
      });
    }

    /* =====================================================
       ADMIN - ALL ORDERS
    ===================================================== */

    const orders = await d
      .collection("orders")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Failed to load orders.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   POST ORDER
========================================================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      address,
      area,
      district,
      deliveryType,
      payment,
      note,
      items,
    } = body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          error: "Customer name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!phone || !String(phone).trim()) {
      return NextResponse.json(
        {
          error: "Phone number is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!address || !String(address).trim()) {
      return NextResponse.json(
        {
          error: "Address is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       DATABASE
    ===================================================== */

    const d = await db();

    const products = d.collection("products");

    /* =====================================================
       VERIFIED ITEMS
    ===================================================== */

    const verifiedItems: Array<{
      _id: string;
      name: string;
      price: number;
      quantity: number;
      variantId?: string;
      variantColor?: string;
      variantImage?: string;
    }> = [];

    let subtotal = 0;

    /* =====================================================
       FIRST PASS
       VERIFY EVERYTHING BEFORE STOCK UPDATE
    ===================================================== */

    for (const item of items) {
      const productId = getProductId(item);

      /* ===================================================
         PRODUCT ID
      =================================================== */

      if (!ObjectId.isValid(productId)) {
        return NextResponse.json(
          {
            error: `Invalid product ID for ${
              item?.name || "product"
            }. Please remove the item from your cart and add it again.`,
          },
          {
            status: 400,
          },
        );
      }

      /* ===================================================
         QUANTITY
      =================================================== */

      const quantity = Number(item?.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            error: `Invalid quantity for ${item?.name || "product"}.`,
          },
          {
            status: 400,
          },
        );
      }

      /* ===================================================
         FIND PRODUCT
      =================================================== */

      const product = await products.findOne({
        _id: new ObjectId(productId),
      });

      if (!product) {
        return NextResponse.json(
          {
            error: `${
              item?.name || "This product"
            } is no longer available. Please remove the item from your cart and add it again.`,
          },
          {
            status: 400,
          },
        );
      }

      /* ===================================================
         VARIANT
      =================================================== */

      const variantId = item?.variantId ? String(item.variantId).trim() : "";

      let selectedVariant: any | null = null;

      if (variantId) {
        selectedVariant = Array.isArray(product.variants)
          ? product.variants.find(
              (variant: any) => String(variant.id) === variantId,
            )
          : null;

        if (!selectedVariant) {
          return NextResponse.json(
            {
              error: `${product.name} - selected color is no longer available. Please go back and select another color.`,
            },
            {
              status: 400,
            },
          );
        }
      }

      /* ===================================================
         STOCK
      =================================================== */

      const stock = selectedVariant
        ? Number(selectedVariant.stock || 0)
        : Number(product.stock || 0);

      if (stock < quantity) {
        return NextResponse.json(
          {
            error: selectedVariant
              ? `${product.name} (${selectedVariant.color}) has only ${stock} item${
                  stock === 1 ? "" : "s"
                } available.`
              : `${product.name} has only ${stock} item${
                  stock === 1 ? "" : "s"
                } available.`,
          },
          {
            status: 400,
          },
        );
      }

      /* ===================================================
         PRICE
      =================================================== */

      const price = getProductPrice(product);

      if (price <= 0) {
        return NextResponse.json(
          {
            error: `${product.name} has an invalid price.`,
          },
          {
            status: 400,
          },
        );
      }

      /* ===================================================
         SUBTOTAL
      =================================================== */

      subtotal += price * quantity;

      /* ===================================================
         SAVE VERIFIED ITEM
      =================================================== */

      verifiedItems.push({
        _id: productId,

        name: String(product.name || item?.name || "Product"),

        price,

        quantity,

        ...(selectedVariant
          ? {
              variantId: String(selectedVariant.id),

              variantColor: String(selectedVariant.color || ""),

              variantImage: Array.isArray(selectedVariant.images)
                ? String(selectedVariant.images?.[0] || "")
                : "",
            }
          : {}),
      });
    }

    /* =====================================================
       DELIVERY
    ===================================================== */

    const finalDelivery = getDeliveryCharge(deliveryType);

    const total = subtotal + finalDelivery;

    /* =====================================================
       SECOND STOCK CHECK
    ===================================================== */

    for (const item of verifiedItems) {
      const product = await products.findOne({
        _id: new ObjectId(item._id),
      });

      if (!product) {
        return NextResponse.json(
          {
            error: `${item.name} is no longer available.`,
          },
          {
            status: 409,
          },
        );
      }

      if (item.variantId) {
        const variant = Array.isArray(product.variants)
          ? product.variants.find(
              (current: any) => String(current.id) === String(item.variantId),
            )
          : null;

        const currentStock = Number(variant?.stock || 0);

        if (currentStock < item.quantity) {
          return NextResponse.json(
            {
              error: `${item.name} (${item.variantColor}) is no longer available in the requested quantity.`,
            },
            {
              status: 409,
            },
          );
        }
      } else {
        const currentStock = Number(product.stock || 0);

        if (currentStock < item.quantity) {
          return NextResponse.json(
            {
              error: `${item.name} is no longer available in the requested quantity.`,
            },
            {
              status: 409,
            },
          );
        }
      }
    }

    /* =====================================================
       DECREASE STOCK
    ===================================================== */

    for (const item of verifiedItems) {
      if (item.variantId) {
        const result = await products.updateOne(
          {
            _id: new ObjectId(item._id),

            variants: {
              $elemMatch: {
                id: item.variantId,

                stock: {
                  $gte: item.quantity,
                },
              },
            },
          },
          {
            $inc: {
              "variants.$.stock": -item.quantity,
            },
          },
        );

        if (result.modifiedCount !== 1) {
          return NextResponse.json(
            {
              error: `${item.name} (${item.variantColor}) stock changed while placing your order. Please try again.`,
            },
            {
              status: 409,
            },
          );
        }
      } else {
        const result = await products.updateOne(
          {
            _id: new ObjectId(item._id),

            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
        );

        if (result.modifiedCount !== 1) {
          return NextResponse.json(
            {
              error: `${item.name} stock changed while placing your order. Please try again.`,
            },
            {
              status: 409,
            },
          );
        }
      }
    }

    /* =====================================================
       ORDER ID
    ===================================================== */

    const orderId = `LO-${Date.now().toString(36).toUpperCase()}`;

    /* =====================================================
       CREATE ORDER
    ===================================================== */

    const now = new Date();

    const order = {
      orderId,

      name: String(name).trim(),

      phone: String(phone).trim(),

      address: String(address).trim(),

      area: String(area || "").trim(),

      district: String(district || "Dhaka").trim(),

      deliveryType:
        String(deliveryType || "inside").toLowerCase() === "outside"
          ? "outside"
          : "inside",

      delivery: finalDelivery,

      payment: String(payment || "cod").toLowerCase(),

      note: String(note || "").trim(),

      items: verifiedItems.map((item) => ({
        _id: item._id,

        name: item.name,

        price: item.price,

        quantity: item.quantity,

        ...(item.variantId
          ? {
              variantId: item.variantId,

              variantColor: item.variantColor,

              variantImage: item.variantImage,
            }
          : {}),
      })),

      subtotal,

      total,

      status: "pending",

      createdAt: now,

      updatedAt: now,
    };

    /* =====================================================
       INSERT ORDER
    ===================================================== */

    await d.collection("orders").insertOne(order);

    /* =====================================================
       SEND ADMIN EMAIL
    ===================================================== */

    try {
      const adminEmail = process.env.ADMIN_EMAIL;

      const fromEmail =
        process.env.RESEND_FROM || "Little One Outlet <onboarding@resend.dev>";

      if (process.env.RESEND_API_KEY && adminEmail) {
        const itemRows = verifiedItems
          .map(
            (item) => `
              <tr>
                <td style="padding:10px;border-bottom:1px solid #eee;">
                  ${item.name}${
                    item.variantColor ? ` (${item.variantColor})` : ""
                  }
                </td>

                <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">
                  ${item.quantity}
                </td>

                <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
                  ৳${item.price}
                </td>

                <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
                  ৳${item.price * item.quantity}
                </td>
              </tr>
            `,
          )
          .join("");

        const deliveryLabel =
          order.deliveryType === "outside" ? "Outside Dhaka" : "Inside Dhaka";

        const paymentLabel =
          order.payment === "bkash"
            ? "bKash"
            : order.payment === "nagad"
              ? "Nagad"
              : order.payment === "bank"
                ? "Bank Transfer"
                : "Cash on Delivery";

        const { error: emailError } = await resend.emails.send({
          from: fromEmail,

          to: [adminEmail],

          subject: `🛍️ New Order — ${orderId} | ৳${total}`,

          html: `
              <div
                style="
                  font-family:Arial,sans-serif;
                  max-width:700px;
                  margin:0 auto;
                  color:#202536;
                "
              >

                <div
                  style="
                    background:#3742fa;
                    color:#fff;
                    padding:24px;
                    border-radius:14px 14px 0 0;
                  "
                >
                  <h1 style="margin:0 0 8px;">
                    🛍️ New Order Received
                  </h1>

                  <p style="margin:0;">
                    Little One Outlet
                  </p>
                </div>

                <div
                  style="
                    padding:24px;
                    border:1px solid #eee;
                    border-top:0;
                    border-radius:0 0 14px 14px;
                  "
                >

                  <h2 style="margin-top:0;">
                    Order #${orderId}
                  </h2>

                  <div
                    style="
                      background:#f6f7ff;
                      padding:16px;
                      border-radius:10px;
                      margin-bottom:20px;
                    "
                  >

                    <p>
                      <strong>Customer:</strong>
                      ${order.name}
                    </p>

                    <p>
                      <strong>Phone:</strong>
                      ${order.phone}
                    </p>

                    <p>
                      <strong>Address:</strong>
                      ${order.address}
                    </p>

                    <p>
                      <strong>Area:</strong>
                      ${order.area || "-"}
                    </p>

                    <p>
                      <strong>District:</strong>
                      ${order.district}
                    </p>

                    <p>
                      <strong>Delivery:</strong>
                      ${deliveryLabel}
                      — ৳${order.delivery}
                    </p>

                    <p>
                      <strong>Payment:</strong>
                      ${paymentLabel}
                    </p>

                  </div>

                  ${
                    order.note
                      ? `
                        <div
                          style="
                            background:#fff8e6;
                            padding:14px;
                            border-radius:10px;
                            margin-bottom:20px;
                          "
                        >
                          <strong>
                            Customer Note:
                          </strong>

                          <br />

                          ${order.note}
                        </div>
                      `
                      : ""
                  }

                  <h3>
                    Order Items
                  </h3>

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="border-collapse:collapse;"
                  >

                    <thead>
                      <tr
                        style="
                          background:#f5f6ff;
                        "
                      >

                        <th
                          style="
                            padding:10px;
                            text-align:left;
                          "
                        >
                          Product
                        </th>

                        <th
                          style="
                            padding:10px;
                            text-align:center;
                          "
                        >
                          Qty
                        </th>

                        <th
                          style="
                            padding:10px;
                            text-align:right;
                          "
                        >
                          Price
                        </th>

                        <th
                          style="
                            padding:10px;
                            text-align:right;
                          "
                        >
                          Total
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      ${itemRows}
                    </tbody>

                  </table>

                  <div
                    style="
                      margin-top:20px;
                      border-top:2px solid #eee;
                      padding-top:16px;
                    "
                  >

                    <p style="text-align:right;">
                      <strong>
                        Subtotal:
                      </strong>
                      ৳${subtotal}
                    </p>

                    <p style="text-align:right;">
                      <strong>
                        Delivery:
                      </strong>
                      ৳${finalDelivery}
                    </p>

                    <h2
                      style="
                        text-align:right;
                        color:#3742fa;
                      "
                    >
                      Total: ৳${total}
                    </h2>

                  </div>

                  <div
                    style="
                      margin-top:24px;
                      padding:14px;
                      background:#eef0ff;
                      border-radius:10px;
                    "
                  >
                    <strong>
                      Status:
                    </strong>

                    Pending
                  </div>

                </div>
              </div>
            `,
        });

        if (emailError) {
          console.error("Order notification email failed:", emailError);
        } else {
          console.log(`Order notification email sent for ${orderId}`);
        }
      } else {
        console.warn(
          "Order email skipped: RESEND_API_KEY or ADMIN_EMAIL is missing.",
        );
      }
    } catch (emailError) {
      /*
       * Email failure must NOT cancel
       * an already-created order.
       */

      console.error("Order notification email error:", emailError);
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        orderId,

        subtotal,

        delivery: finalDelivery,

        total,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Failed to place order. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   PATCH ORDER STATUS
========================================================= */

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { orderId, status } = body;

    if (!orderId || !String(orderId).trim()) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const normalizedStatus = String(status || "").toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        {
          status: 400,
        },
      );
    }

    const d = await db();

    const result = await d.collection("orders").updateOne(
      {
        orderId: String(orderId).trim(),
      },
      {
        $set: {
          status: normalizedStatus,

          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      orderId: String(orderId).trim(),

      status: normalizedStatus,
    });
  } catch (error) {
    console.error("PATCH /api/orders error:", error);

    return NextResponse.json(
      {
        error: "Failed to update order.",
      },
      {
        status: 500,
      },
    );
  }
}
