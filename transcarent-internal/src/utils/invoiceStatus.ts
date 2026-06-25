export type ServicePaymentsState =
  | 'pre_authorized'
  | 'pre_unbillable'
  | 'encounter_closed'
  | 'payment_captured'
  | 'no_payment_needed'
  | 'ingested';

export type MemberFacingStatus = 'Paid' | 'No Cost' | 'Pending' | 'Canceled';

export type AdminInvoiceState =
  | 'invoice_draft'
  | 'pre_calculated'
  | 'invoice_pending_approval'
  | 'invoice_approved'
  | 'invoice_correction_required'
  | 'issued_invoice'
  | 'paid';

export function deriveMemberStatus(
  serviceState: ServicePaymentsState,
  stripePaymentIntentId?: string
): MemberFacingStatus {
  if (serviceState === 'payment_captured') return 'Paid';
  if (serviceState === 'no_payment_needed') {
    return stripePaymentIntentId ? 'Canceled' : 'No Cost';
  }
  return 'Pending';
}

export function adminStateBadgeVariant(
  state: AdminInvoiceState
): 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  switch (state) {
    case 'paid': return 'success';
    case 'invoice_approved':
    case 'issued_invoice': return 'info';
    case 'invoice_pending_approval':
    case 'pre_calculated': return 'warning';
    case 'invoice_correction_required': return 'error';
    default: return 'neutral';
  }
}

export const ADMIN_STATE_LABELS: Record<AdminInvoiceState, string> = {
  invoice_draft: 'Draft',
  pre_calculated: 'Pre-calculated',
  invoice_pending_approval: 'Pending Approval',
  invoice_approved: 'Approved',
  invoice_correction_required: 'Correction Required',
  issued_invoice: 'Issued',
  paid: 'Paid',
};

export const UNBILLABLE_REASON_LABELS: Record<string, string> = {
  less_than_50_cents: 'Below minimum charge ($0.50)',
  nth_free_session: 'Free session (employer-covered)',
  no_cost_share_config: 'No cost share configured',
  zero_cost_unknown: 'No cost',
  within_existing_episode: 'Within care episode window',
  payments_disabled: 'Payments disabled',
  no_care_plan: 'No care plan on file',
  clinical_no_charge_code: 'No charge (clinical)',
  no_client_cost_config: 'No client rate configured',
  errors_present: 'Calculation error',
  entered_in_error: 'Entered in error',
};

export const COST_SHARE_TYPE_LABELS: Record<string, string> = {
  irs_minimums: 'IRS Minimum',
  same_as_insurance: 'Same as Insurance',
  custom: 'Custom',
  traditional: 'Traditional',
  fixed_cost: 'Fixed Cost',
  waived: 'Waived',
};

export const ENCOUNTER_SOURCE_LABELS: Record<string, string> = {
  CRMSurgery: 'Surgery (CRM)',
  CirrusMD: 'Telehealth',
  CustomAPI: 'Custom API',
  DispatchHealth: 'Dispatch Health',
  ManuallyEnteredCostShare: 'Manual (Cost Share)',
  ManuallyEnteredRecoupment: 'Manual (Recoupment)',
  '98point6': '98point6',
  SwordHealth: 'Sword Health',
  ViewFi: 'ViewFi',
};
