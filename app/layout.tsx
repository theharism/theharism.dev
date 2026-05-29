import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muhammad Haris | Software & Robotics Engineer",
  description:
    "Full Stack Developer & Robotics Enthusiast bridging the gap between high-performance cloud systems and physical intelligence through IoT and custom hardware.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-on-background font-body-md text-body-md antialiased grid-bg overflow-hidden selection:bg-secondary/30">
        {children}
      </body>
    </html>
  );
}
