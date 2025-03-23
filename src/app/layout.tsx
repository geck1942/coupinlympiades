import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Olympiades Management System",
  description: "Manage and track Olympic events",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const headersObject = Object.fromEntries(headersList.entries());

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session} headers={headersObject}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
