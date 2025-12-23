import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Account, Company, Contact, Ticket } from '@/types';
import { initialTickets, getContactById, accountPartners } from '@/data/mockData';
import { Building2, Users, Ticket as TicketIcon, Clock, Mail, Calendar, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';

interface AccountDetailSheetProps {
  account: Account | null;
  companies: Company[];
  contacts: Contact[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyClick?: (companyId: string) => void;
  onContactClick?: (contactId: string) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (accountId: string) => void;
}

export function AccountDetailSheet({ 
  account, 
  companies,
  contacts,
  open, 
  onOpenChange,
  onCompanyClick,
  onContactClick,
  onEdit,
  onDelete
}: AccountDetailSheetProps) {
  if (!account) return null;

  // Direct Kunde companies
  const kundenCompanies = companies.filter(c => c.type === 'Kunde' && c.accountId === account.id);
  
  // Partner companies via junction table
  const partnerCompanyIds = accountPartners
    .filter(ap => ap.accountId === account.id)
    .map(ap => ap.companyId);
  const partnerCompanies = companies.filter(c => partnerCompanyIds.includes(c.id));
  
  const allAccountCompanies = [...kundenCompanies, ...partnerCompanies];
  const companyIds = allAccountCompanies.map(c => c.id);
  const accountContacts = contacts.filter(c => companyIds.includes(c.companyId));
  const accountTickets = initialTickets
    .filter(t => t.accountId === account.id)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const openTickets = accountTickets.filter(t => t.status !== 'Closed');

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

  const { getAccountPlanDisplay, isPremiumPlan } = usePlanDisplay();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{account.name}</SheetTitle>
              <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'} className="mt-2">
                {getAccountPlanDisplay(account)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="icon" onClick={() => onEdit(account)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="icon" onClick={() => onDelete(account.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-6 pr-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{allAccountCompanies.length}</span>
              <span className="text-xs text-muted-foreground">Unternehmen</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{accountContacts.length}</span>
              <span className="text-xs text-muted-foreground">Kontakte</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <TicketIcon className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{openTickets.length}/{accountTickets.length}</span>
              <span className="text-xs text-muted-foreground">Offen/Gesamt</span>
            </div>
          </div>

          {/* SLA Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mb-6">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">First Response SLA: <strong>{account.firstResponseSlaHours} Stunden</strong></span>
          </div>

          <Separator className="my-4" />

          {/* Kunde Companies */}
          {kundenCompanies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Kunden-Unternehmen ({kundenCompanies.length})
              </h3>
              <div className="space-y-2">
                {kundenCompanies.map((company) => {
                  const companyContacts = contacts.filter(c => c.companyId === company.id);
                  return (
                    <div 
                      key={company.id} 
                      className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onCompanyClick?.(company.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{company.name}</span>
                        <Badge variant="outline" className="text-xs">{companyContacts.length} Kontakte</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{company.domain}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Partner Companies */}
          {partnerCompanies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Partner ({partnerCompanies.length})
              </h3>
              <div className="space-y-2">
                {partnerCompanies.map((company) => {
                  const partnerInfo = accountPartners.find(
                    ap => ap.accountId === account.id && ap.companyId === company.id
                  );
                  const companyContacts = contacts.filter(c => c.companyId === company.id);
                  return (
                    <div 
                      key={company.id} 
                      className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onCompanyClick?.(company.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{company.name}</span>
                          <Badge variant="secondary" className="text-xs">Partner</Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">{companyContacts.length} Kontakte</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{company.domain}</p>
                      {partnerInfo?.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{partnerInfo.note}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Contacts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kontakte ({accountContacts.length})
            </h3>
            <div className="space-y-2">
              {accountContacts.slice(0, 5).map((contact) => {
                const company = companies.find(c => c.id === contact.companyId);
                return (
                  <div 
                    key={contact.id} 
                    className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onContactClick?.(contact.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-xs text-muted-foreground">{company?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </span>
                    </div>
                  </div>
                );
              })}
              {accountContacts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  +{accountContacts.length - 5} weitere Kontakte
                </p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Recent Tickets */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Tickets ({accountTickets.length})
            </h3>
            <div className="space-y-2">
              {accountTickets.slice(0, 10).map((ticket) => {
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
              {accountTickets.length > 10 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  +{accountTickets.length - 10} weitere Tickets
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
