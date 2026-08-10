"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, Menu, X, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [count, setCount] = useState(0);

  const [mobileOpen, setMobileOpen] = useState(false);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("loo_cart") || "[]");

      const total = cart.reduce(
        (sum: number, item: any) => sum + Number(item.quantity || 0),
        0,
      );

      setCount(total);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("loo-cart", updateCartCount);

    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("loo-cart", updateCartCount);

      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header className="header">
      <div className="container nav">
        {/* =========================
            LOGO
        ========================= */}

        <Link href="/" className="brand" onClick={closeMobile}>
          <Image
            src="/brand/logo.jpeg"
            alt="Little One Outlet"
            width={52}
            height={52}
            priority
          />

          <div className="brand-text">
            <span>Little One Outlet</span>

            <small>Trusted by Parents</small>
          </div>
        </Link>

        {/* =========================
            DESKTOP NAV
        ========================= */}

        <nav className="links">
          <Link href="/shop">Shop</Link>

          <Link href="/shop?category=Bath%20Toys">Bath Toys</Link>

          <Link href="/shop?category=Educational%20Toys">Educational</Link>

          <Link href="/shop?offer=true">Offers</Link>

          <Link href="/about">About</Link>

          <Link href="/track-order">Track Order</Link>
        </nav>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="nav-actions">
          <Link
            className="nav-icon-btn search-nav-btn"
            href="/shop"
            aria-label="Shop"
          >
            <Search size={18} />

            <span>Shop</span>
          </Link>

          <Link
            className="nav-icon-btn track-nav-btn"
            href="/track-order"
            aria-label="Track Order"
          >
            <PackageSearch size={18} />

            <span>Track</span>
          </Link>

          <Link
            className="cart-nav-btn"
            href="/cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={19} />

            {count > 0 && (
              <span className="cart-count">{count > 99 ? "99+" : count}</span>
            )}
          </Link>

          {/* MOBILE MENU */}

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}

      {mobileOpen && (
        <div className="mobile-menu">
          <Link href="/shop" onClick={closeMobile}>
            Shop
          </Link>

          <Link href="/shop?category=Bath%20Toys" onClick={closeMobile}>
            Bath Toys
          </Link>

          <Link href="/shop?category=Educational%20Toys" onClick={closeMobile}>
            Educational Toys
          </Link>

          <Link href="/shop?offer=true" onClick={closeMobile}>
            Offers
          </Link>

          <Link href="/track-order" onClick={closeMobile}>
            Track Order
          </Link>

          <Link href="/about" onClick={closeMobile}>
            About
          </Link>

          <Link href="/cart" onClick={closeMobile} className="mobile-cart-link">
            <ShoppingCart size={18} />
            Cart
            {count > 0 && <span>({count})</span>}
          </Link>
        </div>
      )}
    </header>
  );
}
