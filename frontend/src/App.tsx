import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import EnhancedCoachDashboard from "./pages/EnhancedCoachDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import EnhancedStudentsPage from "./pages/EnhancedStudentsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import CenterDetailPage from "./pages/CenterDetailPage";
import AttendanceManagementPage from "./pages/AttendanceManagementPage";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import FixturesManagementPage from "./pages/FixturesManagementPage";
import StudentFixturesPage from "./pages/StudentFixturesPage";
import DrillsManagementPage from "./pages/DrillsManagementPage";
import DrillsPage from "./pages/DrillsPage";
import FeedPage from "./pages/FeedPage";
import PostCreationPage from "./pages/PostCreationPage";
import PostApprovalPage from "./pages/PostApprovalPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import VotingPage from "./pages/VotingPage";
import NotFound from "./pages/NotFound";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardSelector: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "ADMIN") return <EnhancedAdminDashboard />;
  if (user.role === "STUDENT") return <StudentDashboard />;
  return <EnhancedCoachDashboard />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardSelector />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Layout>
                <EnhancedStudentsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <PrivateRoute>
              <Layout>
                <StudentDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Layout>
                <AdminManagementPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/centers/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CenterDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <Layout>
                <AttendanceManagementPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-attendance"
          element={
            <PrivateRoute>
              <Layout>
                <StudentAttendancePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/fixtures"
          element={
            <PrivateRoute>
              <Layout>
                <FixturesManagementPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-fixtures"
          element={
            <PrivateRoute>
              <Layout>
                <StudentFixturesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drills"
          element={
            <PrivateRoute>
              <Layout>
                <DrillsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drills/manage"
          element={
            <PrivateRoute>
              <Layout>
                <DrillsManagementPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Layout>
                <FeedPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed/create"
          element={
            <PrivateRoute>
              <Layout>
                <PostCreationPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed/approve"
          element={
            <PrivateRoute>
              <Layout>
                <PostApprovalPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Layout>
                <LeaderboardPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vote/:sessionId"
          element={
            <PrivateRoute>
              <Layout>
                <VotingPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

