/**
 * Readiness Calculation Utilities
 * 
 * Position-aware readiness index calculation with gates and explanations
 */

export type PlayerPosition = 'GK' | 'CB' | 'FB' | 'WB' | 'DM' | 'CM' | 'AM' | 'W' | 'ST';

export interface MetricValue {
  metricKey: string;
  value: number; // 0-100
  category: 'TECHNICAL' | 'PHYSICAL' | 'MENTAL' | 'GOALKEEPING' | 'ATTITUDE';
}

export interface TraitValue {
  traitKey: string;
  value: number; // 0-100
}

export interface PositionWeights {
  technical: number;
  physical: number;
  mental: number;
  attitude: number;
  tacticalFit: number;
}

export interface ReadinessConfig {
  weights: Record<PlayerPosition, PositionWeights>;
  gates: Array<{
    name: string;
    condition: (values: MetricValue[], traits: TraitValue[], position: PlayerPosition) => boolean;
    message: string;
    maxCap?: number; // If gate fails, cap overall at this value
  }>;
  trendBoost?: {
    enabled: boolean;
    maxBoost: number; // Max +3
    maxPenalty: number; // Max -3
  };
}

// Default position-aware weights
const DEFAULT_WEIGHTS: Record<PlayerPosition, PositionWeights> = {
  GK: { technical: 35, physical: 20, mental: 25, attitude: 10, tacticalFit: 10 },
  CB: { technical: 25, physical: 30, mental: 25, attitude: 10, tacticalFit: 10 },
  FB: { technical: 30, physical: 30, mental: 20, attitude: 10, tacticalFit: 10 },
  WB: { technical: 30, physical: 30, mental: 20, attitude: 10, tacticalFit: 10 },
  DM: { technical: 30, physical: 25, mental: 25, attitude: 10, tacticalFit: 10 },
  CM: { technical: 30, physical: 25, mental: 25, attitude: 10, tacticalFit: 10 },
  AM: { technical: 35, physical: 20, mental: 25, attitude: 10, tacticalFit: 10 },
  W: { technical: 30, physical: 30, mental: 20, attitude: 10, tacticalFit: 10 },
  ST: { technical: 35, physical: 25, mental: 20, attitude: 10, tacticalFit: 10 },
};

// Default gates
const DEFAULT_GATES: ReadinessConfig['gates'] = [
  {
    name: 'Discipline Gate',
    condition: (values, traits) => {
      const discipline = traits.find(t => t.traitKey === 'discipline')?.value || 50;
      return discipline >= 45;
    },
    message: 'Discipline below 45 blocks readiness',
    maxCap: 74,
  },
  {
    name: 'Injury Resilience Gate',
    condition: (values, traits) => {
      const resilience = values.find(v => v.metricKey === 'injury_resilience')?.value || 50;
      const stamina = values.find(v => v.metricKey === 'stamina')?.value || 50;
      return resilience >= 35 && stamina >= 40;
    },
    message: 'Low injury resilience and stamina blocks readiness',
    maxCap: 74,
  },
  {
    name: 'Positioning Gate (Defensive)',
    condition: (values, traits, position) => {
      if (position !== 'CB' && position !== 'DM') return true;
      const positioning = values.find(v => v.metricKey === 'positioning')?.value || 50;
      return positioning >= 40;
    },
    message: 'Defensive positioning below 40 blocks readiness for CB/DM',
    maxCap: 74,
  },
  {
    name: 'Work Rate Gate',
    condition: (values, traits) => {
      const workRate = traits.find(t => t.traitKey === 'work_rate')?.value || 50;
      return workRate >= 45;
    },
    message: 'Work rate below 45 is a warning flag',
    maxCap: undefined, // Warning only, no cap
  },
];

export interface ReadinessResult {
  overall: number;
  technical: number;
  physical: number;
  mental: number;
  attitude: number;
  tacticalFit: number;
  statusBand: 'Foundation' | 'Developing' | 'Competitive' | 'Advanced' | 'Ready';
  explanation: {
    topStrengths: string[];
    topRisks: string[];
    recommendedFocus: string[];
    ruleTriggers: string[];
  };
  nextAction?: string;
}

/**
 * Compute readiness index with position-aware weights and gates
 */
export function computeReadinessIndex(
  values: MetricValue[],
  traits: TraitValue[],
  position: PlayerPosition,
  previousSnapshot?: { values: MetricValue[]; traits: TraitValue[] },
  config?: Partial<ReadinessConfig>
): ReadinessResult {
  const fullConfig: ReadinessConfig = {
    weights: config?.weights || DEFAULT_WEIGHTS,
    gates: config?.gates || DEFAULT_GATES,
    trendBoost: config?.trendBoost || { enabled: true, maxBoost: 3, maxPenalty: 3 },
  };

  const weights = fullConfig.weights[position];

  // Calculate category scores
  const technicalValues = values.filter(v => v.category === 'TECHNICAL' || v.category === 'GOALKEEPING');
  const physicalValues = values.filter(v => v.category === 'PHYSICAL');
  const mentalValues = values.filter(v => v.category === 'MENTAL');
  const attitudeValues = traits;

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 50);

  const technicalScore = Math.round(avg(technicalValues.map(v => v.value)));
  const physicalScore = Math.round(avg(physicalValues.map(v => v.value)));
  const mentalScore = Math.round(avg(mentalValues.map(v => v.value)));
  const attitudeScore = Math.round(avg(attitudeValues.map(t => t.value)));

  // Tactical fit = average of technical + mental + positioning
  const positioning = values.find(v => v.metricKey === 'positioning')?.value || 50;
  const tacticalFit = Math.round((technicalScore + mentalScore + positioning) / 3);

  // Calculate weighted overall
  let overall = Math.round(
    (technicalScore * weights.technical +
      physicalScore * weights.physical +
      mentalScore * weights.mental +
      attitudeScore * weights.attitude +
      tacticalFit * weights.tacticalFit) /
      100
  );

  // Apply gates
  const ruleTriggers: string[] = [];
  let cappedOverall = overall;

  for (const gate of fullConfig.gates) {
    const passes = gate.condition(values, traits, position);
    if (!passes) {
      ruleTriggers.push(gate.message);
      if (gate.maxCap !== undefined && overall > gate.maxCap) {
        cappedOverall = Math.min(cappedOverall, gate.maxCap);
      }
    }
  }

  // Apply trend boost/penalty
  let trendAdjustment = 0;
  if (fullConfig.trendBoost?.enabled && previousSnapshot) {
    const improvements = values.filter(v => {
      const prev = previousSnapshot.values.find(pv => pv.metricKey === v.metricKey);
      if (!prev) return false;
      return v.value > prev.value;
    }).length;

    const declines = values.filter(v => {
      const prev = previousSnapshot.values.find(pv => pv.metricKey === v.metricKey);
      if (!prev) return false;
      return v.value < prev.value;
    }).length;

    if (improvements >= 2 && declines === 0) {
      trendAdjustment = Math.min(fullConfig.trendBoost.maxBoost || 0, 3);
      ruleTriggers.push('Positive momentum detected');
    } else if (declines >= 3) {
      trendAdjustment = -Math.min(fullConfig.trendBoost.maxPenalty || 0, 3);
      ruleTriggers.push('Decline in key metrics detected');
    }
  }

  overall = Math.max(0, Math.min(100, cappedOverall + trendAdjustment));

  // Determine status band
  let statusBand: ReadinessResult['statusBand'] = 'Foundation';
  if (overall >= 85) statusBand = 'Ready';
  else if (overall >= 75) statusBand = 'Advanced';
  else if (overall >= 60) statusBand = 'Competitive';
  else if (overall >= 40) statusBand = 'Developing';

  // Find top strengths and risks
  const allMetrics = [
    ...values.map(v => ({ key: v.metricKey, value: v.value })),
    ...traits.map(t => ({ key: t.traitKey, value: t.value })),
  ];
  const sorted = [...allMetrics].sort((a, b) => b.value - a.value);
  const topStrengths = sorted.slice(0, 5).map(m => m.key);
  const topRisks = sorted.slice(-3).map(m => m.key);

  // Generate next action
  let nextAction: string | undefined;
  if (overall >= 85) {
    nextAction = 'Promote to next age group for training';
  } else if (overall >= 75) {
    nextAction = 'Integrate 1 session/week with senior';
  } else if (overall >= 60) {
    nextAction = 'Keep in current group, focus block recommended';
  } else if (physicalScore < 60) {
    nextAction = 'Fitness intervention required';
  } else {
    nextAction = 'Continue development in current group';
  }

  return {
    overall,
    technical: technicalScore,
    physical: physicalScore,
    mental: mentalScore,
    attitude: attitudeScore,
    tacticalFit,
    statusBand,
    explanation: {
      topStrengths,
      topRisks,
      recommendedFocus: topRisks,
      ruleTriggers,
    },
    nextAction,
  };
}


