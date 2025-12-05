import type { Metadata } from "next";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AIModifiedFilesProvider } from "@/contexts/AIModifiedFilesContext";
import { GitHubProvider } from "@/contexts/GitHubContext";
import { DeploymentProvider } from "@/contexts/DeploymentContext";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kode - AI Development Platform",
  description: "A production-ready AI-powered development platform for building web applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <DeploymentProvider>
            <GitHubProvider>
              <AIModifiedFilesProvider>
                <ToastProvider>
                  <SupabaseProvider>
                    {children}
                  </SupabaseProvider>
                </ToastProvider>
              </AIModifiedFilesProvider>
            </GitHubProvider>
          </DeploymentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
