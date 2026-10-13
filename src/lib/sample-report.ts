// SAMPLE DATA ONLY. This module builds the illustrative report returned by
// /api/scan. No search engine, review site, or brand-monitoring source is
// queried. Replace buildSampleReport with a real analysis step once an
// integration is connected, and set `isSample` to false in that case.

import type { ScanInput } from './validation';
import { scoreBand } from './score';

export interface SampleReport {
  isSample: true;
  subject: string;
  subjectType: ScanInput['subjectType'];
  location: string;
  score: number;
  band: string;
  bandTone: string;
  bandMeaning: string;
  searchVisibility: number;
  reviewPresence: number;
  positiveSignals: string[];
  potentialRisks: string[];
  recommendations: string[];
  limitations: string[];
}

export function buildSampleReport(input: ScanInput, stateName: string): SampleReport {
  const score = 68;
  const band = scoreBand(score);
  return {
    isSample: true,
    subject: input.subject,
    subjectType: input.subjectType,
    location: `${input.city}, ${stateName}`,
    score,
    band: band.label,
    bandTone: band.tone,
    bandMeaning: band.meaning,
    searchVisibility: 61,
    reviewPresence: 72,
    positiveSignals: [
      'Example: a professional profile or business listing appears on the first page of results',
      'Example: publicly available reviews include favorable comments'
    ],
    potentialRisks: [
      'Example category: data broker or people-search listings that show contact details',
      'Example category: outdated news or directory entries',
      'Example category: business profiles that are unclaimed or missing hours and contact details'
    ],
    recommendations: [
      'Claim and complete the profiles you control, using consistent name and contact details',
      'Create a short schedule for checking how your name or business appears each month',
      'Review personal information on people-search sites and request removal where it is available',
      'Respond professionally to reviews, including negative ones'
    ],
    limitations: [
      'This is a sample report. Live search and review analysis is not connected in this build.',
      'The report does not reflect what the internet currently says about you or your business.',
      'Scores are informational only. They are not an official rating or a prediction of any outcome.'
    ]
  };
}
