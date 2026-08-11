import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: Request) {
  try {
    // Check Cloudinary environment variables
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        {
          error:
            "Cloudinary configuration is missing. Check your environment variables.",
        },
        {
          status: 500,
        },
      );
    }

    // Read request body
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Image or video
    const resourceType =
      body?.resourceType === "video"
        ? "video"
        : "image";

    // Current timestamp
    const timestamp = Math.floor(
      Date.now() / 1000,
    );

    // Cloudinary folder
    const folder = "little-one-outlet";

    // Parameters that will be signed
    const paramsToSign = {
      timestamp,
      folder,
    };

    // Generate signature
    const signature =
      cloudinary.utils.api_sign_request(
        paramsToSign,
        apiSecret,
      );

    // Send data to browser
    return NextResponse.json(
      {
        success: true,
        signature,
        timestamp,
        folder,
        cloudName,
        apiKey,
        resourceType,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Cloudinary signature error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to create Cloudinary upload signature.",
      },
      {
        status: 500,
      },
    );
  }
}