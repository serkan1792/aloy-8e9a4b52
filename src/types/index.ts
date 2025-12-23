// Pricing Plan configuration
export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  order: number; // For sorting in UI
}

// Pricing Tier configuration
export interface PricingTier {
  id: string;
  name: string;
  description?: string;
  order: number; // For sorting in UI
}

// Price matrix: Plan + Tier = MRR
export interface PricingMatrix {
  planId: string;
  tierId: string;
  mrrCents: number; // Monthly price in cents
}

// Default plans
export const DEFAULT_PLANS: PricingPlan[] = [
  { id: 'basic', name: 'Basic', description: 'Für kleine Teams', order: 1 },
  { id: 'enterprise', name: 'Enterprise', description: 'Für große Unternehmen', order: 2 },
];

// Default tiers
export const DEFAULT_TIERS: PricingTier[] = [
  { id: 'starter', name: 'Starter', description: 'Bis 10 Nutzer', order: 1 },
  { id: 'professional', name: 'Professional', description: 'Bis 50 Nutzer', order: 2 },
  { id: 'unlimited', name: 'Unlimited', description: 'Unbegrenzte Nutzer', order: 3 },
];

// Default price matrix
export const DEFAULT_PRICING_MATRIX: PricingMatrix[] = [
  { planId: 'basic', tierId: 'starter', mrrCents: 9900 },      // €99
  { planId: 'basic', tierId: 'professional', mrrCents: 29900 }, // €299
  { planId: 'basic', tierId: 'unlimited', mrrCents: 49900 },   // €499
  { planId: 'enterprise', tierId: 'starter', mrrCents: 49900 }, // €499
  { planId: 'enterprise', tierId: 'professional', mrrCents: 99900 }, // €999
  { planId: 'enterprise', tierId: 'unlimited', mrrCents: 149900 }, // €1499
];

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export interface AppSettings {
  currency: Currency;
  onboardingCompleted: boolean;
}

export type TicketStatus = 'Neu' | 'On You' | 'On Customer' | 'On Hold' | 'Closed';

export type Priority = 'High' | 'Medium' | 'Low';

export type Source = 'Slack' | 'Email' | 'Chat';

export type SenderType = 'Agent' | 'Customer';

export type Channel = 'Slack' | 'Email';

export type MessageType = 'external' | 'internal';

export type CompanyType = 'Kunde' | 'Partner';

export interface AccountLabel {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_ACCOUNT_LABELS: AccountLabel[] = [
  { id: 'strategic', name: 'Strategisch', color: 'hsl(262, 83%, 58%)' },
  { id: 'at-risk', name: 'At Risk', color: 'hsl(0, 84%, 60%)' },
  { id: 'expansion', name: 'Expansion', color: 'hsl(142, 71%, 45%)' },
  { id: 'new', name: 'Neukunde', color: 'hsl(221, 83%, 53%)' },
  { id: 'vip', name: 'VIP', color: 'hsl(38, 92%, 50%)' },
];

export interface Account {
  id: string;
  name: string;
  planId: string; // Reference to PricingPlan id
  tierId: string; // Reference to PricingTier id
  firstResponseSlaHours: number; // SLA in hours, default 4
  currentMrr: number; // Current Monthly Recurring Revenue in cents (auto-calculated from plan+tier)
  mrrOverride?: number; // Optional manual override for custom pricing
  contractEndDate: Date;
  autoRenew: boolean;
  labelIds: string[]; // Reference to AccountLabel ids
}

export type MrrChangeType = 'new' | 'upgrade' | 'downgrade' | 'churn' | 'reactivation';

export interface MrrChange {
  id: string;
  accountId: string;
  date: Date;
  previousMrr: number;
  newMrr: number;
  changeType: MrrChangeType;
  reason: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  externalId?: string; // Optional ID for external CRM/system integration
  type: CompanyType;
  accountId?: string; // Only for "Kunde" type, undefined for "Partner"
}

// Junction table for Partner companies assigned to multiple Accounts
export interface AccountPartner {
  accountId: string;
  companyId: string;
  note?: string; // Optional note about the relationship
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  slackHandle: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[]; // Agent IDs
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface QuestionType {
  id: string;
  name: string;
  color: string;
}

export interface Ticket {
  id: string;
  accountId: string;
  contactId?: string; // Optional - for system-generated or imported tickets
  title: string;
  status: TicketStatus;
  priority: Priority;
  source: Source;
  createdAt: Date;
  updatedAt: Date;
  assigneeId?: string;
  teamId?: string;
  tagIds: string[];
  questionTypeId?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  content: string;
  senderType: SenderType;
  channel: Channel;
  timestamp: Date;
  messageType: MessageType;
  authorId?: string; // Agent ID for internal notes
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TicketFilters {
  statuses: TicketStatus[];
  priorities: Priority[];
  sources: Source[];
  assigneeIds: string[];
  companyIds: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface SavedView {
  id: string;
  name: string;
  filters: TicketFilters;
  createdAt: Date;
}

export const defaultFilters: TicketFilters = {
  statuses: [],
  priorities: [],
  sources: [],
  assigneeIds: [],
  companyIds: [],
  dateRange: {
    from: null,
    to: null,
  },
};

// Section order for the info panel (drag-and-drop reorderable)
export type InfoPanelSection = 'details' | 'account' | 'contact' | 'recentIssues';

export const defaultSectionOrder: InfoPanelSection[] = ['details', 'account', 'contact', 'recentIssues'];
