export interface BankingTransaction { id: string; amount: number; currency: string; date: string; description?: string }
export interface BankingConsent { url: string; consentId: string }

export interface BankingPort {
  createConsent(redirectUri: string): Promise<BankingConsent>;
  listTransactions(companyId: string, from: string, to: string): Promise<BankingTransaction[]>;
}
