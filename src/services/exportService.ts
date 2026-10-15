import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const COLLECTION = "menteeReports";

export interface ReportRow {
  reportId: string;
  menteeName: string;
  menteeEmail: string;
  reportDate: string;
  currentTask: string;
  status: string;
  shortDescription: string;
  managerLead: string;
  blockerDependency: string;
  idleReasonWorkNeeded: string;
  expectedCompletion: string;
  notes: string;
  submissionStatus: string;
  createdAt: string;
}

function formatTimestamp(ts: Timestamp | null | undefined): string {
  if (!ts || typeof ts.toDate !== "function") return "";
  return ts.toDate().toLocaleString();
}

function docToRow(doc: { id: string; data: () => Record<string, any> }): ReportRow {
  const d = doc.data();
  return {
    reportId: d.reportId ?? doc.id,
    menteeName: d.menteeName ?? "",
    menteeEmail: d.menteeEmail ?? "",
    reportDate: d.reportDate ?? "",
    currentTask: d.currentTask ?? "",
    status: d.status ?? "",
    shortDescription: d.shortDescription ?? "",
    managerLead: d.managerLead ?? "",
    blockerDependency: d.blockerDependency ?? "",
    idleReasonWorkNeeded: d.idleReasonWorkNeeded ?? "",
    expectedCompletion: d.expectedCompletion ?? "",
    notes: d.notes ?? "",
    submissionStatus: d.submissionStatus ?? "",
    createdAt: formatTimestamp(d.createdAt),
  };
}

export async function fetchAllReports(): Promise<ReportRow[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToRow);
}

export async function fetchReportsByDateRange(
  startDate: string,
  endDate: string
): Promise<ReportRow[]> {
  const q = query(
    collection(db, COLLECTION),
    where("reportDate", ">=", startDate),
    where("reportDate", "<=", endDate),
    orderBy("reportDate", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToRow);
}

const COLUMNS: { header: string; key: keyof ReportRow; width: number }[] = [
  { header: "Report Date", key: "reportDate", width: 14 },
  { header: "Mentee Name", key: "menteeName", width: 20 },
  { header: "Mentee Email", key: "menteeEmail", width: 25 },
  { header: "Current Task", key: "currentTask", width: 35 },
  { header: "Status", key: "status", width: 15 },
  { header: "Work Description", key: "shortDescription", width: 45 },
  { header: "Manager / Lead", key: "managerLead", width: 18 },
  { header: "Blocker / Dependency", key: "blockerDependency", width: 30 },
  { header: "Idle Reason / Work Needed", key: "idleReasonWorkNeeded", width: 28 },
  { header: "Expected Completion", key: "expectedCompletion", width: 18 },
  { header: "Notes", key: "notes", width: 30 },
  { header: "Submission Status", key: "submissionStatus", width: 16 },
  { header: "Submitted At", key: "createdAt", width: 20 },
  { header: "Report ID", key: "reportId", width: 30 },
];

const STATUS_FILLS: Record<string, { bg: string; font: string }> = {
  "Not Started": { bg: "64748B", font: "FFFFFF" },
  "In Progress": { bg: "0EA5E9", font: "FFFFFF" },
  Blocked: { bg: "F43F5E", font: "FFFFFF" },
  Completed: { bg: "10B981", font: "FFFFFF" },
  "On Hold": { bg: "F59E0B", font: "FFFFFF" },
};

const HEADER_FILL = "7C3AED";
const HEADER_FONT_COLOR = "FFFFFF";
const BORDER_COLOR = "D1D5DB";
const ALT_ROW_FILL = "FAF5FF";

export async function downloadExcel(reports: ReportRow[], filename?: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mentee Tracker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Mentee Reports", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  // Title row
  const titleRow = sheet.addRow(["Mentee Daily Status Reports"]);
  sheet.mergeCells(1, 1, 1, COLUMNS.length);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: HEADER_FILL } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  titleRow.height = 36;

  // Header row
  const headerRow = sheet.addRow(COLUMNS.map((c) => c.header));
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_FONT_COLOR } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: HEADER_FILL } },
      bottom: { style: "medium", color: { argb: HEADER_FILL } },
      left: { style: "thin", color: { argb: HEADER_FILL } },
      right: { style: "thin", color: { argb: HEADER_FILL } },
    };
  });

  // Set column widths
  COLUMNS.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width;
  });

  // Data rows
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: BORDER_COLOR } },
    bottom: { style: "thin", color: { argb: BORDER_COLOR } },
    left: { style: "thin", color: { argb: BORDER_COLOR } },
    right: { style: "thin", color: { argb: BORDER_COLOR } },
  };

  reports.forEach((report, idx) => {
    const values = COLUMNS.map((col) => report[col.key]);
    const row = sheet.addRow(values);
    row.height = 22;

    row.eachCell((cell, colIdx) => {
      cell.font = { name: "Calibri", size: 10 };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = thinBorder;

      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ALT_ROW_FILL },
        };
      }

      const colDef = COLUMNS[colIdx - 1];
      if (colDef?.key === "status") {
        const statusStyle = STATUS_FILLS[String(cell.value)] ;
        if (statusStyle) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: statusStyle.bg },
          };
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: statusStyle.font } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      }

      // Center-align date columns
      if (colDef?.key === "reportDate" || colDef?.key === "expectedCompletion") {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  // Auto-filter on header row
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: COLUMNS.length },
  };

  const name = filename || `mentee_reports_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, name);
}
