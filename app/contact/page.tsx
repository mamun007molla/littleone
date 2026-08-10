import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  PackageSearch,
  ArrowRight,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="contact-page">
      {/* =========================
          HERO
      ========================= */}

      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-card">
            <div>
              <span className="eyebrow">WE'RE HERE TO HELP</span>

              <h1>
                Get in touch
                <span> with us 💙</span>
              </h1>

              <p>
                Have a question about a product, delivery or your order? We'd
                love to hear from you.
              </p>
            </div>

            <div className="contact-hero-icon">💬</div>
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT OPTIONS
      ========================= */}

      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* PHONE */}

            <a href="tel:+8801577008007" className="contact-card">
              <div className="contact-card-icon">
                <Phone size={22} />
              </div>

              <div>
                <span className="contact-card-label">Call Us</span>

                <h3>+880 1577-008007</h3>

                <p>Call us for quick assistance</p>
              </div>

              <ArrowRight size={18} className="contact-card-arrow" />
            </a>

            {/* WHATSAPP */}

            <a
              href="https://wa.me/8801577008007"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <div className="contact-card-icon whatsapp">
                <MessageCircle size={22} />
              </div>

              <div>
                <span className="contact-card-label">WhatsApp</span>

                <h3>Chat with us</h3>

                <p>Get help through WhatsApp</p>
              </div>

              <ArrowRight size={18} className="contact-card-arrow" />
            </a>

            {/* EMAIL */}

            <a href="mailto:molla4mamun@gmail.com" className="contact-card">
              <div className="contact-card-icon email">
                <Mail size={22} />
              </div>

              <div>
                <span className="contact-card-label">Email</span>

                <h3>Send us an email</h3>

                <p>We'll get back to you soon</p>
              </div>

              <ArrowRight size={18} className="contact-card-arrow" />
            </a>
          </div>

          {/* =========================
              LOWER SECTION
          ========================= */}

          <div className="contact-lower">
            {/* INFO */}

            <div className="contact-info-box">
              <span className="eyebrow">LITTLE ONE OUTLET</span>

              <h2>We're always happy to help.</h2>

              <p>
                Whether you're choosing the perfect toy, checking your delivery
                or need help with an order, feel free to contact us.
              </p>

              <div className="contact-info-list">
                <div>
                  <div className="contact-info-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <strong>Location</strong>

                    <span>Dhaka, Bangladesh</span>
                  </div>
                </div>

                <div>
                  <div className="contact-info-icon">
                    <Phone size={18} />
                  </div>

                  <div>
                    <strong>Phone</strong>

                    <span>+880 1577-008007</span>
                  </div>
                </div>

                <div>
                  <div className="contact-info-icon">
                    <Mail size={18} />
                  </div>

                  <div>
                    <strong>Email</strong>

                    <span>molla4mamun@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TRACK ORDER */}

            <div className="contact-track-box">
              <div className="contact-track-icon">
                <PackageSearch size={30} />
              </div>

              <span className="eyebrow">NEED AN UPDATE?</span>

              <h2>Track your order</h2>

              <p>
                Already placed an order? Check your order status anytime using
                your Order ID and phone number.
              </p>

              <Link href="/track-order" className="btn">
                Track Order
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* =========================
              FAQ STYLE CTA
          ========================= */}

          <div className="contact-bottom">
            <div>
              <strong>Have a product question?</strong>

              <span>We're just a message away. 💙</span>
            </div>

            <a
              href="https://wa.me/8801577008007"
              target="_blank"
              rel="noopener noreferrer"
              className="btn secondary"
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
