import {Mali} from "next/font/google";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
         <body className={mali.className}>
        {children}
      </body>
    </html>
  );
}
