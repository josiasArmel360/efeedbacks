import ExcelJS from "exceljs";

export interface ExcelColumnConfig {
  header: string;
  key: string;
  width?: number;
}

export interface ExportToExcelOptions {
  filename: string;
  sheetName?: string;
  columns?: ExcelColumnConfig[];
  data: Record<string, string | number | boolean | null | undefined>[];
}

/**
 * Exporte un jeu de données en classeur Excel (.xlsx) stylisé et professionnel via ExcelJS.
 * Compatible avec les environnements navigateur client de Next.js.
 */
export async function exportTableToExcel({
  filename,
  sheetName = "Données",
  columns,
  data,
}: ExportToExcelOptions): Promise<void> {
  if (!data || data.length === 0) {
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LaboPilot";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Définition des colonnes
  if (columns && columns.length > 0) {
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || Math.max(col.header.length + 4, 15),
    }));

    // Ajout des lignes par clé
    data.forEach((item) => {
      worksheet.addRow(item);
    });
  } else {
    // Si pas de config de colonnes explicite, inférer depuis les clés du premier objet
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((header) => {
      // Calcul largeur dynamique maximale
      const maxValLength = data.reduce((acc, row) => {
        const val = row[header];
        const len = val !== null && val !== undefined ? String(val).length : 0;
        return Math.max(acc, len);
      }, header.length);

      return {
        header,
        key: header,
        width: Math.min(Math.max(maxValLength + 4, 12), 45),
      };
    });

    data.forEach((item) => {
      worksheet.addRow(item);
    });
  }

  // 2. Stylisation professionnelle de l'en-tête (Ligne 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Segoe UI",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" }, // Teal-700 élégant (médical)
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF0D5F58" } },
      left: { style: "thin", color: { argb: "FF0D5F58" } },
      bottom: { style: "medium", color: { argb: "FF0A4641" } },
      right: { style: "thin", color: { argb: "FF0D5F58" } },
    };
  });

  // 3. Stylisation des lignes de données (Alignements et rayures subtiles)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 22;

    const isEven = rowNumber % 2 === 0;
    row.eachCell((cell) => {
      cell.font = {
        name: "Segoe UI",
        size: 10,
        color: { argb: "FF1E293B" },
      };
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" }, // Fond gris très clair pour lisibilité
        };
      }
      cell.border = {
        top: { style: "hair", color: { argb: "FFE2E8F0" } },
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
        left: { style: "hair", color: { argb: "FFE2E8F0" } },
        right: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: typeof cell.value === "number" ? "right" : "left",
      };
    });
  });

  // 4. Génération du buffer et téléchargement
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeFilename = filename.endsWith(".xlsx")
    ? filename
    : `${filename}.xlsx`;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
