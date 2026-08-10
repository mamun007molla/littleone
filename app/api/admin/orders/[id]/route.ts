import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const status = String(body.status || "").toLowerCase();

    if (!id) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        { status: 400 },
      );
    }

    const d = await db();

    const result = await d.collection("orders").updateOne(
      {
        orderId: id,
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 },
      );
    }

    const order = await d.collection("orders").findOne({
      orderId: id,
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: order?.orderId,
        status: order?.status,
        updatedAt: order?.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        error: "Failed to update order status.",
      },
      { status: 500 },
    );
  }
}
