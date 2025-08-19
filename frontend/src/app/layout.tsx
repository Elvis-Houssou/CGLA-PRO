import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "@/context/AuthContext";
// import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import ClientLayout from "./ClientLayout";
import { Providers } from "./Providers";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CGLA-PRO",
  description: "Centre des gestion des lavages Auto professionnels",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
   <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-200`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
