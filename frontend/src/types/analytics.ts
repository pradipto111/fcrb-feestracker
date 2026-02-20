/**
 * Analytics data contract - single source of truth for admin analytics
 */

export interface AdminAnalytics {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  outstandingAmount: number;
  totalExpected: number;
  centresCount: number;
  staffCount: number;
  studentsByCentre: Array<{ centreId: number; count: number }>;
  revenueByCentre: Array<{ centreId: number; revenue: number }>;
  studentsByProgram: Record<string, number>;
  paymentStatusBreakdown: {
    paid: number;
    outstanding: number;
    credit: number;
  };
}

export interface DashboardSummary {
  totalCollected: number;
  studentCount: number;
  activeStudentCount?: number;
  approxOutstanding: number;
}

export interface AnalyticsOverview {
  totalStudents: number;
  totalActivePlayers: number;
  avgAttendance?: number;
  sessionsLast30Days?: number;
  matchesSeason?: number;
  feeCollectionRate?: number;
  avgWellness?: number;
}
