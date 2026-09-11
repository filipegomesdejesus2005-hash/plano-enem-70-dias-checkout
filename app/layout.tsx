import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkout | Plano ENEM 70 Dias",
  description: "Finalize seu pedido do Plano ENEM 70 Dias.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
