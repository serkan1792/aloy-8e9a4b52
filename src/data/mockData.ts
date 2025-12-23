import { Account, Company, Contact, Ticket, Message, Agent, Team, Tag, QuestionType, AccountPartner, MrrChange } from '@/types';

// UUID constants for consistent referencing
const UUID = {
  // Accounts
  ACC_1: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ACC_2: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  
  // MRR Changes
  MRR_1: 'rrrr1111-rrrr-1111-rrrr-111111111111',
  MRR_2: 'rrrr2222-rrrr-2222-rrrr-222222222222',
  MRR_3: 'rrrr3333-rrrr-3333-rrrr-333333333333',
  MRR_4: 'rrrr4444-rrrr-4444-rrrr-444444444444',
  MRR_5: 'rrrr5555-rrrr-5555-rrrr-555555555555',
  MRR_6: 'rrrr6666-rrrr-6666-rrrr-666666666666',
  
  // Companies
  COMP_1: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  COMP_2: 'd4e5f6a7-b8c9-0123-def1-234567890123',
  COMP_3: 'e5f6a7b8-c9d0-1234-ef12-345678901234',
  COMP_4: 'f6a7b8c9-d0e1-2345-f123-456789012345',
  
  // Contacts
  CON_1: '11111111-1111-1111-1111-111111111111',
  CON_2: '22222222-2222-2222-2222-222222222222',
  CON_3: '33333333-3333-3333-3333-333333333333',
  CON_4: '44444444-4444-4444-4444-444444444444',
  
  // Agents
  AGENT_1: 'aaaa1111-aaaa-1111-aaaa-111111111111',
  AGENT_2: 'aaaa2222-aaaa-2222-aaaa-222222222222',
  AGENT_3: 'aaaa3333-aaaa-3333-aaaa-333333333333',
  
  // Teams
  TEAM_1: 'tttt1111-tttt-1111-tttt-111111111111',
  TEAM_2: 'tttt2222-tttt-2222-tttt-222222222222',
  TEAM_3: 'tttt3333-tttt-3333-tttt-333333333333',
  
  // Tags
  TAG_1: 'gggg1111-gggg-1111-gggg-111111111111',
  TAG_2: 'gggg2222-gggg-2222-gggg-222222222222',
  TAG_3: 'gggg3333-gggg-3333-gggg-333333333333',
  TAG_4: 'gggg4444-gggg-4444-gggg-444444444444',
  
  // Question Types
  QT_1: 'qqqq1111-qqqq-1111-qqqq-111111111111',
  QT_2: 'qqqq2222-qqqq-2222-qqqq-222222222222',
  QT_3: 'qqqq3333-qqqq-3333-qqqq-333333333333',
  QT_4: 'qqqq4444-qqqq-4444-qqqq-444444444444',
  
  // Tickets
  TICK_1: 'dddd1111-dddd-1111-dddd-111111111111',
  TICK_2: 'dddd2222-dddd-2222-dddd-222222222222',
  TICK_3: 'dddd3333-dddd-3333-dddd-333333333333',
  TICK_4: 'dddd4444-dddd-4444-dddd-444444444444',
  TICK_5: 'dddd5555-dddd-5555-dddd-555555555555',
  TICK_6: 'dddd6666-dddd-6666-dddd-666666666666',
  
  // Messages
  MSG_1: 'mmmm1111-mmmm-1111-mmmm-111111111111',
  MSG_2: 'mmmm2222-mmmm-2222-mmmm-222222222222',
  MSG_3: 'mmmm3333-mmmm-3333-mmmm-333333333333',
  MSG_4: 'mmmm4444-mmmm-4444-mmmm-444444444444',
  MSG_5: 'mmmm5555-mmmm-5555-mmmm-555555555555',
  MSG_6: 'mmmm6666-mmmm-6666-mmmm-666666666666',
  MSG_7: 'mmmm7777-mmmm-7777-mmmm-777777777777',
  MSG_8: 'mmmm8888-mmmm-8888-mmmm-888888888888',
  MSG_INT_1: 'iiii1111-iiii-1111-iiii-111111111111',
  MSG_INT_2: 'iiii2222-iiii-2222-iiii-222222222222',
};

export const accounts: Account[] = [
  { 
    id: UUID.ACC_1, 
    name: 'Acme Corp Global', 
    planId: 'enterprise', 
    tierId: 'unlimited',
    firstResponseSlaHours: 4,
    currentMrr: 149900, // Will be calculated from plan + tier
    contractEndDate: new Date('2025-12-31'),
    autoRenew: true,
    labelIds: ['strategic', 'vip'],
  },
  { 
    id: UUID.ACC_2, 
    name: 'TechStart Inc', 
    planId: 'basic', 
    tierId: 'professional',
    firstResponseSlaHours: 4,
    currentMrr: 29900, // Will be calculated from plan + tier
    contractEndDate: new Date('2025-06-30'),
    autoRenew: false,
    labelIds: ['new', 'expansion'],
  },
];

export const mrrChanges: MrrChange[] = [
  // Acme Corp history
  {
    id: UUID.MRR_1,
    accountId: UUID.ACC_1,
    date: new Date('2023-01-15'),
    previousMrr: 0,
    newMrr: 500000,
    changeType: 'new',
    reason: 'Neukunde - Enterprise Start',
  },
  {
    id: UUID.MRR_2,
    accountId: UUID.ACC_1,
    date: new Date('2023-06-01'),
    previousMrr: 500000,
    newMrr: 800000,
    changeType: 'upgrade',
    reason: 'Erweiterung um 3 zusätzliche Lizenzen',
  },
  {
    id: UUID.MRR_3,
    accountId: UUID.ACC_1,
    date: new Date('2024-01-01'),
    previousMrr: 800000,
    newMrr: 1500000,
    changeType: 'upgrade',
    reason: 'Jahresreview - Expansion auf US-Team',
  },
  // TechStart history
  {
    id: UUID.MRR_4,
    accountId: UUID.ACC_2,
    date: new Date('2024-03-01'),
    previousMrr: 0,
    newMrr: 9900,
    changeType: 'new',
    reason: 'Neukunde - Basic Plan',
  },
  {
    id: UUID.MRR_5,
    accountId: UUID.ACC_2,
    date: new Date('2024-07-01'),
    previousMrr: 9900,
    newMrr: 29900,
    changeType: 'upgrade',
    reason: 'Upgrade auf Basic Pro nach Trial',
  },
];

export const companies: Company[] = [
  { id: UUID.COMP_1, accountId: UUID.ACC_1, name: 'Acme Germany', domain: 'acme.de', externalId: 'CRM-001', type: 'Kunde' },
  { id: UUID.COMP_2, accountId: UUID.ACC_1, name: 'Acme USA', domain: 'acme.com', externalId: 'CRM-002', type: 'Kunde' },
  { id: UUID.COMP_3, accountId: UUID.ACC_2, name: 'TechStart Berlin', domain: 'techstart.de', type: 'Kunde' },
  { id: UUID.COMP_4, name: 'Digital Agency Partners', domain: 'digitalagency.de', type: 'Partner' },
];

// Partner companies can be assigned to multiple accounts
export const accountPartners: AccountPartner[] = [
  { accountId: UUID.ACC_1, companyId: UUID.COMP_4, note: 'Betreuung für technische Integrationen' },
  { accountId: UUID.ACC_2, companyId: UUID.COMP_4, note: 'Support-Eskalation' },
];

export const contacts: Contact[] = [
  { id: UUID.CON_1, companyId: UUID.COMP_1, name: 'Max Müller', email: 'max@acme.de', phone: '+49 151 12345678', slackHandle: '@max.mueller' },
  { id: UUID.CON_2, companyId: UUID.COMP_1, name: 'Anna Schmidt', email: 'anna@acme.de', phone: '+49 151 87654321', slackHandle: '@anna.s' },
  { id: UUID.CON_3, companyId: UUID.COMP_2, name: 'John Smith', email: 'john@acme.com', phone: '+1 555 123 4567', slackHandle: '@johnsmith' },
  { id: UUID.CON_4, companyId: UUID.COMP_3, name: 'Lisa Weber', email: 'lisa@techstart.de', slackHandle: '@lisa.w' },
];

export const agents: Agent[] = [
  { id: UUID.AGENT_1, name: 'Sarah König', email: 'sarah@supporthub.de' },
  { id: UUID.AGENT_2, name: 'Tom Bauer', email: 'tom@supporthub.de' },
  { id: UUID.AGENT_3, name: 'Julia Hoffmann', email: 'julia@supporthub.de' },
];

export const teams: Team[] = [
  { id: UUID.TEAM_1, name: 'Support Level 1', memberIds: [UUID.AGENT_1, UUID.AGENT_2] },
  { id: UUID.TEAM_2, name: 'Support Level 2', memberIds: [UUID.AGENT_2, UUID.AGENT_3] },
  { id: UUID.TEAM_3, name: 'Enterprise Support', memberIds: [UUID.AGENT_1, UUID.AGENT_3] },
];

export const tags: Tag[] = [
  { id: UUID.TAG_1, name: 'Rechnungsfrage', color: 'hsl(221, 83%, 53%)' },
  { id: UUID.TAG_2, name: 'Non Technical', color: 'hsl(142, 71%, 45%)' },
  { id: UUID.TAG_3, name: 'Urgent', color: 'hsl(0, 84%, 60%)' },
  { id: UUID.TAG_4, name: 'Documentation', color: 'hsl(262, 83%, 58%)' },
];

export const questionTypes: QuestionType[] = [
  { id: UUID.QT_1, name: 'Bugs', color: 'hsl(0, 84%, 60%)' },
  { id: UUID.QT_2, name: 'Feature Request', color: 'hsl(142, 71%, 45%)' },
  { id: UUID.QT_3, name: 'How-To', color: 'hsl(221, 83%, 53%)' },
  { id: UUID.QT_4, name: 'Account & Billing', color: 'hsl(38, 92%, 50%)' },
];

export const initialTickets: Ticket[] = [
  {
    id: UUID.TICK_1,
    accountId: UUID.ACC_1,
    contactId: UUID.CON_1,
    title: 'Login-Probleme nach Passwort-Reset',
    status: 'Neu',
    priority: 'High',
    source: 'Slack',
    createdAt: new Date('2024-01-15T09:30:00'),
    updatedAt: new Date('2024-01-15T10:45:00'),
    assigneeId: UUID.AGENT_1,
    teamId: UUID.TEAM_1,
    tagIds: [UUID.TAG_3],
    questionTypeId: UUID.QT_1,
  },
  {
    id: UUID.TICK_2,
    accountId: UUID.ACC_1,
    contactId: UUID.CON_2,
    title: 'API Rate Limiting Frage',
    status: 'On You',
    priority: 'Medium',
    source: 'Email',
    createdAt: new Date('2024-01-14T14:20:00'),
    updatedAt: new Date('2024-01-15T08:00:00'),
    assigneeId: UUID.AGENT_2,
    teamId: UUID.TEAM_2,
    tagIds: [UUID.TAG_4],
    questionTypeId: UUID.QT_3,
  },
  {
    id: UUID.TICK_3,
    accountId: UUID.ACC_1,
    contactId: UUID.CON_3,
    title: 'Enterprise Feature Request - SSO',
    status: 'On Customer',
    priority: 'Medium',
    source: 'Email',
    createdAt: new Date('2024-01-13T11:00:00'),
    updatedAt: new Date('2024-01-14T16:30:00'),
    assigneeId: UUID.AGENT_1,
    teamId: UUID.TEAM_3,
    tagIds: [],
    questionTypeId: UUID.QT_2,
  },
  {
    id: UUID.TICK_4,
    accountId: UUID.ACC_2,
    contactId: UUID.CON_4,
    title: 'Billing Frage - Upgrade auf Enterprise',
    status: 'On Hold',
    priority: 'Low',
    source: 'Chat',
    createdAt: new Date('2024-01-12T16:45:00'),
    updatedAt: new Date('2024-01-13T09:15:00'),
    assigneeId: UUID.AGENT_3,
    tagIds: [UUID.TAG_1, UUID.TAG_2],
    questionTypeId: UUID.QT_4,
  },
  {
    id: UUID.TICK_5,
    accountId: UUID.ACC_1,
    contactId: UUID.CON_1,
    title: 'Webhook Integration erfolgreich',
    status: 'Closed',
    priority: 'Low',
    source: 'Slack',
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-11T14:00:00'),
    assigneeId: UUID.AGENT_2,
    tagIds: [],
    questionTypeId: UUID.QT_3,
  },
  {
    id: UUID.TICK_6,
    accountId: UUID.ACC_1,
    contactId: UUID.CON_2,
    title: 'Dashboard lädt nicht korrekt',
    status: 'Neu',
    priority: 'High',
    source: 'Slack',
    createdAt: new Date('2024-01-15T11:00:00'),
    updatedAt: new Date('2024-01-15T11:00:00'),
    tagIds: [UUID.TAG_3],
    questionTypeId: UUID.QT_1,
  },
];

export const initialMessages: Message[] = [
  {
    id: UUID.MSG_1,
    ticketId: UUID.TICK_1,
    content: 'Hallo, ich kann mich nach dem Passwort-Reset nicht mehr einloggen. Bekomme immer "Invalid credentials".',
    senderType: 'Customer',
    channel: 'Slack',
    timestamp: new Date('2024-01-15T09:30:00'),
    messageType: 'external',
  },
  {
    id: UUID.MSG_2,
    ticketId: UUID.TICK_1,
    content: 'Hallo Max, das tut mir leid zu hören. Kannst du mir sagen, ob du die Bestätigungs-Email für den Reset erhalten hast?',
    senderType: 'Agent',
    channel: 'Slack',
    timestamp: new Date('2024-01-15T09:45:00'),
    messageType: 'external',
    authorId: UUID.AGENT_1,
  },
  {
    id: UUID.MSG_3,
    ticketId: UUID.TICK_1,
    content: 'Ja, die Email kam an und ich habe ein neues Passwort gesetzt. Aber der Login klappt trotzdem nicht.',
    senderType: 'Customer',
    channel: 'Slack',
    timestamp: new Date('2024-01-15T10:00:00'),
    messageType: 'external',
  },
  {
    id: UUID.MSG_INT_1,
    ticketId: UUID.TICK_1,
    content: 'Könnte ein Cache-Problem sein. @Tom, kannst du mal in die Logs schauen?',
    senderType: 'Agent',
    channel: 'Slack',
    timestamp: new Date('2024-01-15T10:05:00'),
    messageType: 'internal',
    authorId: UUID.AGENT_1,
  },
  {
    id: UUID.MSG_INT_2,
    ticketId: UUID.TICK_1,
    content: 'Habe die Logs gecheckt. Sieht nach einem Session-Token Problem aus. Ich resette das mal.',
    senderType: 'Agent',
    channel: 'Slack',
    timestamp: new Date('2024-01-15T10:15:00'),
    messageType: 'internal',
    authorId: UUID.AGENT_2,
  },
  {
    id: UUID.MSG_4,
    ticketId: UUID.TICK_2,
    content: 'Wir planen eine größere Integration und möchten wissen, wie die API Rate Limits genau funktionieren.',
    senderType: 'Customer',
    channel: 'Email',
    timestamp: new Date('2024-01-14T14:20:00'),
    messageType: 'external',
  },
  {
    id: UUID.MSG_5,
    ticketId: UUID.TICK_2,
    content: 'Guten Tag, unsere API erlaubt standardmäßig 1000 Requests pro Minute. Bei Enterprise-Plänen kann das erhöht werden.',
    senderType: 'Agent',
    channel: 'Email',
    timestamp: new Date('2024-01-14T15:00:00'),
    messageType: 'external',
    authorId: UUID.AGENT_2,
  },
  {
    id: UUID.MSG_6,
    ticketId: UUID.TICK_3,
    content: 'Wir benötigen SAML SSO für unsere US-Niederlassung. Ist das im Enterprise Plan enthalten?',
    senderType: 'Customer',
    channel: 'Email',
    timestamp: new Date('2024-01-13T11:00:00'),
    messageType: 'external',
  },
  {
    id: UUID.MSG_7,
    ticketId: UUID.TICK_3,
    content: 'Ja, SAML SSO ist im Enterprise Plan enthalten. Ich sende Ihnen die Dokumentation zur Einrichtung.',
    senderType: 'Agent',
    channel: 'Email',
    timestamp: new Date('2024-01-13T14:00:00'),
    messageType: 'external',
    authorId: UUID.AGENT_1,
  },
  {
    id: UUID.MSG_8,
    ticketId: UUID.TICK_3,
    content: 'Danke! Ich leite das an unsere IT weiter und melde mich wenn wir Fragen haben.',
    senderType: 'Customer',
    channel: 'Email',
    timestamp: new Date('2024-01-14T16:30:00'),
    messageType: 'external',
  },
];

// Helper function to generate new UUIDs for new entities
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find(c => c.id === id);
};

export const getContactById = (id: string): Contact | undefined => {
  return contacts.find(c => c.id === id);
};

export const getAccountById = (id: string): Account | undefined => {
  return accounts.find(a => a.id === id);
};

export const getAgentById = (id: string): Agent | undefined => {
  return agents.find(a => a.id === id);
};

export const getTeamById = (id: string): Team | undefined => {
  return teams.find(t => t.id === id);
};

export const getTagById = (id: string): Tag | undefined => {
  return tags.find(t => t.id === id);
};

export const getQuestionTypeById = (id: string): QuestionType | undefined => {
  return questionTypes.find(qt => qt.id === id);
};

export const getCompanyByContactId = (contactId: string): Company | undefined => {
  const contact = getContactById(contactId);
  if (!contact) return undefined;
  return getCompanyById(contact.companyId);
};

// Get all companies directly assigned to an account (Kunde type)
export const getCompaniesByAccountId = (accountId: string): Company[] => {
  return companies.filter(c => c.type === 'Kunde' && c.accountId === accountId);
};

// Get partner companies assigned to an account via AccountPartner
export const getPartnersByAccountId = (accountId: string): Company[] => {
  const partnerIds = accountPartners
    .filter(ap => ap.accountId === accountId)
    .map(ap => ap.companyId);
  return companies.filter(c => partnerIds.includes(c.id));
};

// Get all companies (Kunden + Partner) associated with an account
export const getAllCompaniesByAccountId = (accountId: string): Company[] => {
  const kundenCompanies = getCompaniesByAccountId(accountId);
  const partnerCompanies = getPartnersByAccountId(accountId);
  return [...kundenCompanies, ...partnerCompanies];
};

// Get accounts associated with a partner company
export const getAccountsByPartnerId = (companyId: string): Account[] => {
  const accountIds = accountPartners
    .filter(ap => ap.companyId === companyId)
    .map(ap => ap.accountId);
  return accounts.filter(a => accountIds.includes(a.id));
};

// Get the account for a company (direct for Kunde, undefined for Partner without context)
export const getAccountByCompanyId = (companyId: string): Account | undefined => {
  const company = getCompanyById(companyId);
  if (!company) return undefined;
  if (company.type === 'Kunde' && company.accountId) {
    return getAccountById(company.accountId);
  }
  return undefined;
};

export const getContactsByCompanyId = (companyId: string): Contact[] => {
  return contacts.filter(c => c.companyId === companyId);
};

export const getContactsByAccountId = (accountId: string): Contact[] => {
  const accountCompanies = getAllCompaniesByAccountId(accountId);
  const companyIds = accountCompanies.map(c => c.id);
  return contacts.filter(c => companyIds.includes(c.companyId));
};

export const getRecentTicketsByAccountId = (accountId: string, excludeTicketId: string, limit = 10): Ticket[] => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return initialTickets
    .filter(t => t.accountId === accountId && t.id !== excludeTicketId && t.createdAt >= oneYearAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const getMrrChangesByAccountId = (accountId: string): MrrChange[] => {
  return mrrChanges
    .filter(m => m.accountId === accountId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getAllMrrChanges = (): MrrChange[] => {
  return [...mrrChanges].sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getTotalMrr = (): number => {
  return accounts.reduce((sum, acc) => sum + acc.currentMrr, 0);
};

export const getAccountsExpiringWithin = (days: number): Account[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return accounts.filter(acc => {
    const endDate = acc.contractEndDate;
    return endDate >= now && endDate <= futureDate;
  });
};
