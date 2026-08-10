import Link from "next/link";
import {
  ShieldCheck,
  Heart,
  Truck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* =========================
          HERO
      ========================= */}

      <section className="about-hero">
        <div className="container">
          <div className="about-hero-card">
            <div className="about-hero-content">
              <span className="eyebrow">ABOUT LITTLE ONE OUTLET</span>

              <h1>
                Made for little ones,
                <span> chosen with love. 💙</span>
              </h1>

              <p>
                We believe childhood should be filled with fun, learning and
                happy little moments. That's why we carefully select toys that
                bring joy to little ones and peace of mind to parents.
              </p>

              <div className="about-hero-actions">
                <Link href="/shop" className="btn">
                  <ShoppingBag size={17} />
                  Explore Toys
                </Link>

                <Link href="/contact" className="btn secondary">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="about-hero-visual">
              <div className="about-main-circle">🧸</div>

              <div className="about-float about-float-one">✨</div>

              <div className="about-float about-float-two">💙</div>

              <div className="about-float about-float-three">🧸</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          OUR STORY
      ========================= */}

      <section className="section about-story">
        <div className="container">
          <div className="about-story-grid">
            <div className="about-story-visual">
              <div className="story-card-main">
                <span>🧸</span>

                <strong>
                  Little Ones,
                  <br />
                  Big Smiles
                </strong>
              </div>

              <div className="story-small-card">
                <Sparkles size={18} />
                Carefully selected
              </div>
            </div>

            <div className="about-story-content">
              <span className="eyebrow">OUR STORY</span>

              <h2>More than just toys.</h2>

              <p>
                Little One Outlet was created with a simple idea — make it
                easier for parents to find fun and engaging products for their
                little ones.
              </p>

              <p>
                From playful bath toys to educational activities, we focus on
                products that can make everyday moments more enjoyable.
              </p>

              <p>
                Every product is selected with care because we know that when it
                comes to little ones, parents want nothing but the best.
              </p>

              <div className="about-signature">
                <span>💙</span>

                <div>
                  <strong>Trusted by Parents,</strong>

                  <small>Loved by Little Ones</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          VALUES
      ========================= */}

      <section className="section about-values">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">WHAT WE STAND FOR</span>

            <h2>Why families choose us</h2>

            <p>We put care into every product and every customer experience.</p>
          </div>

          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon">
                <ShieldCheck size={25} />
              </div>

              <h3>Trusted Quality</h3>

              <p>
                We carefully select products with quality, usefulness and fun in
                mind.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <Heart size={25} />
              </div>

              <h3>Made with Care</h3>

              <p>
                Every product is chosen with the needs of little ones and
                parents in mind.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <Truck size={25} />
              </div>

              <h3>Fast Delivery</h3>

              <p>
                We deliver across Bangladesh so your little one's new favourite
                toy arrives quickly.
              </p>
            </div>

            <div className="about-value-card">
              <div className="about-value-icon">
                <Sparkles size={25} />
              </div>

              <h3>Happy Moments</h3>

              <p>
                Our goal is simple — bring more smiles, play and happy moments
                to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PROMISE
      ========================= */}

      <section className="section about-promise">
        <div className="container">
          <div className="about-promise-card">
            <div className="about-promise-icon">💙</div>

            <div>
              <span className="eyebrow">OUR PROMISE</span>

              <h2>Your little one's happiness matters to us.</h2>

              <p>
                We will continue to bring you carefully selected products,
                friendly service and a shopping experience you can trust.
              </p>
            </div>

            <Link href="/shop" className="btn">
              Shop Now
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
