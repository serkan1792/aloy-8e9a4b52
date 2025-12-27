import { useState, useCallback } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ContactsTab } from '@/components/crm/ContactsTab';
import { Helmet } from 'react-helmet-async';
import { Account, Company, Contact, AccountPartner } from '@/types';
import { 
  accounts as initialAccounts, 
  companies as initialCompanies, 
  contacts as initialContacts,
  accountPartners as initialAccountPartners 
} from '@/data/mockData';

export default function Contacts() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [accountPartners, setAccountPartners] = useState<AccountPartner[]>(initialAccountPartners);

  const handleSaveAccount = useCallback((accountData: Omit<Account, 'id'> & { id?: string }) => {
    if (accountData.id) {
      setAccounts(prev => prev.map(a => a.id === accountData.id ? { ...a, ...accountData } as Account : a));
    } else {
      const newAccount: Account = {
        ...accountData,
        id: `acc-${Date.now()}`,
      };
      setAccounts(prev => [...prev, newAccount]);
    }
  }, []);

  const handleDeleteAccount = useCallback((accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    const kundenCompanyIds = companies
      .filter(c => c.type === 'Kunde' && c.accountId === accountId)
      .map(c => c.id);
    setCompanies(prev => prev.filter(c => !(c.type === 'Kunde' && c.accountId === accountId)));
    setContacts(prev => prev.filter(c => !kundenCompanyIds.includes(c.companyId)));
  }, [companies]);

  const handleSaveCompany = useCallback((companyData: Omit<Company, 'id'> & { id?: string }) => {
    if (companyData.id) {
      setCompanies(prev => prev.map(c => c.id === companyData.id ? { ...c, ...companyData } as Company : c));
    } else {
      const newCompany: Company = {
        ...companyData,
        id: `comp-${Date.now()}`,
      };
      setCompanies(prev => [...prev, newCompany]);
    }
  }, []);

  const handleDeleteCompany = useCallback((companyId: string) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    setContacts(prev => prev.filter(c => c.companyId !== companyId));
    setAccountPartners(prev => prev.filter(ap => ap.companyId !== companyId));
  }, []);

  const handleSaveContact = useCallback((contactData: Omit<Contact, 'id'> & { id?: string }) => {
    if (contactData.id) {
      setContacts(prev => prev.map(c => c.id === contactData.id ? { ...c, ...contactData } as Contact : c));
    } else {
      const newContact: Contact = {
        ...contactData,
        id: `con-${Date.now()}`,
      };
      setContacts(prev => [...prev, newContact]);
    }
  }, []);

  const handleDeleteContact = useCallback((contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  }, []);

  const handleAddAccountPartner = useCallback((partner: AccountPartner) => {
    setAccountPartners(prev => [...prev, partner]);
  }, []);

  const handleRemoveAccountPartner = useCallback((accountId: string, companyId: string) => {
    setAccountPartners(prev => 
      prev.filter(ap => !(ap.accountId === accountId && ap.companyId === companyId))
    );
  }, []);

  const handleUpdateAccountPartnerNote = useCallback((accountId: string, companyId: string, note: string) => {
    setAccountPartners(prev => 
      prev.map(ap => 
        ap.accountId === accountId && ap.companyId === companyId 
          ? { ...ap, note: note || undefined }
          : ap
      )
    );
  }, []);

  return (
    <>
      <Helmet>
        <title>Contacts - SupportHub</title>
        <meta name="description" content="Verwalten Sie Ihre Kontakte" />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
              <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
            </header>

            <div className="flex-1 overflow-auto p-6">
              <ContactsTab 
                accounts={accounts}
                companies={companies}
                contacts={contacts}
                accountPartners={accountPartners}
                onSaveAccount={handleSaveAccount}
                onDeleteAccount={handleDeleteAccount}
                onSaveCompany={handleSaveCompany}
                onDeleteCompany={handleDeleteCompany}
                onSaveContact={handleSaveContact}
                onDeleteContact={handleDeleteContact}
                onAddAccountPartner={handleAddAccountPartner}
                onRemoveAccountPartner={handleRemoveAccountPartner}
                onUpdateAccountPartnerNote={handleUpdateAccountPartnerNote}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
