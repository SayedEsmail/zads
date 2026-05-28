import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zad — Local Learning Platform",
  description: "Find the best teachers in your area",
};

// Root layout: minimal shell — locale layout handles lang/dir/font
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
