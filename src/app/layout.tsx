import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "PadhoOrion | School Notes-Sharing & Student Community",
  description:
    "A school-wide educational community where students upload, discover, download, discuss, and share verified notes, worksheets, and study resources across 6th to 10th grades.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#e9e6dc] selection:text-[#3d3929]">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl w-full mx-auto flex">
              <Sidebar className="hidden md:flex shrink-0 min-h-[calc(100vh-4rem)]" />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto max-w-full">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

