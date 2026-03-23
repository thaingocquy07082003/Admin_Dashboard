import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Account - HairStyle",
  description: "Delete Account for HairStyle",
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