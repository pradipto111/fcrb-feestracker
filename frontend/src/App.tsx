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
import RealVerseJoinPage from "./pages/RealVerseJoinPage";
import LoginPage from "./pages/LoginPage";
import EnhancedAdminDashboard from "./pages/EnhancedAdminDashboard";
import EnhancedCoachDashboard from "./pages/EnhancedCoachDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentLayout from "./components/StudentLayout";
import CoachLayout from "./components/CoachLayout";
import AdminLayout from "./components/AdminLayout";
import StudentDashboardOverview from "./pages/student/StudentDashboardOverview";
import StudentPathwayPage from "./pages/student/StudentPathwayPage";
import StudentFeedbackPage from "./pages/student/StudentFeedbackPage";
import StudentJourneyPage from "./pages/student/StudentJourneyPage";
import StudentMatchesPage from "./pages/student/StudentMatchesPage";
import StudentWellnessPage from "./pages/student/StudentWellnessPage";
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
import WebsiteLeadsPage from "./pages/WebsiteLeadsPage";
import MerchandiseListPage from "./pages/MerchandiseListPage";
import MerchandiseFormPage from "./pages/MerchandiseFormPage";
import CentresManagementPage from "./pages/CentresManagementPage";
import CentreFormPage from "./pages/CentreFormPage";
import CentreAnalyticsPage from "./pages/admin/centres/CentreAnalyticsPage";
import GlobalAnalyticsPage from "./pages/GlobalAnalyticsPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import BrochurePage from "./pages/BrochurePage";
import InteractiveBrochurePage from "./pages/InteractiveBrochurePage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminStaffPage from "./pages/AdminStaffPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import CoachAnalyticsPage from "./pages/CoachAnalyticsPage";
import PlayerAnalyticsPage from "./pages/PlayerAnalyticsPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import BatchReviewPage from "./pages/BatchReviewPage";
import CoachCalibrationDashboard from "./pages/CoachCalibrationDashboard";
import NotFound from "./pages/NotFound";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/realverse/login" replace />;
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
  if (user.role === "ADMIN") return <Navigate to="/realverse/admin" replace />;
  if (user.role === "STUDENT") return <Navigate to="/realverse/student" replace />;
  if (user.role === "COACH") return <Navigate to="/realverse/coach" replace />;
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
        
        {/* Shop Pages */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
        
        {/* RealVerse Join Entry Page */}
        <Route path="/realverse/join" element={<RealVerseJoinPage />} />
        
        {/* Brochure Pages */}
        <Route path="/brochure" element={<InteractiveBrochurePage />} />
        <Route path="/brochure/classic" element={<BrochurePage />} />
        
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
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<StudentDashboardOverview />} />
          <Route path="pathway" element={<StudentPathwayPage />} />
          <Route path="feedback" element={<StudentFeedbackPage />} />
          <Route path="journey" element={<StudentJourneyPage />} />
          <Route path="matches" element={<StudentMatchesPage />} />
          <Route path="wellness" element={<StudentWellnessPage />} />
          <Route path="analytics" element={<PlayerAnalyticsPage />} />
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
        <Route
          path="/realverse/leaderboard"
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<LeaderboardPage />} />
        </Route>

        {/* Coach Section - Nested Routes - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/coach"
          element={
            <PrivateRoute>
              <CoachLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<EnhancedCoachDashboard />} />
          <Route path="analytics" element={<CoachAnalyticsPage />} />
        </Route>

        {/* Admin Section - Nested Routes - No Layout wrapper to avoid old sidebar */}
        <Route
          path="/realverse/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<EnhancedAdminDashboard />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="attendance" element={<AttendanceManagementPage />} />
          <Route path="fixtures" element={<FixturesManagementPage />} />
          <Route path="students" element={<EnhancedStudentsPage />} />
          <Route path="batch-review" element={<BatchReviewPage />} />
          <Route path="players/:id/profile" element={<PlayerProfilePage />} />
          <Route path="calibration" element={<CoachCalibrationDashboard />} />
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
              <AdminLayout>
                <WebsiteLeadsPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={<Navigate to="/realverse/admin" replace />}
        />
        <Route
          path="/realverse/admin/merch"
          element={
            <PrivateRoute>
              <AdminLayout>
                <MerchandiseListPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/merch/new"
          element={
            <PrivateRoute>
              <AdminLayout>
                <MerchandiseFormPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/merch/:id/edit"
          element={
            <PrivateRoute>
              <AdminLayout>
                <MerchandiseFormPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/centres"
          element={
            <PrivateRoute>
              <AdminLayout>
                <CentresManagementPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/centres/new"
          element={
            <PrivateRoute>
              <AdminLayout>
                <CentreFormPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/centres/:id/edit"
          element={
            <PrivateRoute>
              <AdminLayout>
                <CentreFormPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/realverse/admin/centres/:centreId/analytics"
          element={
            <PrivateRoute>
              <AdminLayout>
                <CentreAnalyticsPage />
              </AdminLayout>
            </PrivateRoute>
          }
        />
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
        <Route
          path="/leaderboard"
          element={<Navigate to="/realverse/leaderboard" replace />}
        />

        {/* Admin/Coach routes - Keep separate */}
        <Route
          path="/realverse/fixtures"
          element={<Navigate to="/realverse/admin/fixtures" replace />}
        />
        <Route
          path="/fixtures"
          element={<Navigate to="/realverse/admin/fixtures" replace />}
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

