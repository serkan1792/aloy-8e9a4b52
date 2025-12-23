import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact, Company } from '@/types';
import { AlertCircle } from 'lucide-react';
import { 
  contactSchema, 
  checkContactEmailUnique,
  validateWithSchema,
  ValidationErrors 
} from '@/hooks/useCrmValidation';

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  contacts?: Contact[];
  companies: Company[];
  onSave: (contact: Omit<Contact, 'id'> & { id?: string }) => void;
}

export function ContactFormDialog({ 
  open, 
  onOpenChange, 
  contact, 
  contacts = [],
  companies, 
  onSave 
}: ContactFormDialogProps) {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [slackHandle, setSlackHandle] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setCompanyId(contact.companyId);
      setEmail(contact.email);
      setPhone(contact.phone || '');
      setSlackHandle(contact.slackHandle);
    } else {
      setName('');
      setCompanyId(companies[0]?.id || '');
      setEmail('');
      setPhone('');
      setSlackHandle('');
    }
    setErrors({});
    setTouched({});
  }, [contact, companies, open]);

  const validateForm = (): boolean => {
    const formData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      companyId,
      slackHandle: slackHandle || undefined,
    };

    const result = validateWithSchema(contactSchema, formData);
    
    if (result.success === false) {
      setErrors(result.errors);
      return false;
    }

    // Check uniqueness
    const emailError = checkContactEmailUnique(email, contacts, contact?.id);
    if (emailError) {
      setErrors({ email: emailError });
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
    setTouched({ name: true, email: true, companyId: true, phone: true });
    
    if (!validateForm()) {
      return;
    }

    onSave({
      id: contact?.id,
      name: name.trim(),
      companyId,
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      slackHandle: slackHandle || `@${name.toLowerCase().replace(/\s+/g, '.')}`,
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
          <DialogTitle>{contact ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}</DialogTitle>
          <DialogDescription>
            {contact ? 'Bearbeiten Sie die Kontaktdaten.' : 'Erstellen Sie einen neuen Kontakt.'}
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
              placeholder="Vor- und Nachname"
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
            <Label htmlFor="company">Unternehmen *</Label>
            <Select 
              value={companyId} 
              onValueChange={(value) => {
                setCompanyId(value);
                setTouched(prev => ({ ...prev, companyId: true }));
              }}
            >
              <SelectTrigger className={getFieldError('companyId') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Unternehmen auswählen" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('companyId') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('companyId')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="email@beispiel.de"
              className={getFieldError('email') ? 'border-destructive' : ''}
            />
            {getFieldError('email') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('email')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+49 151 12345678"
              className={getFieldError('phone') ? 'border-destructive' : ''}
            />
            {getFieldError('phone') && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('phone')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slack">Slack Handle (optional)</Label>
            <Input
              id="slack"
              value={slackHandle}
              onChange={(e) => setSlackHandle(e.target.value)}
              placeholder="@name"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              {contact ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
