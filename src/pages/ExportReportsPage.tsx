import { useState } from "react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  RefreshCw,
  ArrowLeft,
  Users,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  fetchAllReports,
  fetchReportsByDateRange,
  downloadExcel,
  type ReportRow,
} from "../services/exportService";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";

const STATUS_COLORS: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Blocked: "bg-rose-100 text-rose-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "On Hold": "bg-amber-100 text-amber-700",
};

export default function ExportReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterMode, setFilterMode] = useState<"all" | "range">("range");

  const handleFetch = async () => {
    setLoading(true);
    try {
      const data =
        filterMode === "all"
          ? await fetchAllReports()
          : await fetchReportsByDateRange(startDate, endDate);
      setReports(data);
      setFetched(true);
      if (data.length === 0) {
        toast.info("No reports found for the selected criteria.");
      } else {
        toast.success(`Loaded ${data.length} report(s).`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to fetch reports: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (reports.length === 0) {
      toast.error("No reports to export.");
      return;
    }
    const suffix =
      filterMode === "all" ? "all" : `${startDate}_to_${endDate}`;
    downloadExcel(reports, `mentee_reports_${suffix}.xlsx`);
    toast.success("Excel file downloaded!");
  };

  const uniqueMentees = new Set(reports.map((r) => r.menteeName)).size;
  const statusCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-900 font-sans antialiased">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#C084FC] flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">Mentee</span>
                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F3E8FF] border border-[#E9D4FF] px-2 py-0.5 rounded-full tracking-wider uppercase">
                  EXPORT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Download Reports as Excel</p>
            </div>
          </div>
          <Link to="/form">
            <Button
              variant="outline"
              className="h-9 px-4 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Form
            </Button>
          </Link>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF] text-slate-900 p-6 sm:p-7 shadow-sm border border-purple-200/80">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-bl from-[#E9D4FF]/40 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] border border-[#E9D4FF] text-[#7C3AED] text-xs font-bold">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel Export</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Export Mentee <span className="text-[#7C3AED]">Reports</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
              Fetch daily status reports and download them as a styled Excel spreadsheet with colored headers, status badges, and auto-filters.
            </p>
          </div>
        </div>

        <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Filter & Fetch</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select a date range or fetch all reports
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterMode("range")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filterMode === "range"
                    ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/25"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
                Date Range
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filterMode === "all"
                    ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-500/25"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-3.5 w-3.5 inline mr-1.5" />
                All Reports
              </button>
            </div>

            {filterMode === "range" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
                  <DateInput
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">End Date</Label>
                  <DateInput
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleFetch}
                disabled={loading}
                className="h-10 px-6 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/25 border-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Fetch Reports
                  </span>
                )}
              </Button>

              {fetched && reports.length > 0 && (
                <Button
                  onClick={handleDownload}
                  className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/25 border-0"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Download Excel ({reports.length} rows)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {fetched && reports.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{reports.length}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-[#7C3AED]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mentees</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{uniqueMentees}</p>
            </div>
            {Object.entries(statusCounts).slice(0, 2).map(([status, count]) => (
              <div key={status} className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
                    {status}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        )}

        {fetched && reports.length > 0 && (
          <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-3.5">
              <CardTitle className="text-sm font-bold text-slate-900">Report Preview</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {Math.min(reports.length, 50)} of {reports.length} report(s) — download Excel for full styled data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-bold text-slate-600 whitespace-nowrap">Date</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600 whitespace-nowrap">Mentee</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600 whitespace-nowrap">Task</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600 whitespace-nowrap">Status</th>
                      <th className="text-left px-4 py-3 font-bold text-slate-600 whitespace-nowrap">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 50).map((r) => (
                      <tr key={r.reportId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">{r.reportDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">{r.menteeName}</td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-700">{r.currentTask}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[r.status] || "bg-slate-100 text-slate-600"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[300px] truncate text-slate-600">{r.shortDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reports.length > 50 && (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center border-t border-slate-100">
                    Showing first 50 of {reports.length} reports. Download Excel for all data.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {fetched && reports.length === 0 && (
          <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white">
            <CardContent className="py-14 text-center space-y-3">
              <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Reports Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No mentee reports matched the selected criteria. Try adjusting the date range or fetching all reports.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
