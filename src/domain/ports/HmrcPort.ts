export interface VatReturnPayload { periodKey: string; values: Record<string, number>; }
export interface CisVerificationPayload { utr: string; nino?: string; companyName?: string; }
export interface RtiSubmissionPayload { payPeriod: string; employees: Array<{ nin: string; gross: number; tax: number }>; }

export interface HmrcPort {
  getAuthUrl(redirectUri: string): Promise<string>;
  exchangeCode(code: string, redirectUri: string): Promise<{ access_token: string; refresh_token?: string }>;
  submitVat(companyId: string, data: VatReturnPayload): Promise<{ receiptId: string }>;
  submitCis(companyId: string, data: CisVerificationPayload): Promise<{ status: string; ref?: string }>;
  submitRti(companyId: string, data: RtiSubmissionPayload): Promise<{ submissionId: string }>;
}
