/**
 * Player Metrics Service
 * 
 * Service functions for creating, reading, and managing player metric snapshots.
 * Implements Football Manager-style player rating system with time-series tracking.
 */

import { Role, MetricCategory, PlayerPosition, MetricSourceContext } from '@prisma/client';
import prisma from '../../db/prisma';

// ============================================
// TYPES
// ============================================

export interface MetricValueInput {
  metricKey: string; // e.g., "first_touch"
  value: number; // 0-100
  confidence?: number; // 0-100
  comment?: string;
}

export interface PositionalSuitabilityInput {
  position: PlayerPosition;
  suitability: number; // 0-100
  comment?: string;
}

export interface TraitInput {
  traitKey: string; // e.g., "work_rate"
  value: number; // 0-100
  comment?: string;
}

export interface CreateSnapshotPayload {
  studentId: number;
  createdByUserId: number;
  createdByRole: Role;
  sourceContext: MetricSourceContext;
  seasonId?: string;
  notes?: string;
  values: MetricValueInput[];
  positional: PositionalSuitabilityInput[];
  traits: TraitInput[];
}

export interface ReadinessIndex {
  overall: number;
  technical: number;
  physical: number;
  mental: number;
  attitude: number;
  tacticalFit: number;
  explanation: {
    topStrengths: string[];
    topRisks: string[];
    recommendedFocus: string[];
    ruleTriggers: string[];
    calibrationAdjustment?: number;
  };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate that user has permission to create snapshots
 */
export async function validateSnapshotPermission(userId: number, userRole: Role): Promise<void> {
  if (userRole !== 'ADMIN' && userRole !== 'COACH') {
    throw new Error('Only ADMIN and COACH can create metric snapshots');
  }

  // Verify user exists
  if (userRole === 'COACH') {
    const coach = await prisma.coach.findUnique({ where: { id: userId } });
    if (!coach) {
      throw new Error('Coach not found');
    }
  } else if (userRole === 'ADMIN') {
    const coach = await prisma.coach.findUnique({ where: { id: userId, role: 'ADMIN' } });
    if (!coach) {
      throw new Error('Admin not found');
    }
  }
}

/**
 * Validate metric values are within range and keys exist
 */
export async function validateMetricValues(values: MetricValueInput[]): Promise<void> {
  // Filter out invalid values first
  const validValues = values.filter(v => 
    v && 
    v.metricKey && 
    v.value !== undefined && 
    v.value !== null && 
    !isNaN(v.value)
  );

  if (validValues.length === 0) {
    throw new Error('At least one valid metric value is required');
  }

  // Get all active metric definitions
  const definitions = await prisma.playerMetricDefinition.findMany({
    where: { isActive: true },
  });
  const definitionMap = new Map(definitions.map(d => [d.key, d]));

  for (const value of validValues) {
    const def = definitionMap.get(value.metricKey);
    if (!def) {
      throw new Error(`Metric key "${value.metricKey}" not found or inactive`);
    }

    if (value.value < def.minValue || value.value > def.maxValue) {
      throw new Error(
        `Metric "${value.metricKey}" value ${value.value} is outside range [${def.minValue}, ${def.maxValue}]`
      );
    }

    if (value.confidence !== undefined && (value.confidence < 0 || value.confidence > 100)) {
      throw new Error(`Confidence must be between 0 and 100`);
    }
  }
}

/**
 * Validate positional suitability values
 */
export function validatePositionalSuitability(positional: PositionalSuitabilityInput[]): void {
  const validPositions: PlayerPosition[] = ['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST'];
  
  for (const pos of positional) {
    if (!validPositions.includes(pos.position as PlayerPosition)) {
      throw new Error(`Invalid position: ${pos.position}. Valid positions are: ${validPositions.join(', ')}`);
    }
    if (pos.suitability < 0 || pos.suitability > 100) {
      throw new Error(`Positional suitability must be between 0 and 100`);
    }
  }
}

/**
 * Validate trait values
 */
export async function validateTraits(traits: TraitInput[]): Promise<void> {
  // Get all attitude/coach-only metric definitions
  const definitions = await prisma.playerMetricDefinition.findMany({
    where: {
      isActive: true,
      category: 'ATTITUDE',
    },
  });
  const definitionMap = new Map(definitions.map(d => [d.key, d]));

  for (const trait of traits) {
    const def = definitionMap.get(trait.traitKey);
    if (!def) {
      throw new Error(`Trait key "${trait.traitKey}" not found or not an attitude metric`);
    }

    if (trait.value < def.minValue || trait.value > def.maxValue) {
      throw new Error(
        `Trait "${trait.traitKey}" value ${trait.value} is outside range [${def.minValue}, ${def.maxValue}]`
      );
    }
  }
}

// ============================================
// SNAPSHOT CREATION
// ============================================

/**
 * Create a new player metric snapshot
 */
export async function createPlayerMetricSnapshot(payload: CreateSnapshotPayload) {
  // Validate permissions
  await validateSnapshotPermission(payload.createdByUserId, payload.createdByRole);

  // Validate student exists
  const student = await prisma.student.findUnique({ where: { id: payload.studentId } });
  if (!student) {
    throw new Error('Student not found');
  }

  // Validate inputs
  await validateMetricValues(payload.values);
  
  // Filter out invalid positions before validation
  const validPositions: PlayerPosition[] = ['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST'];
  const filteredPositional = payload.positional.filter(pos => 
    validPositions.includes(pos.position as PlayerPosition)
  );
  
  // If any positions were filtered out, log a warning
  if (filteredPositional.length < payload.positional.length) {
    const invalidPositions = payload.positional
      .filter(pos => !validPositions.includes(pos.position as PlayerPosition))
      .map(pos => pos.position);
    console.warn(`Invalid positions filtered out: ${invalidPositions.join(', ')}`);
  }
  
  validatePositionalSuitability(filteredPositional);
  
  // Only validate traits if provided and not empty
  if (payload.traits && payload.traits.length > 0) {
    await validateTraits(payload.traits);
  }
  
  // Update payload with filtered positional data
  payload.positional = filteredPositional;

  // Get previous snapshot for diff calculation
  const previousSnapshot = await prisma.playerMetricSnapshot.findFirst({
    where: { studentId: payload.studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      values: {
        include: { metricDefinition: true },
      },
    },
  });

  // Get metric definitions for value creation
  const metricDefinitions = await prisma.playerMetricDefinition.findMany({
    where: { isActive: true },
  });
  const definitionMap = new Map(metricDefinitions.map(d => [d.key, d]));

  // Calculate diff for audit log
  const diffJson: any[] = [];
  if (previousSnapshot) {
    const oldValuesMap = new Map(
      previousSnapshot.values.map(v => [v.metricDefinition.key, v.valueNumber])
    );

    for (const newVal of payload.values) {
      const oldVal = oldValuesMap.get(newVal.metricKey);
      if (oldVal !== undefined && oldVal !== newVal.value) {
        diffJson.push({
          metricKey: newVal.metricKey,
          oldValue: oldVal,
          newValue: newVal.value,
          comment: newVal.comment,
        });
      }
    }
  }

  // Compute readiness index with calibration assistance
  const readinessIndex = await computeReadinessIndex(
    payload.values, 
    payload.traits,
    payload.createdByUserId // Pass coach ID for calibration
  );

  // Create snapshot with all related data
  const snapshot = await prisma.playerMetricSnapshot.create({
    data: {
      studentId: payload.studentId,
      createdByUserId: payload.createdByUserId,
      createdByRole: payload.createdByRole,
      sourceContext: payload.sourceContext,
      ...(payload.seasonId ? { seasonId: payload.seasonId } : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
      values: {
        create: payload.values
          .filter(val => {
            // Filter out any invalid values before creating
            if (!val || !val.metricKey || val.value === undefined || val.value === null || isNaN(val.value)) {
              console.warn(`Skipping invalid metric value:`, val);
              return false;
            }
            return true;
          })
          .map(val => {
            const def = definitionMap.get(val.metricKey);
            if (!def) {
              throw new Error(`Metric definition not found: ${val.metricKey}`);
            }
            return {
              metricDefinitionId: def.id,
              valueNumber: val.value,
              // Only include optional fields if they have values
              ...(val.confidence !== undefined && val.confidence !== null ? { confidence: val.confidence } : {}),
              ...(val.comment ? { comment: val.comment } : {}),
            };
          }),
      },
      positional: {
        create: payload.positional
          .filter(pos => {
            // Validate position is in enum
            const validPositions = ['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST'];
            if (!validPositions.includes(pos.position)) {
              console.warn(`Invalid position: ${pos.position}, skipping`);
              return false;
            }
            return true;
          })
          .map(pos => ({
            position: pos.position as PlayerPosition,
            suitability: pos.suitability,
            ...(pos.comment ? { comment: pos.comment } : {}),
          })),
      },
      traits: {
        create: (payload.traits || [])
          .filter(trait => {
            // Filter out any invalid traits before creating
            if (!trait || !trait.traitKey || trait.value === undefined || trait.value === null || isNaN(trait.value)) {
              console.warn(`Skipping invalid trait:`, trait);
              return false;
            }
            return true;
          })
          .map(trait => {
            const def = definitionMap.get(trait.traitKey);
            if (!def) {
              throw new Error(`Trait definition not found: ${trait.traitKey}`);
            }
            return {
              metricDefinitionId: def.id,
              valueNumber: trait.value,
              ...(trait.comment ? { comment: trait.comment } : {}),
            };
          }),
      },
      readiness: {
        create: {
          overall: readinessIndex.overall,
          technical: readinessIndex.technical,
          physical: readinessIndex.physical,
          mental: readinessIndex.mental,
          attitude: readinessIndex.attitude,
          tacticalFit: readinessIndex.tacticalFit,
          explanationJson: readinessIndex.explanation,
        },
      },
      auditLogs: {
        create: {
          studentId: payload.studentId,
          previousSnapshotId: previousSnapshot?.id,
          changedByUserId: payload.createdByUserId,
          changedByRole: payload.createdByRole,
          diffJson,
          summary: diffJson.length > 0 ? `${diffJson.length} metrics changed` : 'Initial snapshot',
        },
      },
    },
    include: {
      values: {
        include: { metricDefinition: true },
      },
      positional: true,
      traits: {
        include: { metricDefinition: true },
      },
      readiness: true,
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return snapshot;
}

// ============================================
// READINESS INDEX COMPUTATION
// ============================================

/**
 * Compute readiness index from metric values and traits
 * Enhanced with calibration-assisted insights based on coach scoring patterns
 */
export async function computeReadinessIndex(
  values: MetricValueInput[],
  traits: TraitInput[],
  coachId?: number
): Promise<ReadinessIndex> {
  // Get all metric definitions to categorize
  const definitions = await prisma.playerMetricDefinition.findMany({
    where: { isActive: true },
  });
  const definitionMap = new Map(definitions.map(d => [d.key, d]));

  // Group values by category
  const technical: number[] = [];
  const physical: number[] = [];
  const mental: number[] = [];
  const attitude: number[] = [];

  for (const val of values) {
    const def = definitionMap.get(val.metricKey);
    if (!def) continue;

    switch (def.category) {
      case 'TECHNICAL':
        technical.push(val.value);
        break;
      case 'PHYSICAL':
        physical.push(val.value);
        break;
      case 'MENTAL':
        mental.push(val.value);
        break;
      case 'GOALKEEPING':
        // Goalkeeping can contribute to technical
        technical.push(val.value);
        break;
    }
  }

  // Add traits to attitude
  if (traits && Array.isArray(traits)) {
    for (const trait of traits) {
      attitude.push(trait.value);
    }
  }

  // Calculate averages
  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 50);

  let technicalScore = Math.round(avg(technical));
  let physicalScore = Math.round(avg(physical));
  let mentalScore = Math.round(avg(mental));
  let attitudeScore = Math.round(avg(attitude));
  const tacticalFit = Math.round((technicalScore + mentalScore) / 2); // Simplified tactical fit

  let overall = Math.round(
    (technicalScore + physicalScore + mentalScore + attitudeScore + tacticalFit) / 5
  );

  // Calibration-assisted insights: Adjust scores based on coach's scoring patterns
  let calibrationAdjustment = 0;
  let calibrationInsights: string[] = [];
  
  if (coachId) {
    try {
      // Import calibration service function
      const { getCoachScoringProfile } = await import('./calibration.service');
      const coachProfile = await getCoachScoringProfile(coachId, false);
      
      if (coachProfile && coachProfile.totalSnapshots >= 5) {
        // Only apply calibration if coach has enough data (5+ snapshots)
        const coachAverage = coachProfile.averageOverallScore;
        const coachStdDev = coachProfile.standardDeviation;
        
        // Calculate adjustment: if coach scores high on average, reduce readiness slightly
        // If coach scores low on average, increase readiness slightly
        // Adjustment is proportional to how far from neutral (57.5 = average of 0-100 range)
        const neutralScore = 57.5;
        const deviation = coachAverage - neutralScore;
        
        // Apply adjustment: max ±3 points, scaled by deviation and consistency
        // More consistent coaches (lower std dev) get less adjustment
        const consistencyFactor = Math.max(0.5, 1 - (coachStdDev / 30)); // Lower std dev = more consistent
        const adjustment = Math.round((deviation / 10) * consistencyFactor * -1); // Negative because we want to correct bias
        calibrationAdjustment = Math.max(-3, Math.min(3, adjustment));
        
        // Apply adjustment to overall score
        overall = Math.max(0, Math.min(100, overall + calibrationAdjustment));
        
        // Add calibration insights
        if (Math.abs(calibrationAdjustment) > 0) {
          if (calibrationAdjustment > 0) {
            calibrationInsights.push(
              `Calibration: Adjusted +${calibrationAdjustment} based on coach's scoring pattern (tends to score ${coachAverage.toFixed(1)} avg)`
            );
          } else {
            calibrationInsights.push(
              `Calibration: Adjusted ${calibrationAdjustment} based on coach's scoring pattern (tends to score ${coachAverage.toFixed(1)} avg)`
            );
          }
          
          if (coachStdDev < 10) {
            calibrationInsights.push('Coach shows consistent scoring patterns');
          } else if (coachStdDev > 20) {
            calibrationInsights.push('Coach shows variable scoring patterns');
          }
        }
      }
    } catch (error) {
      // Silently fail if calibration data not available - don't break readiness calculation
      console.debug('Calibration data not available for coach:', coachId);
    }
  }

  // Find top strengths and risks
  const allValues = [
    ...values.map(v => ({ key: v.metricKey, value: v.value })),
    ...(traits && Array.isArray(traits) ? traits.map(t => ({ key: t.traitKey, value: t.value })) : []),
  ];
  const sorted = [...allValues].sort((a, b) => b.value - a.value);
  const topStrengths = sorted.slice(0, 3).map(v => v.key);
  const topRisks = sorted.slice(-3).map(v => v.key);

  // Rule-based triggers
  const ruleTriggers: string[] = [];
  if (overall > 80) ruleTriggers.push('HIGH_READINESS');
  if (physicalScore < 60) ruleTriggers.push('PHYSICAL_CONCERN');
  if (attitudeScore > 90) ruleTriggers.push('EXCELLENT_ATTITUDE');
  if (mentalScore < 50) ruleTriggers.push('MENTAL_DEVELOPMENT_NEEDED');
  if (technicalScore > 85 && physicalScore > 80) ruleTriggers.push('ELITE_POTENTIAL');
  
  // Add calibration insights to rule triggers
  if (calibrationInsights.length > 0) {
    ruleTriggers.push(...calibrationInsights);
  }

  return {
    overall,
    technical: technicalScore,
    physical: physicalScore,
    mental: mentalScore,
    attitude: attitudeScore,
    tacticalFit,
    explanation: {
      topStrengths,
      topRisks,
      recommendedFocus: topRisks,
      ruleTriggers,
      calibrationAdjustment: calibrationAdjustment !== 0 ? calibrationAdjustment : undefined,
    },
  };
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get player metric timeline for a specific metric
 */
export async function getPlayerMetricTimeline(
  studentId: number,
  metricKey: string,
  limit: number = 50
) {
  const definition = await prisma.playerMetricDefinition.findUnique({
    where: { key: metricKey },
  });

  if (!definition) {
    throw new Error(`Metric key "${metricKey}" not found`);
  }

  const snapshots = await prisma.playerMetricSnapshot.findMany({
    where: {
      studentId,
      values: {
        some: {
          metricDefinitionId: definition.id,
        },
      },
    },
    include: {
      values: {
        where: {
          metricDefinitionId: definition.id,
        },
        include: {
          metricDefinition: true,
        },
      },
      readiness: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return snapshots.map(snapshot => {
    const value = snapshot.values[0];
    return {
      date: snapshot.createdAt,
      value: value?.valueNumber,
      confidence: value?.confidence,
      comment: value?.comment,
      readiness: snapshot.readiness?.overall,
      sourceContext: snapshot.sourceContext,
    };
  });
}

/**
 * Get latest player snapshot
 */
export async function getLatestPlayerSnapshot(studentId: number) {
  return await prisma.playerMetricSnapshot.findFirst({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      values: {
        include: { metricDefinition: true },
      },
      positional: true,
      traits: {
        include: { metricDefinition: true },
      },
      readiness: true,
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
}

/**
 * Get positional suitability (latest)
 */
export async function getPositionalSuitabilityLatest(studentId: number) {
  const snapshot = await getLatestPlayerSnapshot(studentId);
  if (!snapshot) {
    return null;
  }

  return snapshot.positional;
}

/**
 * Get all snapshots for a player
 */
export async function getPlayerSnapshots(
  studentId: number,
  options: {
    limit?: number;
    offset?: number;
    sourceContext?: MetricSourceContext;
  } = {}
) {
  const { limit = 50, offset = 0, sourceContext } = options;

  return await prisma.playerMetricSnapshot.findMany({
    where: {
      studentId,
      ...(sourceContext && { sourceContext }),
    },
    include: {
      values: {
        include: { metricDefinition: true },
      },
      positional: true,
      readiness: true,
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Get audit log for a player
 */
export async function getPlayerAuditLog(studentId: number, limit: number = 50) {
  return await prisma.playerMetricAuditLog.findMany({
    where: { studentId },
    include: {
      snapshot: {
        select: { id: true, createdAt: true, sourceContext: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get coach notes for a player
 */
export async function getPlayerCoachNotes(
  studentId: number,
  options: {
    includeHidden?: boolean;
    limit?: number;
  } = {}
) {
  const { includeHidden = false, limit = 50 } = options;

  return await prisma.playerCoachNote.findMany({
    where: {
      studentId,
      ...(includeHidden ? {} : { isVisibleToPlayer: true }),
    },
    include: {
      author: {
        select: { id: true, fullName: true, email: true },
      },
      relatedSnapshot: {
        select: { id: true, createdAt: true, sourceContext: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Check if player can view a specific metric (respects isCoachOnly flag)
 */
export async function canPlayerViewMetric(
  studentId: number,
  metricKey: string,
  viewerRole: Role
): Promise<boolean> {
  if (viewerRole === 'ADMIN' || viewerRole === 'COACH') {
    return true; // Coaches and admins can see everything
  }

  // Players cannot see coach-only metrics
  const definition = await prisma.playerMetricDefinition.findUnique({
    where: { key: metricKey },
  });

  if (!definition) {
    return false;
  }

  return !definition.isCoachOnly;
}


