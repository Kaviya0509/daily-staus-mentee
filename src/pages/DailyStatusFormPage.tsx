import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Check,
  PlayCircle,
  RotateCcw,
  Rocket,
  MinusCircle,
  PauseCircle,
  User,
} from "lucide-react";

import { createReport } from "../services/reportService";
import { reportSchema, type ReportFormData } from "../schemas/reportSchema";
import type { ReportStatus } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";

const STATUS_OPTIONS: {
  value: ReportStatus;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  activeColor: string;
  hoverColor: string;
  iconColor: string;
}[] = [
    {
      value: "Not Started",
      label: "Not Started",
      subtitle: "Yet to begin this task",
      icon: MinusCircle,
      activeColor: "bg-slate-800 text-white border-slate-800 shadow-md",
      hoverColor: "hover:bg-slate-100 text-slate-700 hover:border-slate-300",
      iconColor: "text-slate-400",
    },
    {
      value: "In Progress",
      label: "In Progress",
      subtitle: "Currently working on it",
      icon: PlayCircle,
      activeColor: "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 ring-2 ring-sky-500/20",
      hoverColor: "hover:bg-sky-50 text-slate-700 hover:text-sky-700 hover:border-sky-200",
      iconColor: "text-sky-500",
    },
    {
      value: "Blocked",
      label: "Blocked",
      subtitle: "Facing blockers or issues",
      icon: AlertTriangle,
      activeColor: "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25 ring-2 ring-rose-500/20",
      hoverColor: "hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-200",
      iconColor: "text-rose-500",
    },
    {
      value: "Completed",
      label: "Completed",
      subtitle: "Task completed",
      icon: CheckCircle2,
      activeColor: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20",
      hoverColor: "hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 hover:border-emerald-200",
      iconColor: "text-emerald-500",
    },
    {
      value: "On Hold",
      label: "On Hold",
      subtitle: "Paused temporarily",
      icon: PauseCircle,
      activeColor: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-500/20",
      hoverColor: "hover:bg-amber-50 text-slate-700 hover:text-amber-700 hover:border-amber-200",
      iconColor: "text-amber-500",
    },
  ];

export default function DailyStatusFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      menteeName: "",
      menteeEmail: "",
      reportDate: format(new Date(), "yyyy-MM-dd"),
      currentTask: "",
      status: undefined as unknown as ReportFormData["status"],
      shortDescription: "",
      managerLead: "",
      blockerDependency: "",
      idleReasonWorkNeeded: "",
      expectedCompletion: "",
      notes: "",
    },
  });

  const selectedStatus = watch("status");
  const currentTaskVal = watch("currentTask");
  const shortDescriptionVal = watch("shortDescription");

  const onSubmit = async (data: ReportFormData) => {
    setSubmitting(true);
    try {
      const payload: ReportFormData = {
        ...data,
        reportDate: data.reportDate || format(new Date(), "yyyy-MM-dd"),
        menteeEmail: data.menteeEmail || "",
        managerLead: data.managerLead || "",
      };
      await createReport(payload);
      toast.success("Daily report submitted successfully!");
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save report: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset({
      menteeName: "",
      menteeEmail: "",
      reportDate: format(new Date(), "yyyy-MM-dd"),
      currentTask: "",
      status: undefined as unknown as ReportFormData["status"],
      shortDescription: "",
      managerLead: "",
      blockerDependency: "",
      idleReasonWorkNeeded: "",
      expectedCompletion: "",
      notes: "",
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
          <CardContent className="py-14 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Report Submitted Successfully</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your daily status report has been recorded and submitted. Your mentor and administrative leads can now review your updates in the portal.
            </p>
            <Button
              onClick={handleReset}
              className="mt-4 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-500/25 border-0"
            >
              Submit Another Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-900 font-sans antialiased">
      {/* Top Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#C084FC] flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.5" fill="currentColor" />
                <circle cx="6" cy="12" r="2.5" fill="currentColor" />
                <circle cx="18" cy="19" r="2.5" fill="currentColor" />
                <line x1="8.5" y1="10.8" x2="15.5" y2="6.2" strokeWidth="2.2" />
                <line x1="8.5" y1="13.2" x2="15.5" y2="17.8" strokeWidth="2.2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">Mentee</span>
                <span className="text-[10px] font-bold text-[#7C3AED] bg-[#F3E8FF] border border-[#E9D4FF] px-2 py-0.5 rounded-full tracking-wider uppercase">
                  TRACKER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Daily Status & Standup</p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF] text-slate-900 p-6 sm:p-7 shadow-sm border border-purple-200/80">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-gradient-to-bl from-[#E9D4FF]/40 via-purple-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-52 h-52 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] border border-[#E9D4FF] text-[#7C3AED] text-xs font-bold">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daily Status <span className="text-[#7C3AED]">Report</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
              Keep your mentors and leads updated with your daily progress, accomplishments, and roadblocks.
            </p>
          </div>
        </div>

        {/* Main Status Submission Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Mentee Info & Task */}
          <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  1
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Deliverables & Task Overview
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Your details and the task you're working on today
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Mentee Name */}
              <div className="space-y-1.5">
                <Label htmlFor="menteeName" className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    id="menteeName"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    className="pl-9 h-10 rounded-xl text-xs border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20 font-medium"
                    {...register("menteeName")}
                  />
                </div>
                {errors.menteeName && (
                  <p className="text-xs text-rose-500">{errors.menteeName.message}</p>
                )}
              </div>

              {/* Current Task */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="currentTask" className="text-xs font-semibold text-slate-700">
                    Current Task / Ticket Title <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">
                    {currentTaskVal?.length || 0}/200
                  </span>
                </div>
                <Input
                  id="currentTask"
                  placeholder="e.g. Implement user authentication workflow with Firebase and tests"
                  maxLength={200}
                  className="h-10 rounded-xl text-xs font-medium border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20"
                  {...register("currentTask")}
                />
                {errors.currentTask && (
                  <p className="text-xs text-rose-500">{errors.currentTask.message}</p>
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="shortDescription" className="text-xs font-semibold text-slate-700">
                    Detailed Work Description <span className="text-rose-500">*</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">
                    {shortDescriptionVal?.length || 0}/2000
                  </span>
                </div>
                <Textarea
                  id="shortDescription"
                  placeholder="Summarize key accomplishments, code changes, PR reviews, or research conducted today..."
                  rows={4}
                  maxLength={2000}
                  className="rounded-xl text-xs border-slate-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]/20 leading-relaxed"
                  {...register("shortDescription")}
                />
                {errors.shortDescription && (
                  <p className="text-xs text-rose-500">{errors.shortDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Progress & Blockers */}
          <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  2
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Status & Impediments
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Indicate your current velocity and flag blockers immediately.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Visual Status Buttons */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Select Current Status <span className="text-rose-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = selectedStatus === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setValue("status", opt.value, { shouldValidate: true })}
                        className={`relative p-3 rounded-xl border border-slate-200/90 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${isSelected ? opt.activeColor : opt.hoverColor
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <Icon className={`h-5 w-5 ${isSelected ? "" : opt.iconColor}`} />
                        <span className="text-[11px] font-bold">{opt.label}</span>
                        <span className={`text-[9px] font-normal ${isSelected ? "opacity-80" : "text-slate-400"}`}>
                          {opt.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.status && (
                  <p className="text-xs text-rose-500 mt-1">{errors.status.message}</p>
                )}
              </div>

              {/* Blocker and Idle side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="blockerDependency" className="text-xs font-semibold text-slate-700">
                    Blocker / Dependency Details{" "}
                    {selectedStatus === "Blocked" ? (
                      <span className="text-rose-500 font-normal">(required)</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(optional)</span>
                    )}
                  </Label>
                  <Textarea
                    id="blockerDependency"
                    placeholder="Describe any external dependencies or potential delays..."
                    rows={3}
                    maxLength={2000}
                    className={`rounded-xl text-xs ${selectedStatus === "Blocked"
                      ? "border-rose-300 focus:border-rose-500 bg-rose-50/30"
                      : "border-slate-200 focus:border-[#7C3AED]"
                      }`}
                    {...register("blockerDependency")}
                  />
                  {errors.blockerDependency && (
                    <p className="text-xs text-rose-500 mt-1">{errors.blockerDependency.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="idleReasonWorkNeeded" className="text-xs font-semibold text-slate-700">
                    Idle Reason / Additional Work Needed{" "}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="idleReasonWorkNeeded"
                    placeholder="Need assistance with next task assignment or waiting for code review..."
                    rows={3}
                    maxLength={2000}
                    className="rounded-xl text-xs border-slate-200 focus:border-[#7C3AED]"
                    {...register("idleReasonWorkNeeded")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Timeline & Notes */}
          <Card className="border border-slate-200/90 rounded-2xl shadow-xs bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  3
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Timeline & Notes
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Expected completion and any additional context.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Expected Completion Date */}
              <div className="space-y-1.5">
                <Label htmlFor="expectedCompletion" className="text-xs font-semibold text-slate-700">
                  Expected Completion Date{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <DateInput
                  id="expectedCompletion"
                  className="h-10 rounded-xl text-xs"
                  {...register("expectedCompletion")}
                />
                {errors.expectedCompletion && (
                  <p className="text-xs text-rose-500">{errors.expectedCompletion.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                  Additional Notes{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any extra context or links to PRs / Jira tickets..."
                  rows={2}
                  maxLength={2000}
                  className="rounded-xl text-xs border-slate-200 focus:border-[#7C3AED]"
                  {...register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-11 px-5 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              type="submit"
              className="h-11 px-8 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/25 border-0 transition-transform active:scale-95"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Submit Daily Status
                </span>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
