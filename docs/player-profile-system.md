# Player Profile System - Implementation Guide

## Overview

This document describes the Football Manager-inspired Player Profile system built for RealVerse. The system provides a comprehensive view of player metrics, readiness, and development over time.

## Architecture

### Core Components

1. **MetricBarRow** (`frontend/src/components/player-profile/MetricBarRow.tsx`)
   - Displays individual metric with value bar, delta, tooltip
   - Supports inline editing for coaches/admins
   - Shows confidence indicators for low-confidence ratings

2. **MetricPanel** (`frontend/src/components/player-profile/MetricPanel.tsx`)
   - Collapsible panel grouping metrics by category
   - Searchable metric list
   - Supports sorting and filtering

3. **ReadinessCard** (`frontend/src/components/player-profile/ReadinessCard.tsx`)
   - Displays overall readiness score (0-100)
   - Breakdown by Technical/Physical/Mental/Attitude/Tactical Fit
   - "Why?" button opens explanation modal
   - Shows status bands (Foundation/Developing/Competitive/Advanced/Ready)

4. **PositionSuitabilityGrid** (`frontend/src/components/player-profile/PositionSuitabilityGrid.tsx`)
   - Grid of 9 positions (GK, CB, FB, WB, DM, CM, AM, W, ST)
   - Each position shows suitability bar and score
   - Supports comments per position

5. **PlayerHeaderCard** (`frontend/src/components/player-profile/PlayerHeaderCard.tsx`)
   - Player identity header with avatar, name, position, centre, age group
   - Quick info badges

6. **PlayerProfilePage** (`frontend/src/pages/PlayerProfilePage.tsx`)
   - Main page with tab navigation
   - Tabs: Overview, Attributes, Development, Notes, Edit (coach/admin only)

## Data Flow

### API Endpoints Used

- `GET /player-metrics/snapshots/:studentId/latest` - Get latest snapshot
- `GET /player-metrics/snapshots/:studentId` - Get snapshot history
- `GET /player-metrics/positional/:studentId` - Get positional suitability
- `POST /player-metrics/snapshots` - Create new snapshot (coach/admin)

### Data Structure

```typescript
interface MetricSnapshot {
  id: number;
  createdAt: string;
  sourceContext: string; // MONTHLY_REVIEW, TRAINING_BLOCK, MATCH_BLOCK, TRIAL
  notes?: string;
  values: Array<{
    metricDefinition: {
      key: string;
      displayName: string;
      category: string; // TECHNICAL, PHYSICAL, MENTAL, GOALKEEPING
      definition?: string;
      isCoachOnly?: boolean;
    };
    valueNumber: number; // 0-100
    confidence?: number; // 0-100
    comment?: string;
    delta?: number; // Change from previous snapshot
  }>;
  positional: Array<{
    position: string;
    suitability: number; // 0-100
    comment?: string;
  }>;
  readiness?: {
    overall: number;
    technical: number;
    physical: number;
    mental: number;
    attitude: number;
    tacticalFit: number;
    explanationJson: {
      topStrengths?: string[];
      topRisks?: string[];
      recommendedFocus?: string[];
      ruleTriggers?: string[];
    };
  };
}
```

## Features Implemented

### ✅ Completed

1. **Core UI Components**
   - MetricBarRow with value bars, deltas, tooltips
   - MetricPanel with collapsible sections and search
   - ReadinessCard with breakdown and explanation
   - PositionSuitabilityGrid
   - PlayerHeaderCard

2. **Player Profile Page**
   - Tab navigation (Overview, Attributes, Development, Notes, Edit)
   - Overview tab with readiness, strengths, focus areas, position suitability
   - Attributes tab with grouped metrics by category
   - Role-based access control (students see read-only, coaches/admins can edit)

3. **API Integration**
   - Fetches latest snapshot
   - Fetches snapshot history
   - Handles missing data gracefully

### 🚧 In Progress / To Do

1. **Development Tab**
   - Metric timeline charts
   - Snapshot comparison view
   - Historical trend visualization

2. **Notes & Feedback Tab**
   - Coach notes list with tags
   - Add note functionality
   - Export note summary

3. **Snapshot Editor (Edit Tab)**
   - Stepper form for creating snapshots
   - Context selection (Monthly/Training Block/Match Block/Trial)
   - Metric editing grouped by category
   - Positional suitability editing
   - Traits editing
   - Diff preview before saving
   - Validation and confidence levels

4. **Readiness Calculation**
   - Position-aware weights
   - Minimum gates (discipline, injury resilience, etc.)
   - Trend boost/penalty
   - Enhanced explanations

5. **Workflow System**
   - Batch review mode
   - Update cadences (Monthly, Training Block, Match Block, Trial)
   - Coach checklist for scoring consistency
   - Team/cohort normalization

## Usage

### Accessing Player Profile

For admins/coaches:
```
/realverse/players/:id/profile
```

For students (own profile):
```
/realverse/my-profile
```

### Creating a Snapshot

1. Navigate to player profile
2. Click "Create Snapshot" tab (coach/admin only)
3. Fill out stepper form:
   - Step 1: Select context and add general notes
   - Step 2: Edit metrics grouped by category
   - Step 3: Edit positional suitability
   - Step 4: Edit traits and review changes
4. Save creates new snapshot and computes readiness

## Design Principles

1. **Data Rich but Calm**
   - Dark background with readable panels
   - Subtle animations
   - Consistent spacing and typography

2. **Explainable**
   - Readiness scores have "Why?" explanations
   - Rule triggers are human-readable
   - Deltas show change over time

3. **Role-Based**
   - Students see read-only view
   - Coaches/admins can edit
   - Coach-only metrics hidden from students

4. **Reusable Components**
   - All components designed for reuse across pages
   - Consistent styling via design tokens
   - Accessible and keyboard-navigable

## Next Steps

1. Complete SnapshotEditor component
2. Implement readiness calculation with gates and weights
3. Build timeline and comparison views
4. Add batch review workflow
5. Create coach scoring guide UI
6. Add export functionality (PDF notes, CSV metrics)


