import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s-]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderId = String(body.orderId || "")
      .trim()
      .toUpperCase();

    const phone = normalizePhone(String(body.phone || ""));

    if (!orderId || !phone) {
      return NextResponse.json(
        {
          error: "Order ID and phone number are required.",
        },
        { status: 400 },
      );
    }

    const database = await db();

    const order = await database.collection("orders").findOne({
      orderId,
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found. Please check your Order ID.",
        },
        { status: 404 },
      );
    }

    const savedPhone = normalizePhone(String(order.phone || ""));

    if (savedPhone !== phone) {
      return NextResponse.json(
        {
          error: "The phone number does not match this order.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,

      order: {
        orderId: order.orderId,

        status: order.status || "pending",

        name: order.name,

        phone: order.phone,

        items: order.items || [],

        subtotal: Number(order.subtotal) || 0,

        delivery: Number(order.delivery) || 0,

        total: Number(order.total) || 0,

        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("Track order error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while tracking your order.",
      },
      { status: 500 },
    );
  }
}
