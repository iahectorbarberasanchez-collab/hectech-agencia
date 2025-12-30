import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HECTECH | Automatización con IA para Negocios Locales",
  description: "Ahorra +15 horas semanales y aumenta tus ventas un 40% con chatbots inteligentes y automatización IA. Auditoría gratuita. Atención 24/7 para tu negocio.",
  keywords: [
    "automatización con IA",
    "chatbots inteligentes",
    "automatización negocios",
    "IA para empresas",
    "n8n automatización",
    "chatbot WhatsApp",
    "agencia IA España",
    "automatización procesos",
    "inteligencia artificial negocios",
    "consultoría IA"
  ],
  authors: [{ name: "HECTECH" }],
  creator: "HECTECH Automation Agency",
  publisher: "HECTECH",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://hectech-agencia.vercel.app',
    title: 'HECTECH | Automatización con IA para Negocios',
    description: 'Ahorra +15 horas semanales con chatbots inteligentes y automatización IA. Auditoría gratuita.',
    siteName: 'HECTECH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HECTECH | Automatización con IA',
    description: 'Ahorra +15 horas semanales con IA. Auditoría gratuita.',
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
