import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Star Gazer",
  description: "Privacy Policy for Star Gazer",
  icons: {
    icon: '/stargazerlogo.ico',
    shortcut: '/stargazerlogo.ico',
    apple: '/stargazerlogo.png',
  },
};

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 