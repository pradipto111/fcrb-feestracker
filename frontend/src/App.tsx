import React, { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useGlobalLoading } from "./context/GlobalLoadingContext";
import { SmoothScroll } from "./components/SmoothScroll";
import { PageTransition } from "./components/PageTransition";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Component to handle legacy route redirects with params
const LegacyRedirect: React.FC<{ to: string }> = ({ to }) => {
  const params = useParams();
  const paramKey = Object.keys(params)[0];
  const paramValue = params[paramKey];
  return <Navigate to={`${to}/${paramValue}`} replace />;
};

const LandingPage = lazy(() => import("./pages/LandingPage"));
const StudentDashboardOverview = lazy(() => import("./pages/student/StudentDashboardOverview"));
const StudentDevelopmentPage = lazy(() => import("./pages/student/StudentDevelopmentPage"));
const StudentWellnessReportsPage = lazy(() => import("./pages/student/StudentWellnessReportsPage"));
const StudentMatchesPage = lazy(() => import("./pages/student/StudentMatchesPage"));
const StudentFanclubBenefitsPage = lazy(() => import("./pages/student/StudentFanclubBenefitsPage"));
const EnhancedStudentsPage = lazy(() => import("./pages/EnhancedStudentsPage"));
const StudentDetailPage = lazy(() => import("./pages/StudentDetailPage"));
const CenterDetailPage = lazy(() => import("./pages/CenterDetailPage"));
const AttendanceManagementPage = lazy(() => import("./pages/AttendanceManagementPage"));
const StudentAttendancePage = lazy(() => import("./pages/StudentAttendancePage"));
const StudentFixturesPage = lazy(() => import("./pages/StudentFixturesPage"));
const DrillsManagementPage = lazy(() => import("./pages/DrillsManagementPage"));
const DrillsPage = lazy(() => import("./pages/DrillsPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const PostCreationPage = lazy(() => import("./pages/PostCreationPage"));
const PostApprovalPage = lazy(() => import("./pages/PostApprovalPage"));
const VotingPage = lazy(() => import("./pages/VotingPage"));
const CentresManagementPage = lazy(() => import("./pages/CentresManagementPage"));
const CentreFormPage = lazy(() => import("./pages/CentreFormPage"));
const CentreAnalyticsPage = lazy(() => import("./pages/admin/centres/CentreAnalyticsPage"));
const BrochurePage = lazy(() => import("./pages/BrochurePage"));
const InteractiveBrochurePage = lazy(() => import("./pages/InteractiveBrochurePage"));
const RealVerseExperiencePage = lazy(() => import("./pages/RealVerseExperiencePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));
const AdminStaffPage = lazy(() => import("./pages/AdminStaffPage"));
const FooterConfigPage = lazy(() => import("./pages/admin/FooterConfigPage"));
const PlayerAnalyticsPage = lazy(() => import("./pages/PlayerAnalyticsPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const PlayerComparisonPage = lazy(() => import("./pages/PlayerComparisonPage"));
const TrialBoardPage = lazy(() => import("./pages/TrialBoardPage"));
const TrialReportFormPage = lazy(() => import("./pages/TrialReportFormPage"));
const TrialistDetailPage = lazy(() => import("./pages/TrialistDetailPage"));
const ParentDevelopmentReportPage = lazy(() => import("./pages/ParentDevelopmentReportPage"));
const ManageParentReportsPage = lazy(() => import("./pages/ManageParentReportsPage"));
const PlayerLoadDashboardPage = lazy(() => import("./pages/PlayerLoadDashboardPage"));
const ProgramsOverviewPage = lazy(() => import("./pages/ProgramsOverviewPage"));
const ElitePathwayProgramPage = lazy(() => import("./pages/ElitePathwayProgramPage"));
const SeniorCompetitiveProgramPage = lazy(() => import("./pages/SeniorCompetitiveProgramPage"));
const WomenPerformancePathwayPage = lazy(() => import("./pages/WomenPerformancePathwayPage"));
const FoundationYouthProgramPage = lazy(() => import("./pages/FoundationYouthProgramPage"));
const ScheduleManagementPage = lazy(() => import("./pages/ScheduleManagementPage"));
const FanDashboardOverview = lazy(() => import("./pages/fan/FanDashboardOverview"));
const FanBenefitsPage = lazy(() => import("./pages/fan/FanBenefitsPage"));
const FanGamesPage = lazy(() => import("./pages/fan/FanGamesPage"));
const FanMatchdayPage = lazy(() => import("./pages/fan/FanMatchdayPage"));
const FanProfilePage = lazy(() => import("./pages/fan/FanProfilePage"));
const FanProgramsPage = lazy(() => import("./pages/fan/FanProgramsPage"));
const ImportResultsPage = lazy(() => import("./pages/admin/ImportResultsPage"));
const PaymentLogsPage = lazy(() => import("./pages/admin/PaymentLogsPage"));
const AdminRevenuePage = lazy(() => import("./pages/admin/AdminRevenuePage"));
const FanClubJoinPage = lazy(() => import("./pages/FanClubJoinPage"));
const CrmDashboardPage = lazy(() => import("./pages/crm/CrmDashboardPage"));
const CrmImportPage = lazy(() => import("./pages/crm/CrmImportPage"));
const CoachTrainingCalendarPage = lazy(() => import("./pages/CoachTrainingCalendarPage"));
const StudentTrainingCalendarPage = lazy(() => import("./pages/StudentTrainingCalendarPage"));
const CoachDrillContentPage = lazy(() => import("./pages/coach/CoachDrillContentPage"));
const CoachPostApprovalPage = lazy(() => import("./pages/coach/CoachPostApprovalPage"));
const CoachPostCreationPage = lazy(() => import("./pages/coach/CoachPostCreationPage"));
const StudentLayout = lazy(() => import("./components/StudentLayout"));
const CoachLayout = lazy(() => import("./components/CoachLayout"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const FanLayout = lazy(() => import("./components/FanLayout"));
const CrmLayout = lazy(() => import("./components/CrmLayout"));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isReady } = useAuth();
  const { setChannelLoading } = useGlobalLoading();

  useEffect(() => {
    setChannelLoading("auth", !isReady, "RESTORING YOUR SESSION");
    return () => setChannelLoading("auth", false);
  }, [isReady, setChannelLoading]);

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/realverse/login" replace />;
  }

  return <>{children}</>;
};

const RequireRole: React.FC<{ roles: Array<"ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM">; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, isReady } = useAuth();
  const { setChannelLoading } = useGlobalLoading();

  useEffect(() => {
    setChannelLoading("auth", !isReady, "CHECKING ACCESS");
    return () => setChannelLoading("auth", false);
  }, [isReady, setChannelLoading]);

  if (!isReady) {
    return null;
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
  if (user.role === "COACH") return <Navigate to="/realverse/coach/students" replace />;
  if (user.role === "FAN") return <Navigate to="/realverse/fan" replace />;
  if (user.role === "CRM") return <Navigate to="/realverse/crm" replace />;
  return null;
};

const SuspenseLoaderFallback: React.FC = () => {
  const { setChannelLoading } = useGlobalLoading();

  useEffect(() => {
    setChannelLoading("suspense", true, "PREPARING MATCHDAY VIEW");
    return () => setChannelLoading("suspense", false);
  }, [setChannelLoading]);

  return null;
};

const RouteLoaderBridge: React.FC = () => {
  const location = useLocation();
  const { setChannelLoading } = useGlobalLoading();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setChannelLoading("route", true, "ENTERING THE PITCH");
    const timerId = window.setTimeout(() => {
      setChannelLoading("route", false);
    }, 700);

    return () => {
      window.clearTimeout(timerId);
      setChannelLoading("route", false);
    };
  }, [location.pathname, location.search, location.hash, setChannelLoading]);

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
        <RouteLoaderBridge />
        <PageTransition>
          <Suspense fallback={<SuspenseLoaderFallback />}>
            <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        
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
          <Route index element={<Navigate to="/realverse/coach/students" replace />} />
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
          <Route path="footer" element={<FooterConfigPage />} />
          <Route path="attendance" element={<AttendanceManagementPage />} />
          <Route path="schedule" element={<ScheduleManagementPage />} />
          <Route path="students" element={<EnhancedStudentsPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="students/import-results" element={<ImportResultsPage />} />
          <Route path="logs" element={<PaymentLogsPage />} />
          <Route path="payment-logs" element={<Navigate to="/realverse/admin/logs" replace />} />
          <Route path="players/:id/profile" element={<PlayerProfilePage />} />
        </Route>

        {/* RealVerse Routes - All authenticated routes under /realverse */}
        <Route
          path="/realverse/students"
          element={<Navigate to="/realverse/admin/students" replace />}
        />
        <Route
          path="/realverse/revenue"
          element={<Navigate to="/realverse/admin/revenue" replace />}
        />
        <Route
          path="/realverse/logs"
          element={<Navigate to="/realverse/admin/logs" replace />}
        />
        {/* Legacy route redirect */}
        <Route
          path="/students"
          element={<Navigate to="/realverse/students" replace />}
        />
        <Route
          path="/revenue"
          element={<Navigate to="/realverse/revenue" replace />}
        />
        <Route
          path="/logs"
          element={<Navigate to="/realverse/logs" replace />}
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
          path="/admin"
          element={<Navigate to="/realverse/admin/students" replace />}
        />
        <Route
          path="/admin/schedule"
          element={<Navigate to="/realverse/admin/schedule" replace />}
        />
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
          </Suspense>
        </PageTransition>
      </BrowserRouter>
    </SmoothScroll>
  );
};

export default App;

