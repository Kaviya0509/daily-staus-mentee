import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";
import { db } from "./firebase";
import type { ReportFormData } from "../schemas/reportSchema";

const COLLECTION = "menteeReports";

export const checkExistingReport = async (
  menteeName: string,
  reportDate: string
): Promise<boolean> => {
  const sanitized = (menteeName || "mentee").trim().toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, "");
  const col = collection(db, COLLECTION);
  const q = query(
    col,
    where("menteeUid", "==", sanitized.replace(/[^a-zA-Z0-9]/g, "")),
    where("reportDate", "==", reportDate)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const createReport = async (
  data: ReportFormData
): Promise<string> => {
  const sanitizedIdentifier = (data.menteeEmail || data.menteeName || "mentee").trim().toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, "");
  const reportDateVal = data.reportDate || format(new Date(), "yyyy-MM-dd");
  const reportId = `rep_${sanitizedIdentifier.replace(/[^a-zA-Z0-9]/g, "")}_${reportDateVal}_${Date.now()}`;

  const firestorePayload = {
    reportId,
    menteeUid: sanitizedIdentifier,
    menteeName: data.menteeName,
    menteeEmail: data.menteeEmail || "",
    reportDate: reportDateVal,
    currentTask: data.currentTask,
    status: data.status,
    shortDescription: data.shortDescription,
    managerLead: data.managerLead || "",
    blockerDependency: data.blockerDependency || "",
    idleReasonWorkNeeded: data.idleReasonWorkNeeded || "",
    expectedCompletion: data.expectedCompletion || "",
    notes: data.notes || "",
    submissionStatus: "Submitted",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(collection(db, COLLECTION), reportId);
  await setDoc(docRef, firestorePayload);

  return reportId;
};
