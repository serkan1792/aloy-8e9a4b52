import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Account, Company, Contact, Ticket, AccountPartner } from '@/types';
import { initialTickets, getContactById } from '@/data/mockData';
import { Building2, Users, Ticket as TicketIcon, ExternalLink, Mail, Phone, MessageSquare, Calendar, Pencil, Trash2, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';

interface CompanyDetailSheetProps {
  company: Company | null;
  accounts: Account[];
  contacts: Contact[];
  accountPartners: AccountPartner[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountClick?: (accountId: string) => void;
  onContactClick?: (contactId: string) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (companyId: string) => void;
  onManagePartners?: (company: Company) => void;
}

export function CompanyDetailSheet({ 
  company, 
  accounts,
  contacts,
  accountPartners,
  open, 
  onOpenChange,
  onAccountClick,
  onContactClick,
  onEdit,
  onDelete,
  onManagePartners
}: CompanyDetailSheetProps) {
  if (!company) return null;
  
  const { getAccountPlanDisplay, isPremiumPlan } = usePlanDisplay();

  // For Kunde: direct account, for Partner: multiple accounts via accountPartners
  const directAccount = company.type === 'Kunde' && company.accountId 
    ? accounts.find(a => a.id === company.accountId) 
    : null;
  
  const partnerAccounts = company.type === 'Partner'
    ? accountPartners
        .filter(ap => ap.companyId === company.id)
        .map(ap => ({
          account: accounts.find(a => a.id === ap.accountId),
          note: ap.note
        }))
        .filter(item => item.account)
    : [];

  const companyContacts = contacts.filter(c => c.companyId === company.id);
  
  // Get tickets from contacts of this company
  const companyTickets = initialTickets
    .filter(t => {
      if (!t.contactId) return false;
      const contact = getContactById(t.contactId);
      return contact?.companyId === company.id;
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const openTickets = companyTickets.filter(t => t.status !== 'Closed');

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Neu': return 'bg-blue-500';
      case 'On You': return 'bg-yellow-500';
      case 'On Customer': return 'bg-purple-500';
      case 'On Hold': return 'bg-gray-500';
      case 'Closed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'High': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'Medium': return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'Low': return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {company.name}
                <Badge variant={company.type === 'Partner' ? 'secondary' : 'outline'} className="ml-2">
                  {company.type}
                </Badge>
              </SheetTitle>
              <a 
                href={`https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                {company.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              {company.type === 'Partner' && onManagePartners && (
                <Button variant="outline" size="icon" onClick={() => onManagePartners(company)} title="Account-Zuordnungen verwalten">
                  <Link2 className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="icon" onClick={() => onEdit(company)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="icon" onClick={() => onDelete(company.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {/* Account Info for Kunde */}
          {directAccount && (
            <div 
              className="p-4 rounded-lg border border-border bg-muted/30 mb-6 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onAccountClick?.(directAccount.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className="font-semibold">{directAccount.name}</p>
                </div>
                <Badge variant={isPremiumPlan(directAccount.planId) ? 'default' : 'secondary'}>
                  {getAccountPlanDisplay(directAccount)}
                </Badge>
              </div>
            </div>
          )}

          {/* Partner Accounts */}
          {partnerAccounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Zugeordnete Accounts ({partnerAccounts.length})
              </h3>
              <div className="space-y-2">
                {partnerAccounts.map(({ account, note }) => account && (
                  <div 
                    key={account.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onAccountClick?.(account.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
                      </div>
                      <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'}>
                        {getAccountPlanDisplay(account)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{companyContacts.length}</span>
              <span className="text-xs text-muted-foreground">Kontakte</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <TicketIcon className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{openTickets.length}/{companyTickets.length}</span>
              <span className="text-xs text-muted-foreground">Offen/Gesamt</span>
            </div>
          </div>

          {/* Company Details */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border mb-6">
            {company.externalId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">External ID</span>
                <span className="font-mono text-sm">{company.externalId}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Contacts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kontakte ({companyContacts.length})
            </h3>
            <div className="space-y-2">
              {companyContacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onContactClick?.(contact.id)}
                >
                  <div className="font-medium">{contact.name}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {contact.slackHandle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Recent Tickets */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Tickets ({companyTickets.length})
            </h3>
            <div className="space-y-2">
              {companyTickets.slice(0, 10).map((ticket) => {
                const contact = getContactById(ticket.contactId);
                return (
                  <div 
                    key={ticket.id} 
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                          <span className="font-medium text-sm truncate">{ticket.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{contact?.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(ticket.updatedAt, 'dd. MMM yyyy', { locale: de })}
                          </span>
                        </div>
                      </div>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                );
              })}
              {companyTickets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Tickets vorhanden
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
