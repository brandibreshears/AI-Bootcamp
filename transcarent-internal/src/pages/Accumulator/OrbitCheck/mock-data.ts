export type DataAvailability = 'available' | 'partial' | 'unavailable';

export type NetworkTier = 'preferred' | 'inn' | 'oon';
export type EligibilityTier = 'EE' | 'ES' | 'ECH' | 'E1D' | 'E2D' | 'E3D' | 'EF';

export interface AccumulatorCell {
  indDeductible: DataAvailability;
  famDeductible: DataAvailability;
  indOopMax: DataAvailability;
  famOopMax: DataAvailability;
}

export type TierMatrix = Record<EligibilityTier, Record<NetworkTier, AccumulatorCell>>;

export interface ClientOrbitRecord {
  id: string;
  clientName: string;
  carrierName: string;
  orbitPayerId: string;
  memberCount: number;
  lastChecked: string;
  tierMatrix: TierMatrix;
}

export interface SampleMemberRow {
  maskedId: string;
  clientId: string;
  eligibilityTier: EligibilityTier;
  indDeductibleAvailable: boolean;
  famDeductibleAvailable: boolean;
  indOopAvailable: boolean;
  famOopAvailable: boolean;
}

export const ELIGIBILITY_TIERS: EligibilityTier[] = ['EE', 'ES', 'ECH', 'E1D', 'E2D', 'E3D', 'EF'];
export const NETWORK_TIERS: NetworkTier[] = ['preferred', 'inn', 'oon'];

export const ELIGIBILITY_TIER_LABELS: Record<EligibilityTier, string> = {
  EE: 'Employee Only',
  ES: 'Employee + Spouse',
  ECH: 'Employee + Children',
  E1D: 'Employee + 1 Dependent',
  E2D: 'Employee + 2 Dependents',
  E3D: 'Employee + 3 Dependents',
  EF: 'Employee + Family',
};

export const NETWORK_TIER_LABELS: Record<NetworkTier, string> = {
  preferred: 'Preferred (Tier 1)',
  inn: 'In-Network',
  oon: 'Out-of-Network',
};

const all: AccumulatorCell = { indDeductible: 'available', famDeductible: 'available', indOopMax: 'available', famOopMax: 'available' };
const partialFam: AccumulatorCell = { indDeductible: 'available', famDeductible: 'partial', indOopMax: 'available', famOopMax: 'partial' };
const partialAll: AccumulatorCell = { indDeductible: 'partial', famDeductible: 'partial', indOopMax: 'partial', famOopMax: 'partial' };
const none: AccumulatorCell = { indDeductible: 'unavailable', famDeductible: 'unavailable', indOopMax: 'unavailable', famOopMax: 'unavailable' };

function matrix(ee: Record<NetworkTier, AccumulatorCell>, rest: Record<NetworkTier, AccumulatorCell>): TierMatrix {
  return { EE: ee, ES: rest, ECH: rest, E1D: rest, E2D: rest, E3D: rest, EF: rest };
}

export const MOCK_CLIENTS: ClientOrbitRecord[] = [
  {
    id: 'c-001',
    clientName: 'Apex Industries',
    carrierName: 'Aetna',
    orbitPayerId: 'AETNA-60054',
    memberCount: 4821,
    lastChecked: '2026-06-25',
    tierMatrix: matrix(
      { preferred: all, inn: all, oon: all },
      { preferred: all, inn: all, oon: all },
    ),
  },
  {
    id: 'c-002',
    clientName: 'Meridian Health Systems',
    carrierName: 'UnitedHealthcare',
    orbitPayerId: 'UHC-87001',
    memberCount: 12340,
    lastChecked: '2026-06-25',
    tierMatrix: matrix(
      { preferred: all, inn: all, oon: partialAll },
      { preferred: partialFam, inn: partialFam, oon: none },
    ),
  },
  {
    id: 'c-003',
    clientName: 'Coastal Freight Co.',
    carrierName: 'Cigna',
    orbitPayerId: 'CIGNA-44201',
    memberCount: 2100,
    lastChecked: '2026-06-24',
    tierMatrix: matrix(
      { preferred: none, inn: all, oon: partialAll },
      { preferred: none, inn: partialFam, oon: none },
    ),
  },
  {
    id: 'c-004',
    clientName: 'BlueStar Education',
    carrierName: 'BCBS Texas',
    orbitPayerId: 'BCBSTX-10033',
    memberCount: 890,
    lastChecked: '2026-06-23',
    tierMatrix: matrix(
      { preferred: all, inn: all, oon: all },
      { preferred: all, inn: all, oon: all },
    ),
  },
  {
    id: 'c-005',
    clientName: 'Pinnacle Logistics',
    carrierName: 'Humana',
    orbitPayerId: 'HUMANA-55512',
    memberCount: 3400,
    lastChecked: '2026-06-22',
    tierMatrix: matrix(
      { preferred: partialAll, inn: all, oon: none },
      { preferred: none, inn: partialFam, oon: none },
    ),
  },
];

export const MOCK_SAMPLES: SampleMemberRow[] = [
  { maskedId: 'MBR-***-4821', clientId: 'c-001', eligibilityTier: 'EE', indDeductibleAvailable: true, famDeductibleAvailable: true, indOopAvailable: true, famOopAvailable: true },
  { maskedId: 'MBR-***-2201', clientId: 'c-001', eligibilityTier: 'ES', indDeductibleAvailable: true, famDeductibleAvailable: true, indOopAvailable: true, famOopAvailable: false },
  { maskedId: 'MBR-***-9034', clientId: 'c-001', eligibilityTier: 'EF', indDeductibleAvailable: true, famDeductibleAvailable: false, indOopAvailable: true, famOopAvailable: false },
  { maskedId: 'MBR-***-1100', clientId: 'c-002', eligibilityTier: 'EE', indDeductibleAvailable: true, famDeductibleAvailable: true, indOopAvailable: true, famOopAvailable: true },
  { maskedId: 'MBR-***-3302', clientId: 'c-002', eligibilityTier: 'ECH', indDeductibleAvailable: true, famDeductibleAvailable: false, indOopAvailable: true, famOopAvailable: false },
  { maskedId: 'MBR-***-7771', clientId: 'c-002', eligibilityTier: 'E2D', indDeductibleAvailable: false, famDeductibleAvailable: false, indOopAvailable: false, famOopAvailable: false },
  { maskedId: 'MBR-***-5540', clientId: 'c-003', eligibilityTier: 'EE', indDeductibleAvailable: true, famDeductibleAvailable: true, indOopAvailable: true, famOopAvailable: true },
  { maskedId: 'MBR-***-8812', clientId: 'c-003', eligibilityTier: 'ES', indDeductibleAvailable: true, famDeductibleAvailable: false, indOopAvailable: false, famOopAvailable: false },
  { maskedId: 'MBR-***-6609', clientId: 'c-004', eligibilityTier: 'EF', indDeductibleAvailable: true, famDeductibleAvailable: true, indOopAvailable: true, famOopAvailable: true },
  { maskedId: 'MBR-***-2298', clientId: 'c-005', eligibilityTier: 'EE', indDeductibleAvailable: false, famDeductibleAvailable: false, indOopAvailable: true, famOopAvailable: false },
];
