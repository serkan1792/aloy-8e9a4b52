import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company, Account, CompanyType } from '@/types';
import { AlertCircle } from 'lucide-react';
import { 
  companySchema, 
  checkCompanyNameUnique, 
  checkCompanyDomainUnique,
  validateWithSchema,
  ValidationErrors 
} from '@/hooks/useCrmValidation';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  companies?: Company[];
  accounts: Account[];
  onSave: (company: Omit<Company, 'id'> & { id?: string }) => void;
}

export function CompanyFormDialog({ 
  open, 
  onOpenChange, 
  company, 
  companies = [],
  accounts, 
  onSave 
}: CompanyFormDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CompanyType>('Kunde');
  const [accountId, setAccountId] = useState('');
  const [domain, setDomain] = useState('');
  const [externalId, setExternalId] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (company) {
      setName(company.name);
      setType(company.type);
      setAccountId(company.accountId || '');
      setDomain(company.domain);
      setExternalId(company.externalId || '');
    } else {
      setName('');
      setType('Kunde');
      setAccountId(accounts[0]?.id || '');
      setDomain('');
      setExternalId('');
    }
    setErrors({});
    setTouched({});
  }, [company, accounts, open]);

  const validateForm = (): boolean => {
    const formData = {
      name: name.trim(),
      domain: domain.trim().toLowerCase(),
      type,
      externalId: externalId || undefined,
      accountId: type === 'Kunde' ? accountId : undefined,
    };

    const result = validateWithSchema(companySchema, formData);
    
    if (result.success === false) {
      setErrors(result.errors);
      return false;
    }

    // Check uniqueness
    const nameError = checkCompanyNameUnique(name, companies, company?.id);
    if (nameError) {
      setErrors({ name: nameError });
      return false;
    }

    const domainError = checkCompanyDomainUnique(domain, companies, company?.id);
    if (domainError) {
      setErrors({ domain: domainError });
      return false;
    }

    // Business logic: Kunde needs an account
    if (type === 'Kunde' && !accountId) {
      setErrors({ accountId: 'Ein Kunden-Unternehmen benötigt einen Account' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, domain: true, type: true, accountId: true });
    
    if (!validateForm()) {
      return;
    }

    onSave({
      id: company?.id,
      name: name.trim(),
      type,
      accountId: type === 'Kunde' ? accountId : undefined,
      domain: domain.trim().toLowerCase(),
      externalId: externalId || undefined,
    });
    onOpenChange(false);
  };

  const getFieldError = (field: string) => {
    return touched[field] ? errors[field] : undefined;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{company ? 'Unternehmen bearbeiten' : 'Neues Unternehmen'}</DialogTitle>
          <DialogDescription>
            {company ? 'Bearbeiten Sie die Unternehmensdaten.' : 'Erstellen Sie ein neues Unternehmen.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Unternehmensname"
              className={getFieldError('name') ? 'border-destructive' : ''}
            />
            {getFieldError('name') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('name')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ *</Label>
            <Select 
              value={type} 
              onValueChange={(value: CompanyType) => {
                setType(value);
                setTouched(prev => ({ ...prev, type: true }));
              }}
            >
              <SelectTrigger className={getFieldError('type') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kunde">Kunde</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('type') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('type')}
              </p>
            )}
          </div>
          
          {type === 'Kunde' && (
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select 
                value={accountId} 
                onValueChange={(value) => {
                  setAccountId(value);
                  setTouched(prev => ({ ...prev, accountId: true }));
                }}
              >
                <SelectTrigger className={getFieldError('accountId') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Account auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('accountId') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('accountId')}
                </p>
              )}
            </div>
          )}

          {type === 'Partner' && (
            <p className="text-sm text-muted-foreground">
              Partner-Unternehmen können nach dem Erstellen mehreren Accounts zugeordnet werden.
            </p>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onBlur={() => handleBlur('domain')}
              placeholder="beispiel.de"
              className={getFieldError('domain') ? 'border-destructive' : ''}
            />
            {getFieldError('domain') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('domain')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="externalId">External ID (optional)</Label>
            <Input
              id="externalId"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="z.B. Salesforce, HubSpot ID"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              {company ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
