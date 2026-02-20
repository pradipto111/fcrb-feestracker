/**
 * Coach Calibration Service
 * 
 * Computes and manages coach scoring profiles, contextual averages, and calibration insights.
 * This service helps coaches self-correct bias and ensures consistency across centres.
 */

import { MetricCategory, PlayerPosition, Role } from '@prisma/client';
import prisma from '../../db/prisma';

export interface CoachScoringProfile {
  coachId: number;
  totalSnapshots: number;
  averageOverallScore: number;
  averageTechnicalScore: number;
  averagePhysicalScore: number;
  averageMentalScore: number;
  averageAttitudeScore: number;
  standardDeviation: number;
  percentAbove70: number;
  percentBelow40: number;
  averageConfidence: number;
  largeJumpFrequency: number;
  scoreDistribution: Record<string, number>;
  lastSnapshotDate: Date | null;
}

export interface CoachMetricStats {
  coachId: number;
  metricKey: string;
  averageScore: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  totalRatings: number;
}

export interface ContextualAverage {
  metricKey: string;
  centerId?: number;
  position?: PlayerPosition;
  ageGroup?: string;
  averageScore: number;
  sampleSize: number;
  seasonId?: string;
}

export interface CalibrationHint {
  metricKey: string;
  enteredValue: number;
  clubAverage?: number;
  centerAverage?: number;
  positionAverage?: number;
  ageGroupAverage?: number;
  percentile?: number; // 0-100: where this score sits in distribution
  isExtreme?: boolean; // True if significantly outside normal range
  suggestion?: string; // Optional gentle suggestion
}

/**
 * Compute coach scoring profile from all their snapshots
 */
export async function computeCoachScoringProfile(coachId: number): Promise<CoachScoringProfile | null> {
  try {
    // Get all snapshots by this coach
    const snapshots = await prisma.playerMetricSnapshot.findMany({
      where: { createdByUserId: coachId },
      include: {
        values: {
          include: { metricDefinition: true },
        },
        readiness: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (snapshots.length === 0) {
      return null;
    }

    // Compute overall averages
    const allScores: number[] = [];
    const technicalScores: number[] = [];
    const physicalScores: number[] = [];
    const mentalScores: number[] = [];
    const attitudeScores: number[] = [];
    const confidenceScores: number[] = [];
    let above70Count = 0;
    let below40Count = 0;
    let largeJumpCount = 0;

    // Score distribution buckets
    const distribution: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    for (const snapshot of snapshots) {
      // Get readiness scores if available
      if (snapshot.readiness) {
        const overall = snapshot.readiness.overall;
        allScores.push(overall);
        
        // Bucket distribution
        if (overall <= 20) distribution['0-20']++;
        else if (overall <= 40) distribution['21-40']++;
        else if (overall <= 60) distribution['41-60']++;
        else if (overall <= 80) distribution['61-80']++;
        else distribution['81-100']++;

        if (overall >= 70) above70Count++;
        if (overall <= 40) below40Count++;

        technicalScores.push(snapshot.readiness.technical);
        physicalScores.push(snapshot.readiness.physical);
        mentalScores.push(snapshot.readiness.mental);
        attitudeScores.push(snapshot.readiness.attitude);
      }

      // Collect confidence scores
      snapshot.values.forEach((v) => {
        if (v.confidence !== null) {
          confidenceScores.push(v.confidence);
        }
      });

      // Check for large jumps (compare with previous snapshot)
      if (snapshots.indexOf(snapshot) > 0) {
        const prevSnapshot = snapshots[snapshots.indexOf(snapshot) - 1];
        if (prevSnapshot.readiness && snapshot.readiness) {
          const jump = Math.abs(snapshot.readiness.overall - prevSnapshot.readiness.overall);
          if (jump > 12) largeJumpCount++;
        }
      }
    }

    // Compute statistics
    const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const stdDev = (arr: number[], avg: number) => {
      if (arr.length === 0) return 0;
      const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
      return Math.sqrt(variance);
    };

    const avgOverall = average(allScores);
    const avgTechnical = average(technicalScores);
    const avgPhysical = average(physicalScores);
    const avgMental = average(mentalScores);
    const avgAttitude = average(attitudeScores);
    const avgConfidence = average(confidenceScores);
    const stdDevOverall = stdDev(allScores, avgOverall);

    const profile: CoachScoringProfile = {
      coachId,
      totalSnapshots: snapshots.length,
      averageOverallScore: avgOverall,
      averageTechnicalScore: avgTechnical,
      averagePhysicalScore: avgPhysical,
      averageMentalScore: avgMental,
      averageAttitudeScore: avgAttitude,
      standardDeviation: stdDevOverall,
      percentAbove70: (above70Count / snapshots.length) * 100,
      percentBelow40: (below40Count / snapshots.length) * 100,
      averageConfidence: avgConfidence,
      largeJumpFrequency: (largeJumpCount / Math.max(1, snapshots.length - 1)) * 100,
      scoreDistribution: distribution,
      lastSnapshotDate: snapshots[0]?.createdAt || null,
    };

    // Cache in database (upsert)
    await prisma.$executeRaw`
      INSERT INTO "CoachScoringProfile" (
        "coachId", "totalSnapshots", "averageOverallScore", "averageTechnicalScore",
        "averagePhysicalScore", "averageMentalScore", "averageAttitudeScore",
        "standardDeviation", "percentAbove70", "percentBelow40", "averageConfidence",
        "largeJumpFrequency", "scoreDistribution", "lastSnapshotDate", "computedAt"
      ) VALUES (
        ${coachId}, ${profile.totalSnapshots}, ${profile.averageOverallScore}, ${profile.averageTechnicalScore},
        ${profile.averagePhysicalScore}, ${profile.averageMentalScore}, ${profile.averageAttitudeScore},
        ${profile.standardDeviation}, ${profile.percentAbove70}, ${profile.percentBelow40}, ${profile.averageConfidence},
        ${profile.largeJumpFrequency}, ${JSON.stringify(profile.scoreDistribution)}::jsonb, ${profile.lastSnapshotDate}, NOW()
      )
      ON CONFLICT ("coachId") DO UPDATE SET
        "totalSnapshots" = EXCLUDED."totalSnapshots",
        "averageOverallScore" = EXCLUDED."averageOverallScore",
        "averageTechnicalScore" = EXCLUDED."averageTechnicalScore",
        "averagePhysicalScore" = EXCLUDED."averagePhysicalScore",
        "averageMentalScore" = EXCLUDED."averageMentalScore",
        "averageAttitudeScore" = EXCLUDED."averageAttitudeScore",
        "standardDeviation" = EXCLUDED."standardDeviation",
        "percentAbove70" = EXCLUDED."percentAbove70",
        "percentBelow40" = EXCLUDED."percentBelow40",
        "averageConfidence" = EXCLUDED."averageConfidence",
        "largeJumpFrequency" = EXCLUDED."largeJumpFrequency",
        "scoreDistribution" = EXCLUDED."scoreDistribution",
        "lastSnapshotDate" = EXCLUDED."lastSnapshotDate",
        "computedAt" = NOW()
    `;

    return profile;
  } catch (error) {
    console.error('Error computing coach scoring profile:', error);
    throw error;
  }
}

/**
 * Get contextual averages for a metric (club-wide, centre, position, age group)
 */
export async function getContextualAverages(
  metricKey: string,
  filters?: {
    centerId?: number;
    position?: PlayerPosition;
    ageGroup?: string;
    seasonId?: string;
  }
): Promise<ContextualAverage[]> {
  try {
    // Build query to get all relevant metric values
    const whereClause: any = {
      metricDefinition: { key: metricKey },
    };

    const snapshots = await prisma.playerMetricSnapshot.findMany({
      where: {
        ...(filters?.centerId && {
          student: { centerId: filters.centerId },
        }),
        ...(filters?.position && {
          positional: { some: { position: filters.position } },
        }),
        ...(filters?.seasonId && { seasonId: filters.seasonId }),
      },
      include: {
        values: {
          where: { metricDefinition: { key: metricKey } },
          include: { metricDefinition: true },
        },
        student: {
          include: { center: true },
        },
        positional: true,
      },
    });

    // Compute averages
    const averages: ContextualAverage[] = [];

    // Club-wide average
    const allValues = snapshots.flatMap((s) => s.values.map((v) => v.valueNumber));
    if (allValues.length > 0) {
      const clubAvg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      averages.push({
        metricKey,
        averageScore: clubAvg,
        sampleSize: allValues.length,
      });
    }

    // Centre-specific averages
    if (filters?.centerId) {
      const centerValues = snapshots
        .filter((s) => s.student.centerId === filters.centerId)
        .flatMap((s) => s.values.map((v) => v.valueNumber));
      if (centerValues.length > 0) {
        const centerAvg = centerValues.reduce((a, b) => a + b, 0) / centerValues.length;
        averages.push({
          metricKey,
          centerId: filters.centerId,
          averageScore: centerAvg,
          sampleSize: centerValues.length,
        });
      }
    }

    // Position-specific averages
    if (filters?.position) {
      const positionSnapshots = snapshots.filter((s) =>
        s.positional.some((p) => p.position === filters.position)
      );
      const positionValues = positionSnapshots.flatMap((s) => s.values.map((v) => v.valueNumber));
      if (positionValues.length > 0) {
        const positionAvg = positionValues.reduce((a, b) => a + b, 0) / positionValues.length;
        averages.push({
          metricKey,
          position: filters.position,
          averageScore: positionAvg,
          sampleSize: positionValues.length,
        });
      }
    }

    return averages;
  } catch (error) {
    console.error('Error getting contextual averages:', error);
    throw error;
  }
}

/**
 * Generate calibration hints for a metric value being entered
 */
export async function getCalibrationHints(
  metricKey: string,
  enteredValue: number,
  context?: {
    studentId?: number;
    centerId?: number;
    position?: PlayerPosition;
    ageGroup?: string;
  }
): Promise<CalibrationHint> {
  try {
    const averages = await getContextualAverages(metricKey, {
      centerId: context?.centerId,
      position: context?.position,
      ageGroup: context?.ageGroup,
    });

    const clubAvg = averages.find((a) => !a.centerId && !a.position)?.averageScore;
    const centerAvg = averages.find((a) => a.centerId === context?.centerId)?.averageScore;
    const positionAvg = averages.find((a) => a.position === context?.position)?.averageScore;

    // Determine if value is extreme (more than 2 standard deviations from club average)
    let isExtreme = false;
    let percentile: number | undefined;
    let suggestion: string | undefined;

    if (clubAvg !== undefined) {
      // Get all values for this metric to compute percentile
      const allSnapshots = await prisma.playerMetricSnapshot.findMany({
        include: {
          values: {
            where: { metricDefinition: { key: metricKey } },
          },
        },
      });
      const allValues = allSnapshots.flatMap((s) => s.values.map((v) => v.valueNumber)).sort((a, b) => a - b);
      
      if (allValues.length > 0) {
        const belowCount = allValues.filter((v) => v < enteredValue).length;
        percentile = (belowCount / allValues.length) * 100;

        // Check if extreme (top 5% or bottom 5%)
        isExtreme = percentile >= 95 || percentile <= 5;

        if (isExtreme && percentile >= 95) {
          suggestion = 'This score is in the top 5% for this metric. Consider adding a note to explain the rating.';
        } else if (isExtreme && percentile <= 5) {
          suggestion = 'This score is in the bottom 5% for this metric. Consider adding a note to explain the rating.';
        }
      }
    }

    return {
      metricKey,
      enteredValue,
      clubAverage: clubAvg,
      centerAverage: centerAvg,
      positionAverage: positionAvg,
      percentile,
      isExtreme,
      suggestion,
    };
  } catch (error) {
    console.error('Error getting calibration hints:', error);
    return {
      metricKey,
      enteredValue,
    };
  }
}

/**
 * Get coach scoring profile (cached or compute on demand)
 */
export async function getCoachScoringProfile(coachId: number, forceRefresh = false): Promise<CoachScoringProfile | null> {
  try {
    if (forceRefresh) {
      return await computeCoachScoringProfile(coachId);
    }

    // Try to get cached profile
    const cached = await prisma.$queryRaw<Array<{
      coachId: number;
      totalSnapshots: number;
      averageOverallScore: number;
      averageTechnicalScore: number;
      averagePhysicalScore: number;
      averageMentalScore: number;
      averageAttitudeScore: number;
      standardDeviation: number;
      percentAbove70: number;
      percentBelow40: number;
      averageConfidence: number;
      largeJumpFrequency: number;
      scoreDistribution: any;
      lastSnapshotDate: Date | null;
    }>>`
      SELECT * FROM "CoachScoringProfile" WHERE "coachId" = ${coachId} LIMIT 1
    `;

    if (cached.length > 0) {
      const profile = cached[0];
      return {
        coachId: profile.coachId,
        totalSnapshots: profile.totalSnapshots,
        averageOverallScore: profile.averageOverallScore || 0,
        averageTechnicalScore: profile.averageTechnicalScore || 0,
        averagePhysicalScore: profile.averagePhysicalScore || 0,
        averageMentalScore: profile.averageMentalScore || 0,
        averageAttitudeScore: profile.averageAttitudeScore || 0,
        standardDeviation: profile.standardDeviation || 0,
        percentAbove70: profile.percentAbove70 || 0,
        percentBelow40: profile.percentBelow40 || 0,
        averageConfidence: profile.averageConfidence || 0,
        largeJumpFrequency: profile.largeJumpFrequency || 0,
        scoreDistribution: profile.scoreDistribution || {},
        lastSnapshotDate: profile.lastSnapshotDate,
      };
    }

    // Compute if not cached
    return await computeCoachScoringProfile(coachId);
  } catch (error) {
    console.error('Error getting coach scoring profile:', error);
    return null;
  }
}

/**
 * Get all coaches' profiles for comparison (admin only)
 */
export async function getAllCoachProfiles(): Promise<Array<CoachScoringProfile & { coachName: string }>> {
  try {
    const profiles = await prisma.$queryRaw<Array<{
      coachId: number;
      totalSnapshots: number;
      averageOverallScore: number;
      averageTechnicalScore: number;
      averagePhysicalScore: number;
      averageMentalScore: number;
      averageAttitudeScore: number;
      standardDeviation: number;
      percentAbove70: number;
      percentBelow40: number;
      averageConfidence: number;
      largeJumpFrequency: number;
      scoreDistribution: any;
      lastSnapshotDate: Date | null;
    }>>`
      SELECT csp.*, c."fullName" as "coachName"
      FROM "CoachScoringProfile" csp
      JOIN "Coach" c ON c.id = csp."coachId"
      ORDER BY csp."computedAt" DESC
    `;

    return profiles.map((p) => ({
      coachId: p.coachId,
      totalSnapshots: p.totalSnapshots,
      averageOverallScore: p.averageOverallScore || 0,
      averageTechnicalScore: p.averageTechnicalScore || 0,
      averagePhysicalScore: p.averagePhysicalScore || 0,
      averageMentalScore: p.averageMentalScore || 0,
      averageAttitudeScore: p.averageAttitudeScore || 0,
      standardDeviation: p.standardDeviation || 0,
      percentAbove70: p.percentAbove70 || 0,
      percentBelow40: p.percentBelow40 || 0,
      averageConfidence: p.averageConfidence || 0,
      largeJumpFrequency: p.largeJumpFrequency || 0,
      scoreDistribution: p.scoreDistribution || {},
      lastSnapshotDate: p.lastSnapshotDate,
      coachName: (p as any).coachName || 'Unknown',
    }));
  } catch (error) {
    console.error('Error getting all coach profiles:', error);
    return [];
  }
}

/**
 * Multi-Coach Consensus View
 * 
 * For players rated by multiple coaches, show:
 * - Average rating per metric
 * - Range (min-max)
 * - Coach-wise breakdown (anonymized by default)
 */
export interface MetricConsensus {
  metricKey: string;
  metricDisplayName: string;
  category: string;
  averageRating: number;
  minRating: number;
  maxRating: number;
  ratingCount: number;
  coachRatings: Array<{
    coachId: number;
    coachName?: string; // Only if not anonymized
    rating: number;
    confidence?: number;
    createdAt: Date;
  }>;
  standardDeviation: number;
}

export interface PlayerConsensus {
  studentId: number;
  studentName: string;
  totalSnapshots: number;
  uniqueCoaches: number;
  metrics: MetricConsensus[];
  overallReadiness?: {
    average: number;
    min: number;
    max: number;
    coachReadiness: Array<{
      coachId: number;
      coachName?: string;
      overall: number;
      createdAt: Date;
    }>;
  };
}

/**
 * Get multi-coach consensus for a specific player
 */
export async function getPlayerConsensus(
  studentId: number,
  options?: {
    anonymize?: boolean; // Default: true (admin can see names)
    includeInactive?: boolean;
  }
): Promise<PlayerConsensus | null> {
  try {
    const anonymize = options?.anonymize !== false; // Default to true

    // Get all snapshots for this player
    const snapshots = await prisma.playerMetricSnapshot.findMany({
      where: {
        studentId,
        ...(options?.includeInactive ? {} : {
          student: { status: 'ACTIVE' },
        }),
      },
      include: {
        values: {
          include: { metricDefinition: true },
        },
        readiness: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (snapshots.length === 0) {
      return null;
    }

    // Get unique coaches
    const uniqueCoachIds = [...new Set(snapshots.map(s => s.createdByUserId))];
    const uniqueCoaches = uniqueCoachIds.length;

    // Group metrics by key
    const metricMap = new Map<string, {
      metricKey: string;
      metricDisplayName: string;
      category: string;
      ratings: Array<{
        coachId: number;
        coachName?: string;
        rating: number;
        confidence?: number;
        createdAt: Date;
      }>;
    }>();

    for (const snapshot of snapshots) {
      for (const value of snapshot.values) {
        const key = value.metricDefinition.key;
        if (!metricMap.has(key)) {
          metricMap.set(key, {
            metricKey: key,
            metricDisplayName: value.metricDefinition.displayName,
            category: value.metricDefinition.category,
            ratings: [],
          });
        }

        const entry = metricMap.get(key)!;
        entry.ratings.push({
          coachId: snapshot.createdByUserId,
          coachName: anonymize ? undefined : snapshot.createdBy.fullName,
          rating: value.valueNumber,
          confidence: value.confidence || undefined,
          createdAt: snapshot.createdAt,
        });
      }
    }

    // Compute consensus for each metric
    const metrics: MetricConsensus[] = Array.from(metricMap.values()).map(entry => {
      const ratings = entry.ratings.map(r => r.rating);
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const min = Math.min(...ratings);
      const max = Math.max(...ratings);
      
      // Standard deviation
      const variance = ratings.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / ratings.length;
      const stdDev = Math.sqrt(variance);

      return {
        metricKey: entry.metricKey,
        metricDisplayName: entry.metricDisplayName,
        category: entry.category,
        averageRating: average,
        minRating: min,
        maxRating: max,
        ratingCount: ratings.length,
        coachRatings: entry.ratings,
        standardDeviation: stdDev,
      };
    });

    // Compute overall readiness consensus
    const readinessSnapshots = snapshots.filter(s => s.readiness);
    let overallReadiness: PlayerConsensus['overallReadiness'] | undefined;

    if (readinessSnapshots.length > 0) {
      const readinessValues = readinessSnapshots.map(s => s.readiness!.overall);
      const avgReadiness = readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length;
      const minReadiness = Math.min(...readinessValues);
      const maxReadiness = Math.max(...readinessValues);

      overallReadiness = {
        average: avgReadiness,
        min: minReadiness,
        max: maxReadiness,
        coachReadiness: readinessSnapshots.map(s => ({
          coachId: s.createdByUserId,
          coachName: anonymize ? undefined : s.createdBy.fullName,
          overall: s.readiness!.overall,
          createdAt: s.createdAt,
        })),
      };
    }

    return {
      studentId,
      studentName: snapshots[0].student.fullName,
      totalSnapshots: snapshots.length,
      uniqueCoaches,
      metrics,
      overallReadiness,
    };
  } catch (error) {
    console.error('Error getting player consensus:', error);
    throw error;
  }
}

/**
 * Get all players with multi-coach ratings (admin tool)
 */
export async function getMultiCoachPlayers(options?: {
  minCoaches?: number; // Minimum number of coaches who rated
  anonymize?: boolean;
}): Promise<Array<{
  studentId: number;
  studentName: string;
  uniqueCoaches: number;
  totalSnapshots: number;
  latestSnapshotDate: Date;
}>> {
  try {
    const minCoaches = options?.minCoaches || 2;

    // Get all students with multiple snapshots from different coaches
    const students = await prisma.$queryRaw<Array<{
      studentId: number;
      studentName: string;
      uniqueCoaches: bigint;
      totalSnapshots: bigint;
      latestSnapshotDate: Date;
    }>>`
      SELECT 
        s.id as "studentId",
        s."fullName" as "studentName",
        COUNT(DISTINCT pms."createdByUserId") as "uniqueCoaches",
        COUNT(pms.id) as "totalSnapshots",
        MAX(pms."createdAt") as "latestSnapshotDate"
      FROM "Student" s
      INNER JOIN "PlayerMetricSnapshot" pms ON s.id = pms."studentId"
      WHERE s."isActive" = true
      GROUP BY s.id, s."fullName"
      HAVING COUNT(DISTINCT pms."createdByUserId") >= ${minCoaches}
      ORDER BY "latestSnapshotDate" DESC
    `;

    return students.map(s => ({
      studentId: s.studentId,
      studentName: s.studentName,
      uniqueCoaches: Number(s.uniqueCoaches),
      totalSnapshots: Number(s.totalSnapshots),
      latestSnapshotDate: s.latestSnapshotDate,
    }));
  } catch (error) {
    console.error('Error getting multi-coach players:', error);
    return [];
  }
}

