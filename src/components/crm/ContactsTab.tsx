import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Mail, Phone, MessageSquare, Plus } from 'lucide-react';
import { AccountDetailSheet } from './AccountDetailSheet';
import { CompanyDetailSheet } from './CompanyDetailSheet';
import { ContactDetailSheet } from './ContactDetailSheet';
import { AccountFormDialog } from './AccountFormDialog';
import { CompanyFormDialog } from './CompanyFormDialog';
import { ContactFormDialog } from './ContactFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ColumnConfigDropdown } from './ColumnConfigDropdown';
import { SortableTableHead } from './SortableTableHead';
import { Account, Company, Contact, AccountPartner } from '@/types';
import { useColumnConfig, ColumnDefinition } from '@/hooks/useColumnConfig';
import { useDynamicTableSort } from '@/hooks/useTableSort';

const CONTACT_COLUMNS: ColumnDefinition[] = [
  { id: 'name', label: 'Kontakt', defaultVisible: true },
  { id: 'company', label: 'Unternehmen', defaultVisible: true },
  { id: 'account', label: 'Account', defaultVisible: true },
  { id: 'email', label: 'E-Mail', defaultVisible: true },
  { id: 'phone', label: 'Telefon', defaultVisible: true },
  { id: 'slack', label: 'Slack', defaultVisible: true },
];

interface ContactsTabProps {
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

export function ContactsTab({ 
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
}: ContactsTabProps) {
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
  } = useColumnConfig('contacts-list-columns', CONTACT_COLUMNS);
  
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

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unbekannt';
  };

  const getAccountName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return 'Unbekannt';
    return accounts.find(a => a.id === company.accountId)?.name || 'Unbekannt';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCompanyName(contact.companyId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort value getter for contacts
  const getContactSortValue = useCallback((contact: Contact, column: string): unknown => {
    switch (column) {
      case 'name':
        return contact.name;
      case 'company':
        return getCompanyName(contact.companyId);
      case 'account':
        return getAccountName(contact.companyId);
      case 'email':
        return contact.email;
      case 'phone':
        return contact.phone || '';
      case 'slack':
        return contact.slackHandle;
      default:
        return null;
    }
  }, [companies, accounts]);

  const { toggleSort, sortedData: sortedContacts, getSortDirection, getSortIndex, isMultiSort } = useDynamicTableSort(
    filteredContacts,
    getContactSortValue,
    'contacts-sort-config'
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
            placeholder="Kontakte durchsuchen..."
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
          <Button onClick={() => { setEditingContact(null); setContactFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Kontakt erstellen
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {isColumnVisible('name') && (
                <SortableTableHead column="name" label="Kontakt" sortDirection={getSortDirection('name')} sortIndex={getSortIndex('name')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('company') && (
                <SortableTableHead column="company" label="Unternehmen" sortDirection={getSortDirection('company')} sortIndex={getSortIndex('company')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('account') && (
                <SortableTableHead column="account" label="Account" sortDirection={getSortDirection('account')} sortIndex={getSortIndex('account')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('email') && (
                <SortableTableHead column="email" label="E-Mail" sortDirection={getSortDirection('email')} sortIndex={getSortIndex('email')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('phone') && (
                <SortableTableHead column="phone" label="Telefon" sortDirection={getSortDirection('phone')} sortIndex={getSortIndex('phone')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
              {isColumnVisible('slack') && (
                <SortableTableHead column="slack" label="Slack" sortDirection={getSortDirection('slack')} sortIndex={getSortIndex('slack')} isMultiSort={isMultiSort} onSort={toggleSort} />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => (
              <TableRow 
                key={contact.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleContactClick(contact.id)}
              >
                {isColumnVisible('name') && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{contact.name}</span>
                    </div>
                  </TableCell>
                )}
                {isColumnVisible('company') && (
                  <TableCell>{getCompanyName(contact.companyId)}</TableCell>
                )}
                {isColumnVisible('account') && (
                  <TableCell className="text-muted-foreground">
                    {getAccountName(contact.companyId)}
                  </TableCell>
                )}
                {isColumnVisible('email') && (
                  <TableCell>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  </TableCell>
                )}
                {isColumnVisible('phone') && (
                  <TableCell>
                    {contact.phone ? (
                      <a 
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                {isColumnVisible('slack') && (
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {contact.slackHandle}
                    </Badge>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Keine Kontakte gefunden
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
    </div>
  );
}
