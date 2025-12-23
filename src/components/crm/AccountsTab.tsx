import { useState, useCallback } from 'react';
import { initialTickets } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Building2, Ticket, Search, Users, Plus, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { AccountDetailSheet } from './AccountDetailSheet';
import { CompanyDetailSheet } from './CompanyDetailSheet';
import { ContactDetailSheet } from './ContactDetailSheet';
import { AccountFormDialog } from './AccountFormDialog';
import { CompanyFormDialog } from './CompanyFormDialog';
import { ContactFormDialog } from './ContactFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ColumnConfigDropdown } from './ColumnConfigDropdown';
import { SortableTableHead } from './SortableTableHead';
import { Account, Company, Contact, AccountPartner, DEFAULT_ACCOUNT_LABELS } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useColumnConfig, ColumnDefinition } from '@/hooks/useColumnConfig';
import { useDynamicTableSort } from '@/hooks/useTableSort';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ACCOUNT_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'Account', defaultVisible: true },
  { id: 'mrr', label: 'MRR', defaultVisible: true },
  { id: 'plan', label: 'Plan', defaultVisible: true },
  { id: 'labels', label: 'Labels', defaultVisible: true },
  { id: 'companies', label: 'Unternehmen', defaultVisible: true },
  { id: 'contacts', label: 'Kontakte', defaultVisible: true },
  { id: 'sla', label: 'SLA (Stunden)', defaultVisible: false },
  { id: 'contractEnd', label: 'Vertragsende', defaultVisible: false },
  { id: 'autoRenew', label: 'Auto-Renew', defaultVisible: false },
  { id: 'tickets', label: 'Tickets', defaultVisible: false },
];
interface AccountsTabProps {
  accounts: Account[];
  companies: Company[];
  contacts: Contact[];
  accountPartners: AccountPartner[];
  onSaveAccount: (account: Omit<Account, 'id'> & { id?: string }) => void;
  onDeleteAccount: (accountId: string) => void;
  onSaveCompany: (company: Omit<Company, 'id'> & { id?: string }) => void;
  onDeleteCompany: (companyId: string) => void;
  onSaveContact: (contact: Omit<Contact, 'id'> & { id?: string }) => void;
  onDeleteContact: (contactId: string) => void;
  onAddAccountPartner: (partner: AccountPartner) => void;
  onRemoveAccountPartner: (accountId: string, companyId: string) => void;
  onUpdateAccountPartnerNote: (accountId: string, companyId: string, note: string) => void;
}

type ViewMode = 'grid' | 'list';

export function AccountsTab({ 
  accounts, 
  companies, 
  contacts,
  accountPartners,
  onSaveAccount,
  onDeleteAccount,
  onSaveCompany,
  onDeleteCompany,
  onSaveContact,
  onDeleteContact,
  onAddAccountPartner,
  onRemoveAccountPartner,
  onUpdateAccountPartnerNote
}: AccountsTabProps) {
  const { formatCurrency } = useSettings();
  const { getAccountPlanDisplay, isPremiumPlan, getPlanName } = usePlanDisplay();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const {
    visibleColumns,
    toggleColumn,
    isColumnVisible,
    resetToDefault,
    allColumns,
  } = useColumnConfig('accounts-list-columns', ACCOUNT_COLUMNS);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  // Form dialogs
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Delete dialogs
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const selectedAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : null;
  const selectedCompany = selectedCompanyId ? companies.find(c => c.id === selectedCompanyId) : null;
  const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;

  const getCompanyCount = (accountId: string) => {
    return companies.filter(c => c.accountId === accountId).length;
  };

  const getContactCount = (accountId: string) => {
    const accountCompanies = companies.filter(c => c.accountId === accountId);
    return contacts.filter(c => accountCompanies.some(comp => comp.id === c.companyId)).length;
  };

  const getTicketCount = (accountId: string) => {
    return initialTickets.filter(t => t.accountId === accountId).length;
  };

  const getOpenTicketCount = (accountId: string) => {
    return initialTickets.filter(t => t.accountId === accountId && t.status !== 'Closed').length;
  };

  const getAccountLabels = (labelIds: string[]) => {
    return DEFAULT_ACCOUNT_LABELS.filter(label => labelIds.includes(label.id));
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort value getter for accounts
  const getAccountSortValue = useCallback((account: Account, column: string): unknown => {
    switch (column) {
      case 'name':
        return account.name;
      case 'mrr':
        return account.currentMrr;
      case 'plan':
        return getPlanName(account.planId);
      case 'labels':
        return (account.labelIds || []).length;
      case 'companies':
        return getCompanyCount(account.id);
      case 'contacts':
        return getContactCount(account.id);
      case 'sla':
        return account.firstResponseSlaHours;
      case 'contractEnd':
        return account.contractEndDate;
      case 'autoRenew':
        return account.autoRenew ? 1 : 0;
      case 'tickets':
        return getOpenTicketCount(account.id);
      default:
        return null;
    }
  }, [companies, contacts]);

  const { toggleSort, sortedData: sortedAccounts, getSortDirection, getSortIndex, isMultiSort } = useDynamicTableSort(
    filteredAccounts,
    getAccountSortValue,
    'accounts-sort-config'
  );

  const handleCompanyClick = (companyId: string) => {
    setSelectedAccountId(null);
    setSelectedCompanyId(companyId);
  };

  const handleContactClick = (contactId: string) => {
    setSelectedAccountId(null);
    setSelectedCompanyId(null);
    setSelectedContactId(contactId);
  };

  const handleAccountClick = (accountId: string) => {
    setSelectedCompanyId(null);
    setSelectedContactId(null);
    setSelectedAccountId(accountId);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccountId(null);
    setEditingAccount(account);
    setAccountFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompanyId(null);
    setEditingCompany(company);
    setCompanyFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContactId(null);
    setEditingContact(contact);
    setContactFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with Search, View Toggle, and Create */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Accounts durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
            <ToggleGroupItem value="grid" aria-label="Grid-Ansicht">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Listen-Ansicht">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          {viewMode === 'list' && (
            <ColumnConfigDropdown
              columns={allColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              onReset={resetToDefault}
            />
          )}
          <Button onClick={() => { setEditingAccount(null); setAccountFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Account erstellen
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const labels = getAccountLabels(account.labelIds || []);
            return (
              <Card 
                key={account.id} 
                className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
                onClick={() => setSelectedAccountId(account.id)}
              >
                <CardHeader className="pb-2 flex-shrink-0">
                  {/* Fixed height header section */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold line-clamp-2 min-h-[3.5rem]">
                        {account.name}
                      </CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {getAccountPlanDisplay(account)}
                    </span>
                  </div>
                  {/* Fixed height labels section */}
                  <div className="h-6 mt-2">
                    {labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
                        {labels.slice(0, 3).map(label => (
                          <Badge
                            key={label.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: label.color, color: 'white' }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                        {labels.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{labels.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  {/* MRR Display */}
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">Monatlicher Umsatz</div>
                    <div className="text-xl font-bold text-primary">
                      {formatCurrency(account.currentMrr)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Building2 className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">{getCompanyCount(account.id)}</span>
                      <span className="text-xs text-muted-foreground text-center">Unternehmen</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">{getContactCount(account.id)}</span>
                      <span className="text-xs text-muted-foreground text-center">Kontakte</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                      <Ticket className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">{getOpenTicketCount(account.id)}/{getTicketCount(account.id)}</span>
                      <span className="text-xs text-muted-foreground text-center">Offen/Gesamt</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {isColumnVisible('name') && (
                  <SortableTableHead column="name" label="Account" sortDirection={getSortDirection('name')} sortIndex={getSortIndex('name')} isMultiSort={isMultiSort} onSort={toggleSort} />
                )}
                {isColumnVisible('mrr') && (
                  <SortableTableHead column="mrr" label="MRR" sortDirection={getSortDirection('mrr')} sortIndex={getSortIndex('mrr')} isMultiSort={isMultiSort} onSort={toggleSort} />
                )}
                {isColumnVisible('plan') && (
                  <SortableTableHead column="plan" label="Plan" sortDirection={getSortDirection('plan')} sortIndex={getSortIndex('plan')} isMultiSort={isMultiSort} onSort={toggleSort} />
                )}
                {isColumnVisible('labels') && (
                  <SortableTableHead column="labels" label="Labels" sortDirection={getSortDirection('labels')} sortIndex={getSortIndex('labels')} isMultiSort={isMultiSort} onSort={toggleSort} />
                )}
                {isColumnVisible('companies') && (
                  <SortableTableHead column="companies" label="Unternehmen" sortDirection={getSortDirection('companies')} sortIndex={getSortIndex('companies')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
                )}
                {isColumnVisible('contacts') && (
                  <SortableTableHead column="contacts" label="Kontakte" sortDirection={getSortDirection('contacts')} sortIndex={getSortIndex('contacts')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
                )}
                {isColumnVisible('sla') && (
                  <SortableTableHead column="sla" label="SLA" sortDirection={getSortDirection('sla')} sortIndex={getSortIndex('sla')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
                )}
                {isColumnVisible('contractEnd') && (
                  <SortableTableHead column="contractEnd" label="Vertragsende" sortDirection={getSortDirection('contractEnd')} sortIndex={getSortIndex('contractEnd')} isMultiSort={isMultiSort} onSort={toggleSort} />
                )}
                {isColumnVisible('autoRenew') && (
                  <SortableTableHead column="autoRenew" label="Auto-Renew" sortDirection={getSortDirection('autoRenew')} sortIndex={getSortIndex('autoRenew')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
                )}
                {isColumnVisible('tickets') && (
                  <SortableTableHead column="tickets" label="Tickets" sortDirection={getSortDirection('tickets')} sortIndex={getSortIndex('tickets')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccounts.map((account) => {
                const labels = getAccountLabels(account.labelIds || []);
                return (
                  <TableRow
                    key={account.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    {isColumnVisible('name') && (
                      <TableCell className="font-medium">{account.name}</TableCell>
                    )}
                    {isColumnVisible('mrr') && (
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(account.currentMrr)}
                      </TableCell>
                    )}
                    {isColumnVisible('plan') && (
                      <TableCell>
                        <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'}>
                          {getAccountPlanDisplay(account)}
                        </Badge>
                      </TableCell>
                    )}
                    {isColumnVisible('labels') && (
                      <TableCell>
                        {labels.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {labels.map(label => (
                              <Badge
                                key={label.id}
                                variant="secondary"
                                className="text-xs"
                                style={{ backgroundColor: label.color, color: 'white' }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('companies') && (
                      <TableCell className="text-center">
                        <Badge variant="outline">{getCompanyCount(account.id)}</Badge>
                      </TableCell>
                    )}
                    {isColumnVisible('contacts') && (
                      <TableCell className="text-center">
                        <Badge variant="outline">{getContactCount(account.id)}</Badge>
                      </TableCell>
                    )}
                    {isColumnVisible('sla') && (
                      <TableCell className="text-center">
                        {account.firstResponseSlaHours}h
                      </TableCell>
                    )}
                    {isColumnVisible('contractEnd') && (
                      <TableCell>
                        {format(account.contractEndDate, 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                    )}
                    {isColumnVisible('autoRenew') && (
                      <TableCell className="text-center">
                        {account.autoRenew ? (
                          <Badge variant="default" className="bg-green-600">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Ja
                          </Badge>
                        ) : (
                          <Badge variant="outline">Nein</Badge>
                        )}
                      </TableCell>
                    )}
                    {isColumnVisible('tickets') && (
                      <TableCell className="text-center">
                        <span className="text-sm">
                          {getOpenTicketCount(account.id)}/{getTicketCount(account.id)}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Accounts gefunden
            </div>
          )}
        </div>
      )}

      {viewMode === 'grid' && filteredAccounts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Keine Accounts gefunden
        </div>
      )}

      {/* Detail Sheets */}
      <AccountDetailSheet
        account={selectedAccount ?? null}
        companies={companies}
        contacts={contacts}
        open={!!selectedAccountId}
        onOpenChange={(open) => !open && setSelectedAccountId(null)}
        onCompanyClick={handleCompanyClick}
        onContactClick={handleContactClick}
        onEdit={handleEditAccount}
        onDelete={(id) => { setSelectedAccountId(null); setDeleteAccountId(id); }}
      />
      
      <CompanyDetailSheet
        company={selectedCompany ?? null}
        accounts={accounts}
        contacts={contacts}
        accountPartners={accountPartners}
        open={!!selectedCompanyId}
        onOpenChange={(open) => !open && setSelectedCompanyId(null)}
        onAccountClick={handleAccountClick}
        onContactClick={handleContactClick}
        onEdit={handleEditCompany}
        onDelete={(id) => { setSelectedCompanyId(null); setDeleteCompanyId(id); }}
      />
      
      <ContactDetailSheet
        contact={selectedContact ?? null}
        companies={companies}
        accounts={accounts}
        open={!!selectedContactId}
        onOpenChange={(open) => !open && setSelectedContactId(null)}
        onCompanyClick={handleCompanyClick}
        onAccountClick={handleAccountClick}
        onEdit={handleEditContact}
        onDelete={(id) => { setSelectedContactId(null); setDeleteContactId(id); }}
      />

      {/* Form Dialogs */}
      <AccountFormDialog
        open={accountFormOpen}
        onOpenChange={setAccountFormOpen}
        account={editingAccount}
        accounts={accounts}
        companies={companies}
        accountPartners={accountPartners}
        onSave={onSaveAccount}
        onSaveCompany={onSaveCompany}
        onAddAccountPartner={onAddAccountPartner}
        onRemoveAccountPartner={onRemoveAccountPartner}
      />
      
      <CompanyFormDialog
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        company={editingCompany}
        companies={companies}
        accounts={accounts}
        onSave={onSaveCompany}
      />
      
      <ContactFormDialog
        open={contactFormOpen}
        onOpenChange={setContactFormOpen}
        contact={editingContact}
        contacts={contacts}
        companies={companies}
        onSave={onSaveContact}
      />

      {/* Delete Dialogs */}
      <DeleteConfirmDialog
        open={!!deleteAccountId}
        onOpenChange={(open) => !open && setDeleteAccountId(null)}
        title="Account löschen?"
        description="Dieser Account und alle zugehörigen Unternehmen und Kontakte werden unwiderruflich gelöscht."
        onConfirm={() => {
          if (deleteAccountId) onDeleteAccount(deleteAccountId);
          setDeleteAccountId(null);
        }}
      />
      
      <DeleteConfirmDialog
        open={!!deleteCompanyId}
        onOpenChange={(open) => !open && setDeleteCompanyId(null)}
        title="Unternehmen löschen?"
        description="Dieses Unternehmen und alle zugehörigen Kontakte werden unwiderruflich gelöscht."
        onConfirm={() => {
          if (deleteCompanyId) onDeleteCompany(deleteCompanyId);
          setDeleteCompanyId(null);
        }}
      />
      
      <DeleteConfirmDialog
        open={!!deleteContactId}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
        title="Kontakt löschen?"
        description="Dieser Kontakt wird unwiderruflich gelöscht."
        onConfirm={() => {
          if (deleteContactId) onDeleteContact(deleteContactId);
          setDeleteContactId(null);
        }}
      />
    </div>
  );
}
