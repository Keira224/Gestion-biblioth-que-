import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Bibliothèque - Gestion",
  description: "Tableau de bord de gestion de bibliothèque",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
