import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Account - Star Gazer",
  description: "Delete Account for Star Gazer",
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