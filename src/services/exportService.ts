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

// --- Excel design matching target template ---

const HEADERS = [
  { label: "Date", key: "reportDate" as const, width: 14 },
  { label: "Name", key: "menteeName" as const, width: 22 },
  { label: "Current Task / Project", key: "currentTask" as const, width: 32 },
  { label: "Status", key: "status" as const, width: 16 },
  { label: "Short description", key: "shortDescription" as const, width: 36 },
  { label: "Manager / Lead", key: "managerLead" as const, width: 20 },
  { label: "Blocker / Dependency", key: "blockerDependency" as const, width: 26 },
  { label: "Idle Reason / Work Needed", key: "idleReasonWorkNeeded" as const, width: 26 },
  { label: "Expected Completion", key: "expectedCompletion" as const, width: 20 },
];

const COL_COUNT = HEADERS.length;

const TITLE_BG = "1B3A1B";
const TITLE_FONT = "FFFFFF";
const SUBTITLE_FONT = "1B3A1B";
const HEADER_BG = "CC6600";
const HEADER_FONT = "FFFFFF";
const BORDER_COLOR = "999999";

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: BORDER_COLOR } },
  bottom: { style: "thin", color: { argb: BORDER_COLOR } },
  left: { style: "thin", color: { argb: BORDER_COLOR } },
  right: { style: "thin", color: { argb: BORDER_COLOR } },
};

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y}`;
}

function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const dayOfMonth = d.getDate();
  return Math.ceil(dayOfMonth / 7);
}

function getMonthName(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleString("en-US", { month: "long" });
}

function getWeekDateRange(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayOfMonth = d.getDate();
  const weekNum = Math.ceil(dayOfMonth / 7);
  const weekStart = (weekNum - 1) * 7 + 1;
  const year = d.getFullYear();
  const month = d.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weekEnd = Math.min(weekStart + 6, lastDay);
  const mm = String(month + 1).padStart(2, "0");
  return `${mm}/${String(weekStart).padStart(2, "0")}/${year} - ${mm}/${String(weekEnd).padStart(2, "0")}/${year}`;
}

interface WeekGroup {
  weekKey: string;
  weekLabel: string;
  dateGroups: { date: string; reports: ReportRow[] }[];
}

function groupByWeek(reports: ReportRow[]): WeekGroup[] {
  const sorted = [...reports].sort((a, b) => a.reportDate.localeCompare(b.reportDate));

  const weekMap = new Map<string, WeekGroup>();

  for (const r of sorted) {
    if (!r.reportDate) continue;
    const month = getMonthName(r.reportDate);
    const weekNum = getWeekNumber(r.reportDate);
    const weekKey = `${r.reportDate.slice(0, 7)}-W${weekNum}`;
    const dateRange = getWeekDateRange(r.reportDate);
    const weekLabel = `${month} Week ${weekNum} - ${dateRange}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { weekKey, weekLabel, dateGroups: [] });
    }
    const group = weekMap.get(weekKey)!;

    let dateGroup = group.dateGroups.find((dg) => dg.date === r.reportDate);
    if (!dateGroup) {
      dateGroup = { date: r.reportDate, reports: [] };
      group.dateGroups.push(dateGroup);
    }
    dateGroup.reports.push(r);
  }

  for (const group of weekMap.values()) {
    group.dateGroups.sort((a, b) => a.date.localeCompare(b.date));
    for (const dg of group.dateGroups) {
      dg.reports.sort((a, b) => a.menteeName.localeCompare(b.menteeName));
    }
  }

  return Array.from(weekMap.values()).sort((a, b) => a.weekKey.localeCompare(b.weekKey));
}

function addTitleRow(sheet: ExcelJS.Worksheet) {
  const row = sheet.addRow(["DAILY TEAM STATUS TRACKER"]);
  sheet.mergeCells(row.number, 1, row.number, COL_COUNT);
  const cell = row.getCell(1);
  cell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    underline: true,
    color: { argb: TITLE_FONT },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TITLE_BG },
  };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  row.height = 32;
  for (let c = 2; c <= COL_COUNT; c++) {
    row.getCell(c).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TITLE_BG },
    };
  }
}

function addWeekSubtitle(sheet: ExcelJS.Worksheet, label: string) {
  const row = sheet.addRow([label]);
  sheet.mergeCells(row.number, 1, row.number, COL_COUNT);
  const cell = row.getCell(1);
  cell.font = {
    name: "Calibri",
    size: 13,
    bold: true,
    color: { argb: SUBTITLE_FONT },
  };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  row.height = 26;
}

function addHeaderRow(sheet: ExcelJS.Worksheet) {
  const row = sheet.addRow(HEADERS.map((h) => h.label));
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      italic: true,
      color: { argb: HEADER_FONT },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_BG },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: HEADER_BG } },
      bottom: { style: "medium", color: { argb: "000000" } },
      left: { style: "thin", color: { argb: HEADER_BG } },
      right: { style: "thin", color: { argb: HEADER_BG } },
    };
  });
}

function addDataRow(sheet: ExcelJS.Worksheet, report: ReportRow) {
  const values = HEADERS.map((h) => {
    if (h.key === "reportDate") return formatDateDisplay(report.reportDate);
    if (h.key === "expectedCompletion" && report.expectedCompletion) {
      return formatDateDisplay(report.expectedCompletion);
    }
    return report[h.key];
  });

  const row = sheet.addRow(values);
  row.height = 20;
  row.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 10 };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = thinBorder;
  });
}

export async function downloadExcel(reports: ReportRow[], filename?: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Daily Report Tracker";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Daily Reports");

  HEADERS.forEach((h, i) => {
    sheet.getColumn(i + 1).width = h.width;
  });

  addTitleRow(sheet);

  const weekGroups = groupByWeek(reports);

  for (const week of weekGroups) {
    addWeekSubtitle(sheet, week.weekLabel);
    addHeaderRow(sheet);

    for (const dateGroup of week.dateGroups) {
      for (const report of dateGroup.reports) {
        addDataRow(sheet, report);
      }
    }

    sheet.addRow([]);
  }

  const name = filename || `mentee_reports_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, name);
}
