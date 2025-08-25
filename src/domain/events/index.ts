export type DomainEvent =
  | { type: 'reminder.created'; reminderId: string; companyId: string }
  | { type: 'hmrc.vat.submitted'; companyId: string; receiptId: string }
  | { type: 'hmrc.cis.submitted'; companyId: string; ref?: string }
  | { type: 'hmrc.rti.submitted'; companyId: string; submissionId: string };

export type EventHandler = (evt: DomainEvent) => void | Promise<void>;
