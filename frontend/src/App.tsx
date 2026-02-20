import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SmoothScroll } from "./components/SmoothScroll";
import { PageTransition } from "./components/PageTransition";

// Component to handle legacy route redirects with params
const LegacyRedirect: React.FC<{ to: string }> = ({ to }) => {
  const params = useParams();
  const paramKey = Object.keys(params)[0];
  const paramValue = params[paramKey];
  return <Navigate to={`${to}/${paramValue}`} replace />;
};
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import EnhancedCoachDashboard from "./pages/EnhancedCoachDashboard";
import StudentLayout from "./components/StudentLayout";
import CoachLayout from "./components/CoachLayout";
import AdminLayout from "./components/AdminLayout";
import FanLayout from "./components/FanLayout";
import StudentDashboardOverview from "./pages/student/StudentDashboardOverview";
import StudentDevelopmentPage from "./pages/student/StudentDevelopmentPage";
import StudentWellnessReportsPage from "./pages/student/StudentWellnessReportsPage";
import StudentMatchesPage from "./pages/student/StudentMatchesPage";
import StudentFanclubBenefitsPage from "./pages/student/StudentFanclubBenefitsPage";
import EnhancedStudentsPage from "./pages/EnhancedStudentsPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import CenterDetailPage from "./pages/CenterDetailPage";
import AttendanceManagementPage from "./pages/AttendanceManagementPage";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import StudentFixturesPage from "./pages/StudentFixturesPage";
import DrillsManagementPage from "./pages/DrillsManagementPage";
import DrillsPage from "./pages/DrillsPage";
import FeedPage from "./pages/FeedPage";
import PostCreationPage from "./pages/PostCreationPage";
import PostApprovalPage from "./pages/PostApprovalPage";
import VotingPage from "./pages/VotingPage";
import LeadsPage from "./pages/LeadsPage";
import MerchandiseListPage from "./pages/MerchandiseListPage";
import MerchandiseFormPage from "./pages/MerchandiseFormPage";
import CentresManagementPage from "./pages/CentresManagementPage";
import CentreFormPage from "./pages/CentreFormPage";
import CentreAnalyticsPage from "./pages/admin/centres/CentreAnalyticsPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import BrochurePage from "./pages/BrochurePage";
import InteractiveBrochurePage from "./pages/InteractiveBrochurePage";
import RealVerseExperiencePage from "./pages/RealVerseExperiencePage";
import AboutPage from "./pages/AboutPage";
import TeamsPage from "./pages/TeamsPage";
import AdminStaffPage from "./pages/AdminStaffPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import FooterConfigPage from "./pages/admin/FooterConfigPage";
import PlayerAnalyticsPage from "./pages/PlayerAnalyticsPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import PlayerComparisonPage from "./pages/PlayerComparisonPage";
import TrialBoardPage from "./pages/TrialBoardPage";
import TrialReportFormPage from "./pages/TrialReportFormPage";
import TrialistDetailPage from "./pages/TrialistDetailPage";
import ParentDevelopmentReportPage from "./pages/ParentDevelopmentReportPage";
import ManageParentReportsPage from "./pages/ManageParentReportsPage";
import PlayerLoadDashboardPage from "./pages/PlayerLoadDashboardPage";
import ProgramsOverviewPage from "./pages/ProgramsOverviewPage";
import ElitePathwayProgramPage from "./pages/ElitePathwayProgramPage";
import SeniorCompetitiveProgramPage from "./pages/SeniorCompetitiveProgramPage";
import WomenPerformancePathwayPage from "./pages/WomenPerformancePathwayPage";
import FoundationYouthProgramPage from "./pages/FoundationYouthProgramPage";
import ScheduleManagementPage from "./pages/ScheduleManagementPage";
import FanDashboardOverview from "./pages/fan/FanDashboardOverview";
import FanBenefitsPage from "./pages/fan/FanBenefitsPage";
import FanGamesPage from "./pages/fan/FanGamesPage";
import FanMatchdayPage from "./pages/fan/FanMatchdayPage";
import FanProfilePage from "./pages/fan/FanProfilePage";
import FanProgramsPage from "./pages/fan/FanProgramsPage";
import FanClubManagementPage from "./pages/admin/fans/FanClubManagementPage";
import FanClubContentPage from "./pages/admin/fans/FanClubContentPage";
import AdminFanSettingsPage from "./pages/admin/fans/AdminFanSettingsPage";
import ImportResultsPage from "./pages/admin/ImportResultsPage";
import PaymentLogsPage from "./pages/admin/PaymentLogsPage";
import FanClubJoinPage from "./pages/FanClubJoinPage";
import CrmLayout from "./components/CrmLayout";
import CrmDashboardPage from "./pages/crm/CrmDashboardPage";
import CrmImportPage from "./pages/crm/CrmImportPage";
import CoachTrainingCalendarPage from "./pages/CoachTrainingCalendarPage";
import StudentTrainingCalendarPage from "./pages/StudentTrainingCalendarPage";
import CoachDrillContentPage from "./pages/coach/CoachDrillContentPage";
import CoachPostApprovalPage from "./pages/coach/CoachPostApprovalPage";
import CoachPostCreationPage from "./pages/coach/CoachPostCreationPage";
import NotFound from "./pages/NotFound";

// Simple loading spinner component for auth restoration
const AuthLoadingSpinner: React.FC = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020C1B",
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "3px solid rgba(28, 36, 48, 0.6)",
            borderTopColor: "#0A3D91",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "1rem", color: "#B0B0B0", fontSize: "0.875rem" }}>
          Loading...
        </p>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isReady } = useAuth();
  
  // Wait for auth restoration to complete
  if (!isReady) {
    return <AuthLoadingSpinner />;
  }
  
  // Only redirect to login if auth is ready and user is missing
  if (!user) {
    return <Navigate to="/realverse/login" replace />;
  }
  
  return <>{children}</>;
};

const RequireRole: React.FC<{ roles: Array<"ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM">; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, isReady } = useAuth();
  
  // Wait for auth restoration to complete
  if (!isReady) {
    return <AuthLoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/realverse/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to="/realverse" replace />;
  }
  
  return <>{children}</>;
};

const DashboardSelector: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return (
      <div style={{ padding: '2rem', color: '#FFFFFF' }}>
        <p>No user found. Redirecting to login...</p>
      </div>
    );
  }
  if (user.role === "ADMIN") return <Navigate to="/realverse/admin/students" replace />;
  if (user.role === "STUDENT") return <Navigate to="/realverse/student" replace />;
  if (user.role === "COACH") return <Navigate to="/realverse/coach" replace />;
  if (user.role === "FAN") return <Navigate to="/realverse/fan" replace />;
  if (user.role === "CRM") return <Navigate to="/realverse/crm" replace />;
  return null;
};

const App: React.FC = () => {
  return (
    <SmoothScroll>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <PageTransition>
          <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        
        {/* Shop Pages - Disabled in UI, backend code preserved */}
        {/* <Route path="/shop" element={<ShopPage />} /> */}
        {/* <Route path="/shop/:slug" element={<ProductDetailPage />} /> */}
        {/* <Route path="/cart" element={<CartPage />} /> */}
        {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
        {/* <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} /> */}
        
        {/* RealVerse Join Entry Page - Redirected to Brochure */}
        <Route path="/realverse/join" element={<Navigate to="/brochure" replace />} />
        
        {/* Brochure Pages */}
        <Route path="/brochure" element={<InteractiveBrochurePage />} />
        <Route path="/brochure/classic" element={<BrochurePage />} />
        
        {/* RealVerse Experience */}
        <Route path="/realverse/experience" element={<RealVerseExperiencePage />} />
        
        {/* Programmes Pages */}
        <Route path="/programs" element={<ProgramsOverviewPage />} />
        <Route path="/programs/epp" element={<ElitePathwayProgramPage />} />
        <Route path="/programs/scp" element={<SeniorCompetitiveProgramPage />} />
        <Route path="/programs/wpp" element={<WomenPerformancePathwayPage />} />
        <Route path="/programs/fydp" element={<FoundationYouthProgramPage />} />
        <Route path="/fan-club/join" element={<FanClubJoinPage />} />
        
        {/* RealVerse Login */}
        <Route
          path="/realverse/login"
          element={<LoginPage />}
        />
        <Route
          path="/login"
          element={<Navigate to="/realverse/login" replace />}
        />
        
        {/* RealVerse Dashboard - Main Entry Point */}
        <Route
          path="/realverse"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardSelector />
              </Layout>
            </PrivateRoute>
          }
        />
        
        {/* Student Section - Nested Routes - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/student"
          element={
            <PrivateRoute>
              <RequireRole roles={["STUDENT"]}>
                <StudentLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<StudentDashboardOverview />} />
          <Route path="training-calendar" element={<StudentTrainingCalendarPage />} />
          <Route path="development" element={<StudentDevelopmentPage />} />
          <Route path="pathway" element={<Navigate to="/realverse/student/development" replace />} />
          <Route path="feedback" element={<Navigate to="/realverse/student/development" replace />} />
          <Route path="journey" element={<Navigate to="/realverse/student/development" replace />} />
          <Route path="matches" element={<StudentMatchesPage />} />
          <Route path="wellness-reports" element={<StudentWellnessReportsPage />} />
          <Route path="wellness" element={<Navigate to="/realverse/student/wellness-reports" replace />} />
          <Route path="fanclub-benefits" element={<StudentFanclubBenefitsPage />} />
          <Route path="analytics" element={<PlayerAnalyticsPage />} />
        </Route>

        {/* Fan Club Section (RealVerse Fan) */}
        <Route
          path="/realverse/fan"
          element={
            <PrivateRoute>
              <RequireRole roles={["FAN"]}>
                <FanLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<FanDashboardOverview />} />
          <Route path="schedule" element={<ScheduleManagementPage />} />
          <Route path="benefits" element={<FanBenefitsPage />} />
          <Route path="games" element={<FanGamesPage />} />
          <Route path="matchday" element={<FanMatchdayPage />} />
          <Route path="profile" element={<FanProfilePage />} />
          <Route path="programs" element={<FanProgramsPage />} />
        </Route>

        {/* CRM Section (Sales/BD) */}
        <Route
          path="/realverse/crm"
          element={
            <PrivateRoute>
              <RequireRole roles={["CRM", "ADMIN"]}>
                <CrmLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<CrmDashboardPage />} />
          <Route path="import" element={<CrmImportPage />} />
        </Route>

        {/* Student routes that should use StudentLayout - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/my-attendance"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentAttendancePage />} />
        </Route>
        <Route
          path="/realverse/my-fixtures"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentFixturesPage />} />
        </Route>
        <Route
          path="/realverse/drills"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DrillsPage />} />
        </Route>
        <Route
          path="/realverse/feed"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<FeedPage />} />
        </Route>
        {/* Coach Section - Nested Routes - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/coach"
          element={
            <PrivateRoute>
              <RequireRole roles={["COACH"]}>
                <CoachLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<EnhancedCoachDashboard />} />
          <Route path="training-calendar" element={<CoachTrainingCalendarPage />} />
          <Route path="schedule" element={<ScheduleManagementPage />} />
          <Route path="students" element={<EnhancedStudentsPage />} />
          <Route path="drill-content" element={<CoachDrillContentPage />} />
          <Route path="feed/approve" element={<CoachPostApprovalPage />} />
          <Route path="feed/create" element={<CoachPostCreationPage />} />
        </Route>

        {/* Admin Section - Nested Routes - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/admin"
          element={
            <PrivateRoute>
              <RequireRole roles={["ADMIN"]}>
                <AdminLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/realverse/admin/students" replace />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="footer" element={<FooterConfigPage />} />
          <Route path="attendance" element={<AttendanceManagementPage />} />
          <Route path="schedule" element={<ScheduleManagementPage />} />
          <Route path="students" element={<EnhancedStudentsPage />} />
          <Route path="students/import-results" element={<ImportResultsPage />} />
          <Route path="payment-logs" element={<PaymentLogsPage />} />
          <Route path="players/:id/profile" element={<PlayerProfilePage />} />
          {/* Fan Club control plane */}
          <Route path="fans" element={<FanClubManagementPage />} />
          <Route path="fans/content" element={<FanClubContentPage />} />
          <Route path="fans/settings" element={<AdminFanSettingsPage />} />
        </Route>

        {/* RealVerse Routes - All authenticated routes under /realverse */}
        <Route
          path="/realverse/students"
          element={<Navigate to="/realverse/admin/students" replace />}
        />
        {/* Legacy route redirect */}
        <Route
          path="/students"
          element={<Navigate to="/realverse/students" replace />}
        />
        <Route
          path="/realverse/students/:id"
          element={
            <PrivateRoute>
              <Layout>
                <StudentDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/students/:id"
          element={<LegacyRedirect to="/realverse/students" />}
        />
        <Route
          path="/realverse/admin/leads"
          element={
            <PrivateRoute>
              <RequireRole roles={["ADMIN"]}>
                <AdminLayout />
              </RequireRole>
            </PrivateRoute>
          }
        >
          <Route index element={<LeadsPage />} />
        </Route>
        <Route
          path="/admin"
          element={<Navigate to="/realverse/admin/students" replace />}
        />
        <Route path="/admin/fans" element={<Navigate to="/realverse/admin/fans" replace />} />
        <Route path="/admin/fans/tiers" element={<Navigate to="/realverse/admin/fans/tiers" replace />} />
        <Route path="/admin/fans/rewards" element={<Navigate to="/realverse/admin/fans/rewards" replace />} />
        {/* <Route path="/admin/fans/games" element={<Navigate to="/realverse/admin/fans/games" replace />} /> */}
        <Route path="/admin/fans/matchday" element={<Navigate to="/realverse/admin/fans/matchday" replace />} />
        <Route path="/admin/fans/analytics" element={<Navigate to="/realverse/admin/fans/analytics" replace />} />
        <Route path="/admin/fans/settings" element={<Navigate to="/realverse/admin/fans/settings" replace />} />
        <Route
          path="/admin/schedule"
          element={<Navigate to="/realverse/admin/schedule" replace />}
        />
        <Route
          path="/realverse/admin/merch"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<MerchandiseListPage />} />
        </Route>
        <Route
          path="/realverse/admin/merch/new"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<MerchandiseFormPage />} />
        </Route>
        <Route
          path="/realverse/admin/merch/:id/edit"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<MerchandiseFormPage />} />
        </Route>
        <Route
          path="/realverse/admin/centres"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CentresManagementPage />} />
        </Route>
        <Route
          path="/realverse/admin/centres/new"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CentreFormPage />} />
        </Route>
        <Route
          path="/realverse/admin/centres/:id/edit"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CentreFormPage />} />
        </Route>
        <Route
          path="/realverse/admin/centres/:centreId/analytics"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<CentreAnalyticsPage />} />
        </Route>
        <Route
          path="/realverse/centers/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CenterDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/centers/:id"
          element={<LegacyRedirect to="/realverse/centers" />}
        />
        <Route
          path="/realverse/attendance"
          element={<Navigate to="/realverse/admin/attendance" replace />}
        />
        <Route
          path="/attendance"
          element={<Navigate to="/realverse/admin/attendance" replace />}
        />
        {/* Legacy redirects for student routes */}
        <Route
          path="/my-attendance"
          element={<Navigate to="/realverse/my-attendance" replace />}
        />
        <Route
          path="/my-fixtures"
          element={<Navigate to="/realverse/my-fixtures" replace />}
        />
        <Route
          path="/drills"
          element={<Navigate to="/realverse/drills" replace />}
        />
        <Route
          path="/feed"
          element={<Navigate to="/realverse/feed" replace />}
        />

        {/* Admin/Coach routes - Fixtures redirect to schedule (fixtures page removed) */}
        <Route
          path="/realverse/fixtures"
          element={<Navigate to="/realverse/admin/schedule" replace />}
        />
        <Route
          path="/fixtures"
          element={<Navigate to="/realverse/admin/schedule" replace />}
        />
        <Route
          path="/realverse/drills/manage"
          element={
            <PrivateRoute>
              <Layout>
                <DrillsManagementPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drills/manage"
          element={<Navigate to="/realverse/drills/manage" replace />}
        />
        <Route
          path="/realverse/feed/create"
          element={
            <PrivateRoute>
              <Layout>
                <PostCreationPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed/create"
          element={<Navigate to="/realverse/feed/create" replace />}
        />
        <Route
          path="/realverse/feed/approve"
          element={
            <PrivateRoute>
              <Layout>
                <PostApprovalPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/feed/approve"
          element={<Navigate to="/realverse/feed/approve" replace />}
        />
        <Route
          path="/realverse/vote/:sessionId"
          element={
            <PrivateRoute>
              <Layout>
                <VotingPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vote/:sessionId"
          element={<LegacyRedirect to="/realverse/vote" />}
        />
        
        {/* Scouting & Comparison Routes (COACH/ADMIN only) */}
        <Route
          path="/realverse/scouting/compare"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PlayerComparisonPage />} />
        </Route>
        <Route
          path="/realverse/player/:id"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PlayerProfilePage />} />
        </Route>
        {/* Load Dashboard - Accessible by students (own) and coaches/admins (any player) */}
        <Route
          path="/realverse/player/:id/load-dashboard"
          element={
            <PrivateRoute>
              <PlayerLoadDashboardPage />
            </PrivateRoute>
          }
        />
        
        {/* Parent Development Reports Routes */}
        <Route
          path="/realverse/parent-reports/manage"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ManageParentReportsPage />} />
        </Route>
        <Route
          path="/realverse/parent-reports/manage/:studentId"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ManageParentReportsPage />} />
        </Route>
        <Route
          path="/realverse/parent-reports/:reportId"
          element={
            <PrivateRoute>
              <Layout>
                <ParentDevelopmentReportPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/my-reports"
          element={
            <PrivateRoute>
              <Navigate to="/realverse/student/wellness-reports" replace />
            </PrivateRoute>
          }
        />
        
        {/* Trial Management Routes (COACH/ADMIN only) */}
        <Route
          path="/realverse/trials/board"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<TrialBoardPage />} />
        </Route>
        <Route
          path="/realverse/trials/trialists/:trialistId"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<TrialistDetailPage />} />
        </Route>
        <Route
          path="/realverse/trials/reports/new"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<TrialReportFormPage />} />
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </SmoothScroll>
  );
};

export default App;

