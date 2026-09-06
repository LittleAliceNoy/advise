import type { Metadata } from "next";
import "./globals.css";
import "./projection-final.css";

export const metadata: Metadata = {
  title: "ADVISE Trial — Beyond the Steroid Horizon",
  description: "An interactive visual story of the ADVISE Trial comparing adalimumab with conventional immunosuppression for non-infectious uveitis",
  icons: { icon: "favicon.svg", shortcut: "favicon.svg" },
  openGraph: {
    title: "ADVISE Trial — Beyond the Steroid Horizon",
    description: "An interactive visual story of the ADVISE Trial comparing adalimumab with conventional immunosuppression for non-infectious uveitis",
    type: "website",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "ADVISE Trial — Beyond the Steroid Horizon" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADVISE Trial — Beyond the Steroid Horizon",
    description: "An interactive visual story of the ADVISE Trial comparing adalimumab with conventional immunosuppression for non-infectious uveitis",
    images: ["og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
