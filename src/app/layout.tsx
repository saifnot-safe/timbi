import {Gaegu} from "next/font/google";
import "./globals.css";

const gaegu = Gaegu({
  variable: "--font-gaegu",
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
         <body className={gaegu.className}>
        {children}
      </body>
    </html>
  );
}
