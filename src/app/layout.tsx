import {Gaegu, Nunito} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const gaegu = Gaegu({
  variable: "--font-gaegu",
  subsets: ["latin"],
  weight: "400",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <ClerkProvider
  localization={{
    signIn: {
      start:{
        title: "Welcome back",
        subtitle: 'Use your UWO email to help Timbi find free food :3'
      }
    },
    signUp: {
      start: {
      title: "Join Timbi",
      subtitle: 'Use your UWO email to help Timbi find free food :3'
      }
    }
  }}
  appearance={{
    variables: {
      colorPrimary: "#FFA353",
      colorBackground: "#F8EFE2",
      colorText: "#5F3D26",
      borderRadius: "1rem",
      fontFamily: "var(--font-gaegu)",
    },
    
  }}
>
      <html lang="en">
        <body className={`${gaegu.variable} ${nunito.variable} ${gaegu.className}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
    
  );
}
