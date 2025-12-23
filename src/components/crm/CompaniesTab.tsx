import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ExternalLink, Plus } from 'lucide-react';
import { AccountDetailSheet } from './AccountDetailSheet';
import { CompanyDetailSheet } from './CompanyDetailSheet';
import { ContactDetailSheet } from './ContactDetailSheet';
import { AccountFormDialog } from './AccountFormDialog';
import { CompanyFormDialog } from './CompanyFormDialog';
import { ContactFormDialog } from './ContactFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { AccountPartnerManager } from './AccountPartnerManager';
import { ColumnConfigDropdown } from './ColumnConfigDropdown';
import { SortableTableHead } from './SortableTableHead';
import { Account, Company, Contact, AccountPartner } from '@/types';
import { useColumnConfig, ColumnDefinition } from '@/hooks/useColumnConfig';
import { useDynamicTableSort } from '@/hooks/useTableSort';

const COMPANY_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'Unternehmen', defaultVisible: true },
  { id: 'type', label: 'Typ', defaultVisible: true },
  { id: 'account', label: 'Account', defaultVisible: true },
  { id: 'domain', label: 'Domain', defaultVisible: true },
  { id: 'externalId', label: 'CRM ID', defaultVisible: true },
  { id: 'contacts', label: 'Kontakte', defaultVisible: true },
];

interface CompaniesTabProps {
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

export function CompaniesTab({ 
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
}: CompaniesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const {
    visibleColumns,
    toggleColumn,
    isColumnVisible,
    resetToDefault,
    allColumns,
  } = useColumnConfig('companies-list-columns', COMPANY_COLUMNS);
  
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
  
  // Partner manager
  const [partnerManagerCompany, setPartnerManagerCompany] = useState<Company | null>(null);

  const selectedAccount = selectedAccountId ? accounts.find(a => a.id === selectedAccountId) : null;
  const selectedCompany = selectedCompanyId ? companies.find(c => c.id === selectedCompanyId) : null;
  const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;

  const getAccountName = (accountId?: string) => {
    if (!accountId) return '—';
    return accounts.find(a => a.id === accountId)?.name || 'Unbekannt';
  };

  const getAccountPlanId = (accountId?: string) => {
    if (!accountId) return null;
    return accounts.find(a => a.id === accountId)?.planId || null;
  };

  const getContactCount = (companyId: string) => {
    return contacts.filter(c => c.companyId === companyId).length;
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.accountId && getAccountName(company.accountId).toLowerCase().includes(searchQuery.toLowerCase())) ||
    company.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort value getter for companies
  const getCompanySortValue = useCallback((company: Company, column: string): unknown => {
    switch (column) {
      case 'name':
        return company.name;
      case 'type':
        return company.type;
      case 'account':
        return getAccountName(company.accountId);
      case 'domain':
        return company.domain;
      case 'externalId':
        return company.externalId || '';
      case 'contacts':
        return getContactCount(company.id);
      default:
        return null;
    }
  }, [accounts, contacts]);

  const { toggleSort, sortedData: sortedCompanies, getSortDirection, getSortIndex, isMultiSort } = useDynamicTableSort(
    filteredCompanies,
    getCompanySortValue,
    'companies-sort-config'
  );

  const handleCompanyClick = (companyId: string) => {
    setSelectedAccountId(null);
    setSelectedContactId(null);
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
      {/* Header with Search and Create */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Unternehmen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ColumnConfigDropdown
            columns={allColumns}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
            onReset={resetToDefault}
          />
          <Button onClick={() => { setEditingCompany(null); setCompanyFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Unternehmen erstellen
          </Button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {isColumnVisible('name') && (
                <SortableTableHead column="name" label="Unternehmen" sortDirection={getSortDirection('name')} sortIndex={getSortIndex('name')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('type') && (
                <SortableTableHead column="type" label="Typ" sortDirection={getSortDirection('type')} sortIndex={getSortIndex('type')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('account') && (
                <SortableTableHead column="account" label="Account" sortDirection={getSortDirection('account')} sortIndex={getSortIndex('account')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('domain') && (
                <SortableTableHead column="domain" label="Domain" sortDirection={getSortDirection('domain')} sortIndex={getSortIndex('domain')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('externalId') && (
                <SortableTableHead column="externalId" label="CRM ID" sortDirection={getSortDirection('externalId')} sortIndex={getSortIndex('externalId')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('contacts') && (
                <SortableTableHead column="contacts" label="Kontakte" sortDirection={getSortDirection('contacts')} sortIndex={getSortIndex('contacts')} isMultiSort={isMultiSort} onSort={toggleSort} className="text-center" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.map((company) => {
              const accountPlanId = getAccountPlanId(company.accountId);
              return (
                <TableRow 
                  key={company.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCompanyClick(company.id)}
                >
                  {isColumnVisible('name') && (
                    <TableCell className="font-medium">{company.name}</TableCell>
                  )}
                  {isColumnVisible('type') && (
                    <TableCell>
                      <Badge variant={company.type === 'Partner' ? 'secondary' : 'outline'} className="text-xs">
                        {company.type}
                      </Badge>
                    </TableCell>
                  )}
                  {isColumnVisible('account') && (
                    <TableCell>
                      {company.type === 'Kunde' && company.accountId ? (
                        <div className="flex items-center gap-2">
                          <span>{getAccountName(company.accountId)}</span>
                          {accountPlanId && (
                            <Badge variant="secondary" className="text-xs">
                              {accountPlanId}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Mehrere Accounts</span>
                      )}
                    </TableCell>
                  )}
                  {isColumnVisible('domain') && (
                    <TableCell>
                      <a 
                        href={`https://${company.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {company.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  )}
                  {isColumnVisible('externalId') && (
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {company.externalId || '-'}
                    </TableCell>
                  )}
                  {isColumnVisible('contacts') && (
                    <TableCell className="text-center">
                      <Badge variant="outline">{getContactCount(company.id)}</Badge>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Keine Unternehmen gefunden
          </div>
        )}
      </div>

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
        onManagePartners={(company) => { setSelectedCompanyId(null); setPartnerManagerCompany(company); }}
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
        onSave={onSaveAccount}
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

      {/* Partner Manager */}
      {partnerManagerCompany && (
        <AccountPartnerManager
          open={!!partnerManagerCompany}
          onOpenChange={(open) => !open && setPartnerManagerCompany(null)}
          company={partnerManagerCompany}
          accounts={accounts}
          accountPartners={accountPartners}
          onAddPartner={onAddAccountPartner}
          onRemovePartner={onRemoveAccountPartner}
          onUpdatePartnerNote={onUpdateAccountPartnerNote}
        />
      )}
    </div>
  );
}
