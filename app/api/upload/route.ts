import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/* =========================================================
   CLOUDINARY CONFIG
========================================================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================================================
   POST UPLOAD
========================================================= */

export async function POST(request: Request) {
  try {
    /* =====================================================
       GET FORM DATA
    ===================================================== */

    const formData = await request.formData();

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No file provided.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FILE TYPE
    ===================================================== */

    const contentType = file.type || "";

    const isImage = contentType.startsWith("image/");

    const isVideo = contentType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error: "Only image and video files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       FILE SIZE

       Image: 10 MB
       Video: 50 MB
    ===================================================== */

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video must be 50MB or smaller."
            : "Image must be 10MB or smaller.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       CONVERT FILE TO BUFFER
    ===================================================== */

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    /* =====================================================
       RESOURCE TYPE
    ===================================================== */

    const resourceType = isVideo ? "video" : "image";

    /* =====================================================
       UPLOAD TO CLOUDINARY
    ===================================================== */

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "little-one-outlet",

          resource_type: resourceType,

          /*
           * Keep original quality.
           *
           * Cloudinary will handle
           * image/video processing.
           */
        },

        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        url: result.secure_url,

        publicId: result.public_id,

        resourceType,

        width: result.width,

        height: result.height,

        duration: result.duration,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload file.",
      },
      {
        status: 500,
      },
    );
  }
}
