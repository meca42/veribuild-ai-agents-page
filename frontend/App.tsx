import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/marketing/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import AuthCallback from "./pages/auth/Callback";
import CreateOrg from "./pages/onboarding/CreateOrg";
import SelectOrg from "./pages/onboarding/SelectOrg";
import ProjectsList from "./pages/app/projects/ProjectsList";
import ProjectDetail from "./pages/app/projects/ProjectDetail";
import ProjectPhases from "./pages/app/projects/ProjectPhases";
import ProjectSteps from "./pages/app/projects/ProjectSteps";
import Files from "./pages/app/files/Files";
import Drawings from "./pages/app/drawings/Drawings";
import Documents from "./pages/app/documents/Documents";
import RFI from "./pages/app/rfi/RFI";
import Submittals from "./pages/app/submittals/Submittals";
import Materials from "./pages/app/materials/Materials";
import Issues from "./pages/app/issues/Issues";
import Inspections from "./pages/app/inspections/Inspections";
import Agents from "./pages/app/agents/Agents";
import Runs from "./pages/app/runs/Runs";
import Settings from "./pages/app/settings/Settings";
import Sandbox from "./pages/app/sandbox/Sandbox";
import MockControls from "./pages/app/sandbox/MockControls";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "./lib/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<UpdatePassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route path="/onboarding/create-org" element={
              <ProtectedRoute requireOrg={false}>
                <CreateOrg />
              </ProtectedRoute>
            } />
            <Route path="/onboarding/select-org" element={
              <ProtectedRoute requireOrg={false}>
                <SelectOrg />
              </ProtectedRoute>
            } />

            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/phases" element={<ProjectPhases />} />
              <Route path="/projects/:id/steps" element={<ProjectSteps />} />
              <Route path="/files" element={<Files />} />
              <Route path="/drawings" element={<Drawings />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/rfi" element={<RFI />} />
              <Route path="/submittals" element={<Submittals />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/inspections" element={<Inspections />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/runs" element={<Runs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sandbox/ui" element={<Sandbox />} />
              <Route path="/sandbox/mock" element={<MockControls />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
