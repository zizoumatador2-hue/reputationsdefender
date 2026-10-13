// Informational score bands. A score is an informational assessment based on
// the checks described on the Reputation Score page. It is not an official
// rating, credit score, or certification.

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  tone: 'excellent' | 'strong' | 'attention' | 'risk' | 'critical';
  meaning: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  { min: 90, max: 100, label: 'Excellent', tone: 'excellent', meaning: 'Accurate, favorable results dominate what appears when your name or brand is searched.' },
  { min: 75, max: 89, label: 'Strong', tone: 'strong', meaning: 'Mostly accurate, favorable results with a few items worth reviewing.' },
  { min: 50, max: 74, label: 'Needs Attention', tone: 'attention', meaning: 'Mixed results, outdated information, or gaps in profiles that deserve a plan.' },
  { min: 25, max: 49, label: 'At Risk', tone: 'risk', meaning: 'Several unfavorable, inaccurate, or sensitive results are prominent.' },
  { min: 0, max: 24, label: 'Critical', tone: 'critical', meaning: 'Sensitive or highly unfavorable information is prominent and needs prompt review.' }
];

export function scoreBand(score: number): ScoreBand {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return SCORE_BANDS.find((b) => s >= b.min && s <= b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}
