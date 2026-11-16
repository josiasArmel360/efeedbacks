import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as Img,
  Font,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { APP_NAME } from "@/lib/constants";
import type { Department, Tenant } from "@/lib/types";

Font.register({
  family: "Poppins",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf",
      fontWeight: 700,
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 54,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "Poppins",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  // 1. En-tête de l'établissement
  headerSection: {
    alignItems: "center",
    borderBottom: "1pt solid #e2e8f0",
    paddingBottom: 18,
  },
  logo: {
    height: 48,
    width: 160,
    objectFit: "contain",
    marginBottom: 8,
  },
  governanceBadge: {
    backgroundColor: "#f0fdfa",
    border: "1pt solid #99f6e4",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  governanceBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#115e59",
    textTransform: "uppercase",
  },
  establishmentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b2545",
    textAlign: "center",
    marginBottom: 6,
  },
  departmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    border: "1pt solid #99f6e4",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  departmentBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#115e59",
    marginLeft: 5,
  },

  // 2. Titre d'accroche
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0b2545",
    textAlign: "center",
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 10,
    color: "#475569",
    textAlign: "center",
    lineHeight: 1.5,
    maxWidth: 360,
  },

  // 3. Cadre QR Code
  qrWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  qrBox: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "4pt solid #0b2545",
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 220,
    height: 220,
    objectFit: "contain",
  },

  // 4. Avantages & Réassurance
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    border: "1pt solid #e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginRight: 6,
  },
  featureCardRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    border: "1pt solid #e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginLeft: 6,
  },
  featureTextWrapper: {
    marginLeft: 8,
    flex: 1,
  },
  featureTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 8.5,
    color: "#64748b",
  },

  // 5. URL de secours
  footerSection: {
    borderTop: "1pt solid #f1f5f9",
    paddingTop: 12,
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 3,
    textAlign: "center",
  },
  footerUrl: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0b2545",
    textAlign: "center",
  },
});

export interface QrCodePosterPDFProps {
  tenant: Tenant | null;
  department?: Department | null;
  targetUrl: string;
  qrDataUrl: string;
}

export const QrCodePosterPDF: React.FC<QrCodePosterPDFProps> = ({
  tenant,
  department,
  targetUrl,
  qrDataUrl,
}) => {
  const establishmentName = tenant?.name || APP_NAME;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. En-tête de l'établissement */}
        <View style={styles.headerSection}>
          {tenant?.logo && <Img src={tenant.logo} style={styles.logo} />}

          <View style={styles.governanceBadge}>
            <Text style={styles.governanceBadgeText}>
              Gouvernance Sanitaire & Qualité des Soins
            </Text>
          </View>

          <Text style={styles.establishmentName}>{establishmentName}</Text>

          {department && (
            <View style={styles.departmentBadge}>
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path
                  d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"
                  stroke="#115e59"
                  strokeWidth={2}
                  fill="none"
                />
                <Path
                  d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"
                  stroke="#115e59"
                  strokeWidth={2}
                  fill="none"
                />
              </Svg>
              <Text style={styles.departmentBadgeText}>
                Unité : {department.name}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Titre d'accroche */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Votre avis compte pour nous</Text>
          <Text style={styles.heroDescription}>
            Flashez ce QR Code avec l&apos;appareil photo de votre smartphone
            pour évaluer votre prise en charge et formuler une suggestion.
          </Text>
        </View>

        {/* 3. Cadre QR Code */}
        <View style={styles.qrWrapper}>
          <View style={styles.qrBox}>
            {qrDataUrl ? (
              <Img src={qrDataUrl} style={styles.qrImage} />
            ) : (
              <Text style={styles.featureSubtitle}>Génération QR Code...</Text>
            )}
          </View>
        </View>

        {/* 4. Avantages & Réassurance */}
        <View style={styles.featuresRow}>
          <View style={styles.featureCardLeft}>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                stroke="#059669"
                strokeWidth={2}
                fill="none"
              />
              <Path
                d="m9 12 2 2 4-4"
                stroke="#059669"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>100% Confidentiel</Text>
              <Text style={styles.featureSubtitle}>
                Avis anonyme ou identifié
              </Text>
            </View>
          </View>

          <View style={styles.featureCardRight}>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                stroke="#0d9488"
                strokeWidth={2}
                fill="none"
              />
            </Svg>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Ticket de Suivi</Text>
              <Text style={styles.featureSubtitle}>
                Traitement par la direction
              </Text>
            </View>
          </View>
        </View>

        {/* 5. URL de secours */}
        <View style={styles.footerSection}>
          <Text style={styles.footerLabel}>
            Ou rendez-vous directement sur :
          </Text>
          <Text style={styles.footerUrl}>{targetUrl}</Text>
        </View>
      </Page>
    </Document>
  );
};