/**
 * Scouting Board & Player Comparison Service
 * 
 * Service functions for player comparison and scouting board management
 */

import { Role, ScoutingBoardType, ScoutingDecisionState, PlayerPosition } from '@prisma/client';
import prisma from '../../db/prisma';

// ============================================
// TYPES
// ============================================

export interface ComparePlayersParams {
  playerIds: number[];
  position: PlayerPosition;
  ageGroup?: string;
  level?: string;
  snapshotType: 'latest' | 'specific' | 'average';
  snapshotDate?: string;
  averageSnapshots?: number;
}

export interface PlayerComparisonResult {
  context: {
    position: PlayerPosition;
    ageGroup?: string;
    level?: string;
    snapshotType: string;
    snapshotDate?: string;
  };
  players: Array<{
    studentId: number;
    studentName: string;
    centerName?: string;
    ageGroup?: string;
    snapshotId: number;
    snapshotDate: string;
    readiness: {
      overall: number;
      technical: number;
      physical: number;
      mental: number;
      attitude: number;
      tacticalFit: number;
      statusBand: string;
      explanation: any;
    };
    metrics: Array<{
      metricKey: string;
      displayName: string;
      category: string;
      value: number;
      confidence?: number;
      comment?: string;
    }>;
    positionalSuitability: Array<{
      position: PlayerPosition;
      suitability: number;
      comment?: string;
    }>;
    trends: {
      direction: 'improving' | 'plateau' | 'declining';
      metricsImproved: number;
      metricsDeclined: number;
    };
    coachNotes: Array<{
      title: string;
      tags: string[];
      createdAt: string;
    }>;
  }>;
  insights: string[];
  warnings: string[];
}

export interface CreateScoutingBoardParams {
  name: string;
  description?: string;
  type: ScoutingBoardType;
  centerId?: number;
  createdByUserId: number;
  createdByRole: Role;
}

export interface GetPlayersForScoutingParams {
  coachId?: number;
  centerId?: number;
  position?: string;
  ageGroup?: string;
  level?: string;
  readinessMin?: number;
  readinessMax?: number;
  trendDirection?: 'improving' | 'plateau' | 'declining';
  injuryRisk?: boolean;
  coachConfidence?: number;
  lastUpdatedDays?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============================================
// PLAYER COMPARISON
// ============================================

/**
 * Compare multiple players with contextual filters
 */
export async function comparePlayers(params: ComparePlayersParams): Promise<PlayerComparisonResult> {
  const { playerIds, position, ageGroup, level, snapshotType, snapshotDate, averageSnapshots } = params;

  // Get snapshots for each player based on snapshotType
  const playerSnapshots = await Promise.all(
    playerIds.map(async (studentId) => {
      let snapshot;
      
      if (snapshotType === 'latest') {
        snapshot = await prisma.playerMetricSnapshot.findFirst({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          include: {
            values: {
              include: { metricDefinition: true },
            },
            positional: true,
            readiness: true,
            coachNotes: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            student: {
              include: { center: true },
            },
          },
        });
      } else if (snapshotType === 'specific' && snapshotDate) {
        const targetDate = new Date(snapshotDate);
        snapshot = await prisma.playerMetricSnapshot.findFirst({
          where: {
            studentId,
            createdAt: {
              gte: new Date(targetDate.getTime() - 24 * 60 * 60 * 1000),
              lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            values: {
              include: { metricDefinition: true },
            },
            positional: true,
            readiness: true,
            coachNotes: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            student: {
              include: { center: true },
            },
          },
        });
      } else if (snapshotType === 'average' && averageSnapshots) {
        // Get average of last N snapshots
        const snapshots = await prisma.playerMetricSnapshot.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: averageSnapshots,
          include: {
            values: {
              include: { metricDefinition: true },
            },
            positional: true,
            readiness: true,
            coachNotes: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            student: {
              include: { center: true },
            },
          },
        });
        
        if (snapshots.length > 0) {
          // Calculate averages (simplified - would need more complex logic for real averaging)
          snapshot = snapshots[0]; // Use latest as base, but could compute averages
        }
      }

      if (!snapshot) {
        throw new Error(`No snapshot found for player ${studentId}`);
      }

      // Get trend data (compare with previous snapshot)
      const previousSnapshot = await prisma.playerMetricSnapshot.findFirst({
        where: {
          studentId,
          createdAt: { lt: snapshot.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          values: {
            include: { metricDefinition: true },
          },
        },
      });

      let trends: {
        direction: 'improving' | 'plateau' | 'declining';
        metricsImproved: number;
        metricsDeclined: number;
      } = {
        direction: 'plateau',
        metricsImproved: 0,
        metricsDeclined: 0,
      };

      if (previousSnapshot) {
        const improvements = snapshot.values.filter(sv => {
          const pv = previousSnapshot.values.find(p => p.metricDefinitionId === sv.metricDefinitionId);
          return pv && sv.valueNumber > pv.valueNumber;
        }).length;
        
        const declines = snapshot.values.filter(sv => {
          const pv = previousSnapshot.values.find(p => p.metricDefinitionId === sv.metricDefinitionId);
          return pv && sv.valueNumber < pv.valueNumber;
        }).length;

        trends = {
          direction: improvements > declines ? 'improving' : declines > improvements ? 'declining' : 'plateau',
          metricsImproved: improvements,
          metricsDeclined: declines,
        };
      }

      return {
        snapshot,
        trends,
      };
    })
  );

  // Build comparison result
  const players = playerSnapshots.map(({ snapshot, trends }) => {
    const readiness = snapshot.readiness ? {
      overall: snapshot.readiness.overall,
      technical: snapshot.readiness.technical,
      physical: snapshot.readiness.physical,
      mental: snapshot.readiness.mental,
      attitude: snapshot.readiness.attitude,
      tacticalFit: snapshot.readiness.tacticalFit,
      statusBand: getStatusBand(snapshot.readiness.overall),
      explanation: snapshot.readiness.explanationJson,
    } : null;

    return {
      studentId: snapshot.studentId,
      studentName: snapshot.student.fullName,
      centerName: snapshot.student.center?.name,
      ageGroup: snapshot.student.programType || undefined,
      snapshotId: snapshot.id,
      snapshotDate: snapshot.createdAt.toISOString(),
      readiness: readiness || {
        overall: 0,
        technical: 0,
        physical: 0,
        mental: 0,
        attitude: 0,
        tacticalFit: 0,
        statusBand: 'Foundation',
        explanation: {},
      },
      metrics: snapshot.values.map(v => ({
        metricKey: v.metricDefinition.key,
        displayName: v.metricDefinition.displayName,
        category: v.metricDefinition.category,
        value: v.valueNumber,
        confidence: v.confidence || undefined,
        comment: v.comment || undefined,
      })),
      positionalSuitability: snapshot.positional.map(p => ({
        position: p.position,
        suitability: p.suitability,
        comment: p.comment || undefined,
      })),
      trends,
      coachNotes: snapshot.coachNotes.map(n => ({
        title: n.title,
        tags: n.tags,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  });

  // Generate insights
  const insights = generateInsights(players, position);
  
  // Generate warnings
  const warnings = generateWarnings(players);

  return {
    context: {
      position,
      ageGroup,
      level,
      snapshotType,
      snapshotDate,
    },
    players,
    insights,
    warnings,
  };
}

function getStatusBand(overall: number): string {
  if (overall >= 85) return 'Ready';
  if (overall >= 75) return 'Advanced';
  if (overall >= 60) return 'Competitive';
  if (overall >= 40) return 'Developing';
  return 'Foundation';
}

function generateInsights(players: PlayerComparisonResult['players'], position: PlayerPosition): string[] {
  const insights: string[] = [];

  if (players.length < 2) return insights;

  // Compare readiness scores
  const sortedByReadiness = [...players].sort((a, b) => b.readiness.overall - a.readiness.overall);
  const topPlayer = sortedByReadiness[0];
  const secondPlayer = sortedByReadiness[1];

  if (topPlayer.readiness.overall > secondPlayer.readiness.overall) {
    const diff = topPlayer.readiness.overall - secondPlayer.readiness.overall;
    insights.push(
      `${topPlayer.studentName} currently leads ${secondPlayer.studentName} in overall readiness (+${diff} points) for ${position} role.`
    );
  }

  // Compare key metrics for position
  const keyMetrics = getKeyMetricsForPosition(position);
  for (const metricKey of keyMetrics) {
    const metricValues = players.map(p => {
      const metric = p.metrics.find(m => m.metricKey === metricKey);
      return { player: p.studentName, value: metric?.value || 0 };
    });
    
    const sorted = [...metricValues].sort((a, b) => b.value - a.value);
    if (sorted[0].value > sorted[1].value + 10) {
      const metric = players[0].metrics.find(m => m.metricKey === metricKey);
      insights.push(
        `${sorted[0].player} shows stronger ${metric?.displayName || metricKey} (+${sorted[0].value - sorted[1].value} points), which heavily influences readiness for ${position} role.`
      );
    }
  }

  // Compare trends
  const improvingPlayers = players.filter(p => p.trends.direction === 'improving');
  if (improvingPlayers.length > 0) {
    insights.push(
      `${improvingPlayers.map(p => p.studentName).join(', ')} ${improvingPlayers.length === 1 ? 'shows' : 'show'} stronger improvement trend.`
    );
  }

  return insights;
}

function generateWarnings(players: PlayerComparisonResult['players']): string[] {
  const warnings: string[] = [];

  // Check for snapshot date differences
  const dates = players.map(p => new Date(p.snapshotDate));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const daysDiff = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff > 90) {
    warnings.push(
      `Snapshots are ${Math.round(daysDiff)} days apart. Comparison may not reflect current state.`
    );
  }

  return warnings;
}

function getKeyMetricsForPosition(position: PlayerPosition): string[] {
  const positionMetrics: Record<PlayerPosition, string[]> = {
    GK: ['positioning', 'reflexes', 'handling', 'distribution'],
    CB: ['positioning', 'tackling', 'heading', 'strength'],
    FB: ['pace', 'stamina', 'crossing', 'tackling'],
    WB: ['pace', 'stamina', 'crossing', 'dribbling'],
    DM: ['tackling', 'positioning', 'passing', 'work_rate'],
    CM: ['passing', 'vision', 'work_rate', 'first_touch'],
    AM: ['vision', 'passing', 'dribbling', 'finishing'],
    W: ['pace', 'dribbling', 'crossing', 'stamina'],
    ST: ['finishing', 'positioning', 'heading', 'composure'],
  };
  return positionMetrics[position] || [];
}

// ============================================
// SCOUTING BOARD OPERATIONS
// ============================================

export async function getScoutingBoards(coachId?: number) {
  const where: any = {};
  
  if (coachId) {
    // Get coach's center IDs
    const centerLinks = await prisma.coachCenter.findMany({
      where: { coachId },
      select: { centerId: true },
    });
    const centerIds = centerLinks.map(l => l.centerId);
    
    where.OR = [
      { type: 'CLUB_WIDE' },
      { type: 'CUSTOM', createdByUserId: coachId },
      { type: 'CENTRE_VIEW', centerId: { in: centerIds } },
    ];
  }

  return await prisma.scoutingBoard.findMany({
    where,
    include: {
      center: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
      _count: {
        select: { players: true, decisions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createScoutingBoard(params: CreateScoutingBoardParams) {
  return await prisma.scoutingBoard.create({
    data: {
      name: params.name,
      description: params.description,
      type: params.type,
      centerId: params.centerId,
      createdByUserId: params.createdByUserId,
      createdByRole: params.createdByRole,
    },
    include: {
      center: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
    },
  });
}

export async function getScoutingBoard(boardId: number) {
  return await prisma.scoutingBoard.findUnique({
    where: { id: boardId },
    include: {
      center: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
      players: {
        include: {
          student: {
            include: {
              center: true,
              metricSnapshots: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: {
                  readiness: true,
                },
              },
            },
          },
        },
      },
      decisions: {
        include: {
          student: {
            select: { fullName: true },
          },
          decidedBy: {
            select: { fullName: true },
          },
        },
        orderBy: { decidedAt: 'desc' },
      },
    },
  });
}

export async function updateScoutingBoard(boardId: number, data: { name?: string; description?: string }) {
  return await prisma.scoutingBoard.update({
    where: { id: boardId },
    data,
  });
}

export async function deleteScoutingBoard(boardId: number) {
  return await prisma.scoutingBoard.delete({
    where: { id: boardId },
  });
}

export async function addPlayerToBoard(params: {
  boardId: number;
  studentId: number;
  addedByUserId: number;
  addedByRole: Role;
  notes?: string;
}) {
  return await prisma.scoutingBoardPlayer.create({
    data: {
      boardId: params.boardId,
      studentId: params.studentId,
      addedByUserId: params.addedByUserId,
      addedByRole: params.addedByRole,
      notes: params.notes,
    },
    include: {
      student: {
        include: { center: true },
      },
    },
  });
}

export async function removePlayerFromBoard(boardId: number, studentId: number) {
  return await prisma.scoutingBoardPlayer.delete({
    where: {
      boardId_studentId: {
        boardId,
        studentId,
      },
    },
  });
}

export async function getBoardPlayers(boardId: number) {
  return await prisma.scoutingBoardPlayer.findMany({
    where: { boardId },
    include: {
      student: {
        include: {
          center: true,
          metricSnapshots: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              readiness: true,
              values: {
                include: { metricDefinition: true },
              },
              positional: true,
            },
          },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });
}

export async function createScoutingDecision(params: {
  boardId: number;
  studentId: number;
  decisionState: ScoutingDecisionState;
  notes?: string;
  decidedByUserId: number;
  decidedByRole: Role;
}) {
  return await prisma.scoutingDecisionLog.create({
    data: {
      boardId: params.boardId,
      studentId: params.studentId,
      decisionState: params.decisionState,
      notes: params.notes,
      decidedByUserId: params.decidedByUserId,
      decidedByRole: params.decidedByRole,
    },
    include: {
      student: {
        select: { fullName: true },
      },
      decidedBy: {
        select: { fullName: true },
      },
    },
  });
}

export async function getScoutingDecisions(boardId: number) {
  return await prisma.scoutingDecisionLog.findMany({
    where: { boardId },
    include: {
      student: {
        select: { fullName: true },
      },
      decidedBy: {
        select: { fullName: true },
      },
    },
    orderBy: { decidedAt: 'desc' },
  });
}

// ============================================
// GET PLAYERS FOR SCOUTING
// ============================================

export async function getPlayersForScouting(params: GetPlayersForScoutingParams) {
  const {
    coachId,
    centerId,
    position,
    ageGroup,
    level,
    readinessMin,
    readinessMax,
    trendDirection,
    injuryRisk,
    coachConfidence,
    lastUpdatedDays,
    sortBy,
    sortOrder,
    limit = 50,
    offset = 0,
  } = params;

  // Build where clause
  const where: any = {};

  // Center filter
  if (centerId) {
    where.centerId = centerId;
  } else if (coachId) {
    const centerLinks = await prisma.coachCenter.findMany({
      where: { coachId },
      select: { centerId: true },
    });
    const centerIds = centerLinks.map(l => l.centerId);
    if (centerIds.length > 0) {
      where.centerId = { in: centerIds };
    } else {
      return { players: [], total: 0 };
    }
  }

  // Age group filter
  if (ageGroup) {
    where.programType = ageGroup;
  }

  // Get students with latest snapshots
  const students = await prisma.student.findMany({
    where,
    include: {
      center: true,
      metricSnapshots: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          readiness: true,
          values: {
            include: { metricDefinition: true },
          },
          positional: true,
        },
      },
    },
    take: limit,
    skip: offset,
  });

  // Filter and enrich with scouting data
  let filtered = students
    .filter(s => {
      const snapshot = s.metricSnapshots[0];
      if (!snapshot) return false;

      // Readiness filter
      if (readinessMin !== undefined && (!snapshot.readiness || snapshot.readiness.overall < readinessMin)) {
        return false;
      }
      if (readinessMax !== undefined && (!snapshot.readiness || snapshot.readiness.overall > readinessMax)) {
        return false;
      }

      // Position filter
      if (position) {
        const posSuitability = snapshot.positional.find(p => p.position === position);
        if (!posSuitability || posSuitability.suitability < 50) {
          return false;
        }
      }

      // Last updated filter
      if (lastUpdatedDays) {
        const daysSince = (Date.now() - snapshot.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > lastUpdatedDays) {
          return false;
        }
      }

      return true;
    })
    .map(s => {
      const snapshot = s.metricSnapshots[0];
      return {
        student: s,
        snapshot,
        readiness: snapshot?.readiness,
      };
    });

  // Sort
  if (sortBy === 'readiness') {
    filtered.sort((a, b) => {
      const aScore = a.readiness?.overall || 0;
      const bScore = b.readiness?.overall || 0;
      return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
    });
  }

  // Format response
  const players = filtered.map(({ student, snapshot, readiness }) => ({
    id: student.id,
    fullName: student.fullName,
    center: student.center?.name,
    ageGroup: student.programType,
    snapshotId: snapshot?.id,
    snapshotDate: snapshot?.createdAt.toISOString(),
    readiness: readiness ? {
      overall: readiness.overall,
      technical: readiness.technical,
      physical: readiness.physical,
      mental: readiness.mental,
      attitude: readiness.attitude,
      tacticalFit: readiness.tacticalFit,
      statusBand: getStatusBand(readiness.overall),
    } : null,
    positionalSuitability: snapshot?.positional || [],
    keyMetrics: snapshot?.values
      .filter(v => {
        const keyMetrics = position ? getKeyMetricsForPosition(position as PlayerPosition) : [];
        return keyMetrics.includes(v.metricDefinition.key);
      })
      .map(v => ({
        key: v.metricDefinition.key,
        displayName: v.metricDefinition.displayName,
        value: v.valueNumber,
      })) || [],
  }));

  return {
    players,
    total: players.length,
  };
}

