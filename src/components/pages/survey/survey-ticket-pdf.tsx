import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as Img,
} from "@react-pdf/renderer";
import { APP_NAME } from "@/lib/constants";
import type { Department, Tenant } from "@/lib/types";

export interface SurveyTicketPDFProps {
  code: string;
  actorTypeLabel: string;
  isAnonymous: boolean;
  authorName?: string | null;
  department?: Department | null;
  visitDate?: string | null;
  overallRating: number;
  recommendation?: string | null;
  qrDataUrl?: string | null;
  followUpUrl: string;
  tenant?: Pick<Tenant, "name" | "logo" | "city" | "address" | "phoneNumber"> | null;
  submittedAt?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "Helvetica",
    fontSize: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  // En-tête
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    paddingBottom: 14,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
    gap: 3,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#64748b",
  },
  logo: {
    height: 38,
    width: 110,
    objectFit: "contain",
  },
  badgePill: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  badgePillText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#0369a1",
    textTransform: "uppercase",
  },

  // Bloc Code de Suivi
  codeCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0284c7",
    letterSpacing: 2,
  },
  codeHint: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 6,
  },

  // Tableau récapitulatif
  detailsGrid: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  detailRowLast: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  detailKey: {
    width: "40%",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#475569",
  },
  detailVal: {
    width: "60%",
    fontSize: 8.5,
    color: "#0f172a",
  },

  // Section QR & Suivi
  qrSection: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  qrImage: {
    width: 76,
    height: 76,
  },
  qrTextContainer: {
    flex: 1,
    gap: 3,
  },
  qrTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#166534",
  },
  qrDescription: {
    fontSize: 8,
    color: "#15803d",
    lineHeight: 1.35,
  },
  qrUrl: {
    fontSize: 7.5,
    color: "#0369a1",
    marginTop: 3,
    textDecoration: "underline",
  },

  // Pied de page
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: "#94a3b8",
  },
  footerBrand: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#64748b",
  },
});

export const SurveyTicketPDF: React.FC<SurveyTicketPDFProps> = ({
  code,
  actorTypeLabel,
  isAnonymous,
  authorName,
  department,
  visitDate,
  overallRating,
  recommendation,
  qrDataUrl,
  followUpUrl,
  tenant,
  submittedAt,
}) => {
  const hospitalName = tenant?.name || APP_NAME;
  const ratingStars = `${"★".repeat(Math.max(1, Math.min(5, overallRating)))}${"☆".repeat(Math.max(0, 5 - overallRating))}`;
  const recoLabel =
    recommendation === "oui"
      ? "Recommandé"
      : recommendation === "non"
        ? "Non recommandé"
        : recommendation === "mitige"
          ? "Mitigé / Réservé"
          : "Non précisé";

  return (
    <Document title={`Ticket_Suivi_${code}`} author={hospitalName}>
      <Page size="A5" orientation="portrait" style={styles.page}>
        {/* En-tête officiel */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.tenantName}>{hospitalName}</Text>
            <Text style={styles.headerSubtitle}>
              Démarche Qualité des Soins & Bientraitance
            </Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>Récépissé de Dépôt d'Avis</Text>
            </View>
          </View>
          {tenant?.logo ? (
            <Img src={tenant.logo} style={styles.logo} />
          ) : null}
        </View>

        {/* Code de suivi en valeur */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Votre Code Personnel de Suivi</Text>
          <Text style={styles.codeValue}>{code}</Text>
          <Text style={styles.codeHint}>
            Conservez ce numéro confidentiel pour suivre l'instruction de votre dossier.
          </Text>
        </View>

        {/* Tableau récapitulatif */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Profil de l'émetteur :</Text>
            <Text style={styles.detailVal}>{actorTypeLabel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Confidentialité :</Text>
            <Text style={styles.detailVal}>
              {isAnonymous ? "100% Anonyme" : `Nominatif (${authorName || "Identifié"})`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Service hospitalier :</Text>
            <Text style={styles.detailVal}>
              {department?.name || "Établissement général"}
            </Text>
          </View>
          {visitDate ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Date de séjour / passage :</Text>
              <Text style={styles.detailVal}>{visitDate}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Note globale attribuée :</Text>
            <Text style={styles.detailVal}>
              {overallRating} / 5  ({ratingStars})
            </Text>
          </View>
          <View style={styles.detailRowLast}>
            <Text style={styles.detailKey}>Recommandation :</Text>
            <Text style={styles.detailVal}>{recoLabel}</Text>
          </View>
        </View>

        {/* Section QR Code de suivi */}
        <View style={styles.qrSection}>
          {qrDataUrl ? (
            <Img src={qrDataUrl} style={styles.qrImage} />
          ) : null}
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrTitle}>Suivi en ligne en temps réel</Text>
            <Text style={styles.qrDescription}>
              Scannez ce QR code avec votre smartphone pour consulter l'analyse de votre avis et les mesures correctives engagées.
            </Text>
            <Text style={styles.qrUrl}>{followUpUrl}</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dépôt enregistré le {submittedAt || new Date().toLocaleDateString("fr-FR")}
          </Text>
          <Text style={styles.footerBrand}>Plateforme {APP_NAME}</Text>
        </View>
      </Page>
    </Document>
  );
};

