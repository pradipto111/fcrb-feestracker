/**
 * Example Payloads and Query Patterns
 * 
 * This file contains example payloads for creating snapshots and query patterns
 * for common use cases. Use these as references when implementing the API endpoints.
 */

import {
  CreateSnapshotPayload,
  MetricValueInput,
  PositionalSuitabilityInput,
  TraitInput,
} from './metrics.service';
import { MetricSourceContext, PlayerPosition, Role } from '@prisma/client';

// ============================================
// EXAMPLE PAYLOADS
// ============================================

/**
 * Example: Create a snapshot after a training block
 */
export const exampleTrainingBlockSnapshot: CreateSnapshotPayload = {
  studentId: 1, // Replace with actual student ID
  createdByUserId: 1, // Coach/Admin ID
  createdByRole: 'COACH' as Role,
  sourceContext: 'TRAINING_BLOCK' as MetricSourceContext,
  seasonId: '2024-25',
  notes: 'Post-training block assessment after 4 weeks of intensive work',
  values: [
    { metricKey: 'first_touch', value: 75, confidence: 85, comment: 'Improved significantly' },
    { metricKey: 'passing', value: 70, confidence: 80 },
    { metricKey: 'dribbling', value: 65, confidence: 75 },
    { metricKey: 'shooting', value: 68, confidence: 70 },
    { metricKey: 'tackling', value: 72, confidence: 80 },
    { metricKey: 'acceleration', value: 80, confidence: 90 },
    { metricKey: 'sprint_speed', value: 78, confidence: 85 },
    { metricKey: 'stamina', value: 70, confidence: 75 },
    { metricKey: 'vision', value: 65, confidence: 70 },
    { metricKey: 'decisions', value: 68, confidence: 75 },
    { metricKey: 'positioning', value: 70, confidence: 80 },
  ] as MetricValueInput[],
  positional: [
    { position: 'CM' as PlayerPosition, suitability: 75, comment: 'Natural position' },
    { position: 'AM' as PlayerPosition, suitability: 70, comment: 'Can play here' },
    { position: 'DM' as PlayerPosition, suitability: 65, comment: 'Needs work' },
    { position: 'W' as PlayerPosition, suitability: 60, comment: 'Not ideal' },
  ] as PositionalSuitabilityInput[],
  traits: [
    { traitKey: 'work_rate', value: 85, comment: 'Excellent work ethic' },
    { traitKey: 'determination', value: 80 },
    { traitKey: 'coachability', value: 90, comment: 'Very receptive to feedback' },
  ] as TraitInput[],
};

/**
 * Example: Create a snapshot after a match
 */
export const exampleMatchBlockSnapshot: CreateSnapshotPayload = {
  studentId: 1,
  createdByUserId: 1,
  createdByRole: 'COACH' as Role,
  sourceContext: 'MATCH_BLOCK' as MetricSourceContext,
  seasonId: '2024-25',
  notes: 'Assessment after 3 matches in league competition',
  values: [
    { metricKey: 'first_touch', value: 72, confidence: 80 },
    { metricKey: 'passing', value: 68, confidence: 75 },
    { metricKey: 'composure', value: 70, confidence: 75 },
    { metricKey: 'decisions', value: 65, confidence: 70, comment: 'Needs improvement under pressure' },
    { metricKey: 'stamina', value: 75, confidence: 80 },
    { metricKey: 'teamwork', value: 80, confidence: 85 },
  ] as MetricValueInput[],
  positional: [
    { position: 'CM' as PlayerPosition, suitability: 73 },
  ] as PositionalSuitabilityInput[],
  traits: [
    { traitKey: 'work_rate', value: 82 },
    { traitKey: 'pressure_handling', value: 70, comment: 'Can improve' },
  ] as TraitInput[],
};

/**
 * Example: Create a snapshot for a trial player
 */
export const exampleTrialSnapshot: CreateSnapshotPayload = {
  studentId: 1,
  createdByUserId: 1,
  createdByRole: 'COACH' as Role,
  sourceContext: 'TRIAL' as MetricSourceContext,
  notes: 'Initial assessment during trial period',
  values: [
    { metricKey: 'first_touch', value: 60, confidence: 60 },
    { metricKey: 'passing', value: 55, confidence: 55 },
    { metricKey: 'dribbling', value: 65, confidence: 70 },
    { metricKey: 'acceleration', value: 70, confidence: 75 },
    { metricKey: 'stamina', value: 65, confidence: 70 },
  ] as MetricValueInput[],
  positional: [
    { position: 'W' as PlayerPosition, suitability: 65 },
  ] as PositionalSuitabilityInput[],
  traits: [
    { traitKey: 'work_rate', value: 75 },
    { traitKey: 'coachability', value: 70 },
  ] as TraitInput[],
};

// ============================================
// EXAMPLE QUERY PATTERNS
// ============================================

/**
 * Example: Get latest snapshot for a player
 * 
 * Usage:
 * const snapshot = await getLatestPlayerSnapshot(studentId);
 * console.log('Overall readiness:', snapshot?.readiness?.overall);
 * console.log('Technical score:', snapshot?.readiness?.technical);
 */
export const exampleGetLatestSnapshot = `
import { getLatestPlayerSnapshot } from './metrics.service';

const studentId = 1;
const snapshot = await getLatestPlayerSnapshot(studentId);

if (snapshot) {
  console.log('Snapshot Date:', snapshot.createdAt);
  console.log('Created by:', snapshot.createdBy.fullName);
  console.log('Overall Readiness:', snapshot.readiness?.overall);
  console.log('Values:', snapshot.values.map(v => ({
    metric: v.metricDefinition.displayName,
    value: v.valueNumber,
  })));
}
`;

/**
 * Example: Get timeline for a specific metric
 * 
 * Usage:
 * const timeline = await getPlayerMetricTimeline(studentId, 'first_touch', 20);
 */
export const exampleGetTimeline = `
import { getPlayerMetricTimeline } from './metrics.service';

const studentId = 1;
const metricKey = 'first_touch';
const timeline = await getPlayerMetricTimeline(studentId, metricKey, 20);

// Plot this data on a chart
timeline.forEach(point => {
  console.log(\`\${point.date}: \${point.value} (confidence: \${point.confidence})\`);
});
`;

/**
 * Example: Get all snapshots with filtering
 * 
 * Usage:
 * const snapshots = await getPlayerSnapshots(studentId, {
 *   limit: 10,
 *   sourceContext: 'TRAINING_BLOCK',
 * });
 */
export const exampleGetSnapshots = `
import { getPlayerSnapshots } from './metrics.service';
import { MetricSourceContext } from '@prisma/client';

const studentId = 1;
const snapshots = await getPlayerSnapshots(studentId, {
  limit: 10,
  offset: 0,
  sourceContext: MetricSourceContext.TRAINING_BLOCK,
});

snapshots.forEach(snapshot => {
  console.log(\`\${snapshot.createdAt}: \${snapshot.readiness?.overall} overall\`);
});
`;

/**
 * Example: Get positional suitability
 * 
 * Usage:
 * const positional = await getPositionalSuitabilityLatest(studentId);
 */
export const exampleGetPositional = `
import { getPositionalSuitabilityLatest } from './metrics.service';

const studentId = 1;
const positional = await getPositionalSuitabilityLatest(studentId);

if (positional) {
  positional.forEach(pos => {
    console.log(\`\${pos.position}: \${pos.suitability}/100\`);
  });
  
  // Find best position
  const bestPosition = positional.reduce((best, current) => 
    current.suitability > best.suitability ? current : best
  );
  console.log('Best position:', bestPosition.position);
}
`;

/**
 * Example: Get audit log
 * 
 * Usage:
 * const auditLog = await getPlayerAuditLog(studentId, 20);
 */
export const exampleGetAuditLog = `
import { getPlayerAuditLog } from './metrics.service';

const studentId = 1;
const auditLog = await getPlayerAuditLog(studentId, 20);

auditLog.forEach(entry => {
  console.log(\`\${entry.createdAt}: \${entry.summary}\`);
  const diffs = entry.diffJson as any[];
  diffs.forEach(diff => {
    console.log(\`  \${diff.metricKey}: \${diff.oldValue} → \${diff.newValue}\`);
  });
});
`;

/**
 * Example: Check if player can view a metric
 * 
 * Usage:
 * const canView = await canPlayerViewMetric(studentId, 'work_rate', 'STUDENT');
 */
export const exampleCheckPermission = `
import { canPlayerViewMetric } from './metrics.service';
import { Role } from '@prisma/client';

const studentId = 1;
const metricKey = 'work_rate';
const viewerRole = Role.STUDENT;

const canView = await canPlayerViewMetric(studentId, metricKey, viewerRole);
if (!canView) {
  console.log('This metric is coach-only and not visible to players');
}
`;



