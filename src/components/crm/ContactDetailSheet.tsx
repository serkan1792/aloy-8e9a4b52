import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Account, Company, Contact, Ticket } from '@/types';
import { initialTickets } from '@/data/mockData';
import { Building2, Mail, Phone, MessageSquare, Ticket as TicketIcon, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';

interface ContactDetailSheetProps {
  contact: Contact | null;
  companies: Company[];
  accounts: Account[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyClick?: (companyId: string) => void;
  onAccountClick?: (accountId: string) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactDetailSheet({ 
  contact, 
  companies,
  accounts,
  open, 
  onOpenChange,
  onCompanyClick,
  onAccountClick,
  onEdit,
  onDelete
}: ContactDetailSheetProps) {
  if (!contact) return null;
  
  const { getAccountPlanDisplay, isPremiumPlan } = usePlanDisplay();

  const company = companies.find(c => c.id === contact.companyId);
  // For Kunde companies, get the direct account; for Partner companies, account is not directly linked
  const account = company?.type === 'Kunde' && company?.accountId 
    ? accounts.find(a => a.id === company.accountId) 
    : null;
  
  const contactTickets = initialTickets
    .filter(t => t.contactId === contact.id)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const openTickets = contactTickets.filter(t => t.status !== 'Closed');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-xl">{contact.name}</SheetTitle>
                {company && (
                  <p className="text-sm text-muted-foreground mt-1">{company.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="icon" onClick={() => onEdit(contact)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="icon" onClick={() => onDelete(contact.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {/* Contact Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                E-Mail senden
              </a>
            </Button>
            {contact.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Anrufen
                </a>
              </Button>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">E-Mail</p>
                <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            </div>
            
            {contact.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Slack</p>
                <span className="text-sm font-mono">{contact.slackHandle}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Company & Account */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organisation
            </h3>
            
            {company && (
              <div 
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onCompanyClick?.(company.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Unternehmen</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  <a 
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.domain}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
            
            {account && (
              <div 
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onAccountClick?.(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Account</p>
                    <p className="font-medium">{account.name}</p>
                  </div>
                  <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'}>
                    {getAccountPlanDisplay(account)}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Ticket Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <TicketIcon className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-lg font-semibold">{contactTickets.length}</span>
              <span className="text-xs text-muted-foreground">Gesamt</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <TicketIcon className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="text-lg font-semibold">{openTickets.length}</span>
              <span className="text-xs text-muted-foreground">Offen</span>
            </div>
          </div>

          {/* Tickets Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Ticket-Verlauf
            </h3>
            <div className="space-y-2">
              {contactTickets.map((ticket) => (
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
                        <Badge variant="outline" className="text-xs">{ticket.status}</Badge>
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
              ))}
              {contactTickets.length === 0 && (
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
