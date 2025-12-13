# Player Metrics System

A Football Manager-inspired player rating and assessment system for FC Real Bengaluru's RealVerse ERP.

## Overview

This system allows coaches and admins to:
- Create time-series snapshots of player metrics (technical, physical, mental, attitude, goalkeeping)
- Track positional suitability across different positions
- Record coach-assessed traits (attitude/personality)
- Generate derived insights (readiness index) with explainable rules
- Maintain full audit trail of all changes
- Store qualitative coach notes tied to snapshots

Players can:
- View their own metrics (excluding coach-only traits)
- See their readiness index and positional suitability
- View coach notes marked as visible
- Track their progress over time

## Database Schema

### Prisma Models (PostgreSQL)

1. **PlayerMetricDefinition** - Catalog of all available metrics
2. **PlayerMetricSnapshot** - Time-series snapshots of player assessments
3. **PlayerMetricValue** - Individual metric values within a snapshot
4. **PlayerPositionalSuitability** - Position suitability ratings per snapshot
5. **PlayerTraitSnapshot** - Coach-assessed attitude/personality traits
6. **PlayerMetricAuditLog** - Change tracking and audit trail
7. **PlayerCoachNote** - Qualitative notes from coaches
8. **PlayerReadinessIndex** - Computed readiness scores with explanations

### Mongoose Schemas (MongoDB Alternative)

See `mongoose-schemas.example.ts` for MongoDB implementation using embedded documents.

## Setup

### 1. Run Migration

```bash
cd backend
npx prisma migrate dev --name add_player_metrics
npx prisma generate
```

### 2. Seed Metric Definitions

```bash
ts-node prisma/seed-metrics.ts
```

This seeds 49 metric definitions across 5 categories:
- **Technical** (14 metrics): first_touch, passing, dribbling, shooting, etc.
- **Physical** (9 metrics): acceleration, speed, stamina, strength, etc.
- **Mental** (10 metrics): vision, composure, decisions, positioning, etc.
- **Attitude** (8 metrics): work_rate, determination, professionalism, etc. (coach-only)
- **Goalkeeping** (8 metrics): handling, reflexes, one_on_ones, etc.

## Usage

### Creating a Snapshot

```typescript
import { createPlayerMetricSnapshot } from './metrics.service';
import { MetricSourceContext, Role } from '@prisma/client';

const snapshot = await createPlayerMetricSnapshot({
  studentId: 1,
  createdByUserId: 1, // Coach/Admin ID
  createdByRole: Role.COACH,
  sourceContext: MetricSourceContext.TRAINING_BLOCK,
  seasonId: '2024-25',
  notes: 'Post-training block assessment',
  values: [
    { metricKey: 'first_touch', value: 75, confidence: 85 },
    { metricKey: 'passing', value: 70, confidence: 80 },
    // ... more metrics
  ],
  positional: [
    { position: 'CM', suitability: 75, comment: 'Natural position' },
    { position: 'AM', suitability: 70 },
  ],
  traits: [
    { traitKey: 'work_rate', value: 85, comment: 'Excellent' },
  ],
});
```

### Querying Snapshots

```typescript
import {
  getLatestPlayerSnapshot,
  getPlayerMetricTimeline,
  getPlayerSnapshots,
  getPositionalSuitabilityLatest,
} from './metrics.service';

// Get latest snapshot
const latest = await getLatestPlayerSnapshot(studentId);

// Get timeline for a specific metric
const timeline = await getPlayerMetricTimeline(studentId, 'first_touch', 20);

// Get all snapshots with filtering
const snapshots = await getPlayerSnapshots(studentId, {
  limit: 10,
  sourceContext: MetricSourceContext.TRAINING_BLOCK,
});

// Get positional suitability
const positional = await getPositionalSuitabilityLatest(studentId);
```

### Access Control

```typescript
import { canPlayerViewMetric } from './metrics.service';

// Check if player can view a metric
const canView = await canPlayerViewMetric(studentId, 'work_rate', Role.STUDENT);
// Returns false for coach-only metrics when viewed by students
```

## Readiness Index

The readiness index is automatically computed when creating a snapshot. It includes:

- **Overall** (0-100): Composite score
- **Technical** (0-100): Average of technical metrics
- **Physical** (0-100): Average of physical metrics
- **Mental** (0-100): Average of mental metrics
- **Attitude** (0-100): Average of attitude traits
- **Tactical Fit** (0-100): Simplified calculation based on technical + mental

**Explanation Object:**
- `topStrengths`: Top 3 metrics by value
- `topRisks`: Bottom 3 metrics by value
- `recommendedFocus`: Areas needing improvement
- `ruleTriggers`: Rule-based insights (e.g., "HIGH_READINESS", "PHYSICAL_CONCERN")

## Audit Trail

Every snapshot creation automatically generates an audit log entry:
- Tracks which metrics changed
- Records old vs new values
- Links to previous snapshot
- Includes summary of changes

```typescript
import { getPlayerAuditLog } from './metrics.service';

const auditLog = await getPlayerAuditLog(studentId, 20);
```

## Coach Notes

Qualitative notes can be added and linked to snapshots:

```typescript
// Create a note (via Prisma directly)
await prisma.playerCoachNote.create({
  data: {
    studentId: 1,
    authorUserId: 1,
    authorRole: Role.COACH,
    title: 'Training Progress',
    body: 'Player has shown significant improvement...',
    tags: ['progress', 'training'],
    relatedSnapshotId: snapshotId,
    isVisibleToPlayer: true,
  },
});
```

## Validation

The service includes comprehensive validation:
- ✅ Role-based permissions (only ADMIN/COACH can create)
- ✅ Metric key existence and active status
- ✅ Value ranges (0-100, or custom min/max per metric)
- ✅ Confidence ranges (0-100)
- ✅ Trait validation (must be ATTITUDE category)
- ✅ Student existence check

## Example Payloads

See `example-payloads.ts` for complete examples of:
- Training block snapshot
- Match block snapshot
- Trial player snapshot
- Query patterns

## API Endpoints (To Be Implemented)

Recommended endpoints:

```
POST   /api/player-metrics/snapshots
GET    /api/player-metrics/snapshots/:studentId
GET    /api/player-metrics/snapshots/:studentId/latest
GET    /api/player-metrics/timeline/:studentId/:metricKey
GET    /api/player-metrics/positional/:studentId
GET    /api/player-metrics/audit/:studentId
POST   /api/player-metrics/notes
GET    /api/player-metrics/notes/:studentId
GET    /api/player-metrics/definitions
```

## Future Enhancements

The schema is designed to support:
- GPS data integration (add to `PlayerMetricSnapshot` or separate table)
- Event data (passes, shots, tackles) - can be linked via `relatedSnapshotId` or separate table
- Machine learning predictions (add prediction fields to `PlayerReadinessIndex`)
- Multi-coach assessments (already supported via `createdByUserId`)

## Notes

- All numeric values use 0-100 scale internally
- Coach-only metrics (`isCoachOnly: true`) are hidden from players
- Snapshots are immutable (time-series approach)
- Readiness index is computed and stored for fast reads, but can be recalculated
- Audit logs preserve full history of changes



