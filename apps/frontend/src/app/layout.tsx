import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel Analítico",
  description: "Fundação de aplicação web orientada a dados com Next.js + FastAPI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
