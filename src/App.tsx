import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DailyStatusFormPage from "./pages/DailyStatusFormPage";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/form" element={<DailyStatusFormPage />} />
        <Route path="*" element={<Navigate to="/form" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
