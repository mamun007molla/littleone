"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    const query = params.toString();

    router.push(query ? `/shop?${query}` : "/shop");
  };

  return (
    <select
      id="sort"
      name="sort"
      value={currentSort}
      onChange={handleChange}
      className="shop-sort"
      aria-label="Sort products"
    >
      <option value="newest">Newest</option>

      <option value="price-low">Price: Low to High</option>

      <option value="price-high">Price: High to Low</option>

      <option value="name">Name: A to Z</option>
    </select>
  );
}
