import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Little One Outlet",
    template: "%s | Little One Outlet",
  },

  description: "Everything for your little one — Baby Toys & Essentials",

  keywords: [
    "baby toys",
    "kids toys",
    "baby toys Bangladesh",
    "Little One Outlet",
    "educational toys",
    "bath toys",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              fbq('init', '1488622256361658');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Meta Pixel - NoScript */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1488622256361658&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
