import type { Metadata } from "next";
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
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
