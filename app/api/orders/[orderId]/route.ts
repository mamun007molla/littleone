import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      orderId: string;
    }>;
  },
) {
  try {
    const { orderId } = await params;

    const phone = request.nextUrl.searchParams.get("phone");

    if (!orderId || !phone) {
      return NextResponse.json(
        {
          error: "Order ID and phone number are required.",
        },
        {
          status: 400,
        },
      );
    }

    const database = await db();

    const order = await database.collection("orders").findOne({
      orderId: orderId.trim().toUpperCase(),

      phone: phone.trim().replace(/[\s-]/g, ""),
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "No order found. Please check your Order ID and phone number.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      order: {
        ...order,

        _id: order._id ? String(order._id) : undefined,

        createdAt:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : order.createdAt,

        updatedAt:
          order.updatedAt instanceof Date
            ? order.updatedAt.toISOString()
            : order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Track order error:", error);

    return NextResponse.json(
      {
        error: "Unable to find order.",
      },
      {
        status: 500,
      },
    );
  }
}
