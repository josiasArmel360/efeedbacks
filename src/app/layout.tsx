import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl =
  (process.env.NEXT_PUBLIC_APP_URL as string) || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${APP_NAME} - Boîte à Suggestions Électronique & Qualité des Soins`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} est la boîte à suggestions électronique pour le recueil, l'instruction et le traitement des avis des acteurs (patients, proches et personnel soignant) au sein des établissements sanitaires.`,
  keywords: [
    "Feed Backs",
    "Feed-Backs",
    "boîte à suggestions électronique",
    "avis usagers",
    "satisfaction patient",
    "qualité des soins",
    "gouvernance sanitaire",
    "CHU",
    "centre hospitalier",
    "réclamations santé",
    "démocratie sanitaire",
    "écoute patient",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: baseUrl,
    siteName: APP_NAME,
    title: `${APP_NAME} - Boîte à Suggestions Électronique`,
    description: `Plateforme sécurisée de recueil, d'analyse et de traitement des avis des usagers et soignants en milieu hospitalier.`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Boîte à Suggestions Électronique`,
    description: `Plateforme sécurisée de recueil, d'analyse et de traitement des avis des usagers et soignants en milieu hospitalier.`,
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Application moderne et sécurisée de boîte à suggestions électronique pour le recueil, l'analyse et la gouvernance de la qualité sanitaire en établissement hospitalier.",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        manrope.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          storageKey="feed-backs-theme"
          enableSystem={true}
          defaultTheme="system"
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
