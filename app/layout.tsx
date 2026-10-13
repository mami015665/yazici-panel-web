import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Toolbar from "../components/Toolbar";
import ToastContainer from "@/components/ToastContainer";

export const metadata: Metadata = {
  title: "Yazıcı Paneli",
  description: "3D baskı satış takip sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Toolbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}