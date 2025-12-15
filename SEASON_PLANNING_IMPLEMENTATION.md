# Season Planning & Load Prediction Module - Implementation Summary

## Overview

This module provides coaches with decision support tools for planning training blocks, monitoring cumulative load, and making informed decisions to prevent player burnout and injuries.

## ✅ Completed Features

### 1. Database Schema (Prisma)
- **SeasonPlan**: Defines season structure (start, end, phases)
- **SeasonPhase**: Periods within a season (PREPARATION, COMPETITIVE, RECOVERY, TRANSITION)
- **TrainingSessionLoad**: Manual load assessment for each session
  - Intensity (LOW, MEDIUM, HIGH)
  - Duration (minutes)
  - Focus tags (TECHNICAL, TACTICAL, PHYSICAL, RECOVERY)
  - Estimated load calculation: `Duration × Intensity Multiplier`
- **PlayerWeeklyLoad**: Aggregated weekly load per player (derived/cacheable)
  - Total load, session count, average intensity
  - Squad average comparison
  - Age-group recommended range
  - Load status (LOW, NORMAL, HIGH, CRITICAL)
- **DevelopmentBlock**: Links planning to specific development goals

### 2. Backend Implementation

#### Services (`season-planning.service.ts`)
- `calculateEstimatedLoad()`: Computes load from duration and intensity
- `getWeekBoundaries()`: Helper for week calculations
- `recalculatePlayerWeeklyLoad()`: Recalculates weekly load when sessions are updated
- `getPlayerLoadTrends()`: Returns weekly and monthly trends
- `getReadinessLoadCorrelation()`: Correlates readiness with load and injury notes

#### Routes (`season-planning.routes.ts`)
- **Season Plans**: CRUD operations
- **Session Load**: Create/update load assessments
- **Player Load Dashboard**: Trends, weekly load, correlations
- **Development Blocks**: Create blocks linked to season plans
- **Workload Messages**: Simplified messages for players/parents

### 3. Frontend Implementation

#### Pages Created
- **SeasonPlanningPage**: Main hub for season planning
- **PlayerLoadDashboardPage**: Load trends and readiness correlation visualization

#### API Client Methods
All season planning endpoints added to `api` client.

#### Navigation & CTAs
- Added "Season Planning" to AdminLayout navigation
- Added CTA button in CoachCalibrationDashboard
- Added "Load Dashboard" button in PlayerProfilePage
- Routes added to App.tsx

## 🚧 Remaining Features (Can be built incrementally)

### 1. Season Planner Calendar View
- Calendar-based UI with drag-and-drop sessions
- Visual load indicators per week
- Competition density visualization
- Soft warnings (e.g., "3 high-load weeks in a row")

### 2. Development Block Planning Interface
- Create/edit development blocks
- Link to target metrics
- Suggest load ranges and session focus distribution

### 3. Player/Parent Simplified Views
- Player dashboard: "High training week" / "Recovery-focused week"
- Parent view: High-level notes about training load

## 📋 Setup Instructions

### 1. Database Migration

```bash
cd backend
npx prisma migrate dev --name add_season_planning
npx prisma generate
```

### 2. Backend

The backend routes are already registered in `backend/src/index.ts`. No additional setup needed.

### 3. Frontend

The frontend pages and routes are already integrated. No additional setup needed.

## 🎯 Usage Guide

### For Coaches/Admins

1. **Create a Season Plan**
   - Navigate to: `/realverse/admin/season-planning`
   - Click "Create Season Plan"
   - Define season start/end dates
   - Add phases (Preparation, Competitive, Recovery)

2. **Assess Session Load**
   - When creating/editing a training session, add load assessment:
     - Intensity: Low/Medium/High
     - Duration: Minutes
     - Focus tags: Technical, Tactical, Physical, Recovery
   - System automatically calculates estimated load

3. **Monitor Player Load**
   - Navigate to: `/realverse/admin/season-planning/load-dashboard`
   - Select a player
   - View weekly trends, monthly trends
   - See readiness & load correlation

4. **View Load Dashboard from Player Profile**
   - Open any player profile
   - Click "📊 Load Dashboard" button

### For Players

- Players can view their own load dashboard (simplified view)
- See workload messages: "High training week", "Recovery-focused week", etc.

## 🔑 Key Principles

1. **Coaches stay in control** - System supports planning, doesn't dictate it
2. **Use trends, not exact numbers** - Load scores are estimates for planning
3. **Prevent overload before injuries** - Soft indicators (green/amber/red zones)
4. **Decision support, not automation** - No automatic selection or enforcement

## 📊 Load Calculation Formula

```
Estimated Load = Duration (minutes) × Intensity Multiplier

Intensity Multipliers:
- LOW: 0.5
- MEDIUM: 1.0
- HIGH: 1.5
```

**Example:**
- 90-minute session at HIGH intensity = 90 × 1.5 = 135 load points
- 60-minute session at MEDIUM intensity = 60 × 1.0 = 60 load points

## ⚠️ Important Notes

1. **Load scores are planning estimates only** - Not medical claims
2. **Weekly loads are recalculated automatically** when session loads are updated
3. **Squad averages** are calculated from all active players in the center
4. **Age-group ranges** are simplified recommendations (can be enhanced)

## 🔄 Next Steps

1. Run database migration
2. Test creating a season plan
3. Add load assessments to existing sessions
4. View load dashboard for players
5. Build remaining features incrementally as needed

## 📝 Notes for Future Development

- Consider adding GPS-based load tracking (future enhancement)
- Add more sophisticated age-group recommendations
- Implement automated warnings for load patterns
- Add export functionality for load reports
- Consider integration with injury tracking system

