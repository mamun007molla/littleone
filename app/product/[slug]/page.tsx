import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/mongodb";
import { Product, ProductVariant } from "@/models/types";
import ProductDetailsClient from "./ProductDetailsClient";
import ProductGallery from "@/components/ProductGallery";
import ProductColorSelector from "@/components/ProductColorSelector";
import AddToCart from "@/components/AddToCart";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   GET PRODUCT
========================================================= */

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const d = await db();

    const product = await d.collection("products").findOne({
      slug,
    });

    if (!product) {
      return null;
    }

    return {
      ...product,

      _id: String(product._id),

      variants: Array.isArray(product.variants)
        ? product.variants.map((variant: any) => ({
            id: String(variant.id),

            color: String(variant.color || ""),

            images: Array.isArray(variant.images) ? variant.images : [],

            video: variant.video ? String(variant.video) : undefined,

            stock: Number(variant.stock || 0),
          }))
        : [],
    } as Product;
  } catch (error) {
    console.error("Product details error:", error);

    return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];

  return (
    <main>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <section
        className="section"
        style={{
          paddingBottom: 0,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <Link href="/" className="muted">
              Home
            </Link>

            <span className="muted">/</span>

            <Link href="/shop" className="muted">
              Shop
            </Link>

            <span className="muted">/</span>

            <span>{product.name}</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section className="section">
        <div className="container">
          <ProductDetailsClient product={product} variants={variants} />
        </div>
      </section>
    </main>
  );
}
