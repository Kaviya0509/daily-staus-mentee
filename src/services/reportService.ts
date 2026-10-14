import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ReportFormData } from "../schemas/reportSchema";

const COLLECTION = "menteeReports";

export const createReport = async (
  data: ReportFormData
): Promise<string> => {
  const sanitizedEmail = (data.menteeEmail || "mentee").trim().toLowerCase().replace(/[^a-zA-Z0-9@._-]/g, "");
  const reportId = `rep_${sanitizedEmail.replace(/[^a-zA-Z0-9]/g, "")}_${data.reportDate}_${Date.now()}`;

  const firestorePayload = {
    reportId,
    menteeUid: sanitizedEmail,
    menteeName: data.menteeName,
    menteeEmail: data.menteeEmail,
    reportDate: data.reportDate,
    currentTask: data.currentTask,
    status: data.status,
    shortDescription: data.shortDescription,
    managerLead: data.managerLead,
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
