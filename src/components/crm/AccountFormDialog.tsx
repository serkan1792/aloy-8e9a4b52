import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Account, Company, AccountPartner, DEFAULT_ACCOUNT_LABELS } from '@/types';
import { Building2, Plus, X, Link, AlertCircle, CalendarIcon, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  accountSchema, 
  checkAccountNameUnique, 
  validateWithSchema,
  ValidationErrors 
} from '@/hooks/useCrmValidation';

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  accounts?: Account[];
  companies?: Company[];
  accountPartners?: AccountPartner[];
  onSave: (account: Omit<Account, 'id'> & { id?: string }) => void;
  onSaveCompany?: (company: Omit<Company, 'id'> & { id?: string }) => void;
  onAddAccountPartner?: (partner: AccountPartner) => void;
  onRemoveAccountPartner?: (accountId: string, companyId: string) => void;
}

export function AccountFormDialog({ 
  open, 
  onOpenChange, 
  account, 
  accounts = [],
  companies = [],
  accountPartners = [],
  onSave,
  onSaveCompany,
  onAddAccountPartner,
  onRemoveAccountPartner
}: AccountFormDialogProps) {
  const { settings, plans, tiers, calculateMrr, formatCurrency } = useSettings();
  const [name, setName] = useState('');
  const [planId, setPlanId] = useState('');
  const [tierId, setTierId] = useState('');
  const [slaHours, setSlaHours] = useState('4');
  const [useMrrOverride, setUseMrrOverride] = useState(false);
  const [mrrOverride, setMrrOverride] = useState('');
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>(undefined);
  const [autoRenew, setAutoRenew] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedKundeId, setSelectedKundeId] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDomain, setNewCompanyDomain] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Calculate MRR based on selected plan and tier
  const calculatedMrr = planId && tierId ? calculateMrr(planId, tierId) : 0;
  const effectiveMrr = useMrrOverride && mrrOverride 
    ? Math.round(parseFloat(mrrOverride) * 100) 
    : calculatedMrr;
  
  // Debug log
  console.log('MRR Calculation:', { planId, tierId, calculatedMrr, effectiveMrr, useMrrOverride });

  useEffect(() => {
    if (account) {
      setName(account.name);
      setPlanId(account.planId);
      setTierId(account.tierId);
      setSlaHours(account.firstResponseSlaHours.toString());
      setContractEndDate(account.contractEndDate);
      setAutoRenew(account.autoRenew);
      setSelectedLabelIds(account.labelIds || []);
      
      // Check if there's a manual override
      if (account.mrrOverride !== undefined) {
        setUseMrrOverride(true);
        setMrrOverride((account.mrrOverride / 100).toFixed(2));
      } else {
        setUseMrrOverride(false);
        setMrrOverride('');
      }
    } else {
      setName('');
      setPlanId(plans[0]?.id || '');
      setTierId(tiers[0]?.id || '');
      setSlaHours('4');
      setContractEndDate(undefined);
      setAutoRenew(false);
      setSelectedLabelIds([]);
      setUseMrrOverride(false);
      setMrrOverride('');
    }
    setSelectedPartnerId('');
    setSelectedKundeId('');
    setNewCompanyName('');
    setNewCompanyDomain('');
    setErrors({});
    setTouched({});
  }, [account, open, plans, tiers]);

  // Get Kunde companies for this account
  const kundenCompanies = account 
    ? companies.filter(c => c.type === 'Kunde' && c.accountId === account.id)
    : [];

  // Get unassigned Kunde companies (no accountId set)
  const unassignedKunden = companies.filter(
    c => c.type === 'Kunde' && !c.accountId
  );

  // Get Partner companies linked to this account
  const linkedPartnerIds = account 
    ? accountPartners.filter(ap => ap.accountId === account.id).map(ap => ap.companyId)
    : [];
  const linkedPartners = companies.filter(c => linkedPartnerIds.includes(c.id));

  // Get available Partner companies (not yet linked)
  const availablePartners = companies.filter(
    c => c.type === 'Partner' && !linkedPartnerIds.includes(c.id)
  );

  const validateForm = (): boolean => {
    const formData = {
      name: name.trim(),
      planId,
      firstResponseSlaHours: parseInt(slaHours) || 0,
    };

    const result = validateWithSchema(accountSchema, formData);
    
    if (result.success === false) {
      setErrors(result.errors);
      return false;
    }

    // Check uniqueness
    const uniqueError = checkAccountNameUnique(name, accounts, account?.id);
    if (uniqueError) {
      setErrors({ name: uniqueError });
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
    setTouched({ name: true, planId: true, tierId: true, firstResponseSlaHours: true });
    
    if (!validateForm()) {
      return;
    }

    onSave({
      id: account?.id,
      name: name.trim(),
      planId,
      tierId,
      firstResponseSlaHours: parseInt(slaHours) || 4,
      currentMrr: effectiveMrr,
      mrrOverride: useMrrOverride ? Math.round(parseFloat(mrrOverride || '0') * 100) : undefined,
      contractEndDate: contractEndDate ?? new Date(),
      autoRenew,
      labelIds: selectedLabelIds,
    });
    onOpenChange(false);
  };

  const handleAssignKunde = (kundeId?: string) => {
    const idToUse = kundeId || selectedKundeId;
    if (idToUse && account && onSaveCompany) {
      const company = companies.find(c => c.id === idToUse);
      if (company) {
        onSaveCompany({
          ...company,
          accountId: account.id,
        });
      }
      setSelectedKundeId('');
    }
  };

  const handleRemoveKunde = (companyId: string) => {
    if (onSaveCompany) {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        onSaveCompany({
          ...company,
          accountId: undefined,
        });
      }
    }
  };

  const handleCreateKunde = () => {
    if (newCompanyName && account && onSaveCompany) {
      onSaveCompany({
        name: newCompanyName.trim(),
        domain: newCompanyDomain || `${newCompanyName.toLowerCase().replace(/\s+/g, '')}.de`,
        type: 'Kunde',
        accountId: account.id,
      });
      setNewCompanyName('');
      setNewCompanyDomain('');
    }
  };

  const handleRemovePartner = (companyId: string) => {
    if (account && onRemoveAccountPartner) {
      onRemoveAccountPartner(account.id, companyId);
    }
  };

  const getFieldError = (field: string) => {
    return touched[field] ? errors[field] : undefined;
  };

  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{account ? 'Account bearbeiten' : 'Neuer Account'}</DialogTitle>
          <DialogDescription>
            {account ? 'Bearbeiten Sie die Account-Details.' : 'Erstellen Sie einen neuen Account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
          <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Account Name"
                className={getFieldError('name') ? 'border-destructive' : ''}
              />
              {getFieldError('name') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('name')}
                </p>
              )}
            </div>
            
            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plan *</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger className={getFieldError('planId') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Plan auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {sortedPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex flex-col">
                        <span>{plan.name}</span>
                        {plan.description && (
                          <span className="text-xs text-muted-foreground">{plan.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tier Selection */}
            <div className="space-y-2">
              <Label htmlFor="tier">Pricing Tier *</Label>
              <Select value={tierId} onValueChange={setTierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Tier auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {sortedTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      <div className="flex flex-col">
                        <span>{tier.name}</span>
                        {tier.description && (
                          <span className="text-xs text-muted-foreground">{tier.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sla">First Response SLA (Stunden) *</Label>
              <Input
                id="sla"
                type="number"
                min="1"
                max="168"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                onBlur={() => handleBlur('firstResponseSlaHours')}
                className={getFieldError('firstResponseSlaHours') ? 'border-destructive' : ''}
              />
              {getFieldError('firstResponseSlaHours') && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('firstResponseSlaHours')}
                </p>
              )}
            </div>

            <Separator />

            {/* MRR Display with Auto-Calculation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Monatlicher Umsatz (MRR)
                </Label>
              </div>
              
              {/* Calculated MRR Display */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {useMrrOverride ? 'Manueller Preis' : 'Berechnet aus Plan + Tier'}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(effectiveMrr)}
                    </p>
                  </div>
                  {!useMrrOverride && planId && tierId && (
                    <Badge variant="secondary" className="text-xs">
                      Auto
                    </Badge>
                  )}
                </div>
              </div>

              {/* Override Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="mrr-override" className="text-sm text-muted-foreground">
                  Manuellen Preis verwenden
                </Label>
                <Switch
                  id="mrr-override"
                  checked={useMrrOverride}
                  onCheckedChange={setUseMrrOverride}
                />
              </div>

              {/* Manual Override Input */}
              {useMrrOverride && (
                <div className="space-y-2">
                  <Label htmlFor="mrr">Manueller MRR in {settings.currency.symbol}</Label>
                  <Input
                    id="mrr"
                    type="number"
                    step="0.01"
                    min="0"
                    value={mrrOverride}
                    onChange={(e) => setMrrOverride(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Vertragsende</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !contractEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {contractEndDate ? format(contractEndDate, "PPP", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={contractEndDate}
                    onSelect={setContractEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-renew">Automatische Verlängerung</Label>
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label>Labels</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ACCOUNT_LABELS.map(label => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <Badge
                      key={label.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      style={isSelected ? { backgroundColor: label.color, borderColor: label.color } : { borderColor: label.color, color: label.color }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLabelIds(prev => prev.filter(id => id !== label.id));
                        } else {
                          setSelectedLabelIds(prev => [...prev, label.id]);
                        }
                      }}
                    >
                      {label.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Only show company management when editing an existing account */}
            {account && (
              <>
                <Separator />
                
                {/* Kunde Companies (editable) */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Kunden-Unternehmen ({kundenCompanies.length})
                  </Label>
                  
                  {kundenCompanies.length > 0 && (
                    <div className="space-y-1">
                      {kundenCompanies.map(company => (
                        <div 
                          key={company.id} 
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{company.name}</span>
                            <span className="text-xs text-muted-foreground">{company.domain}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveKunde(company.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Assign existing unassigned Kunde */}
                  {unassignedKunden.length > 0 && (
                    <div className="flex gap-2">
                      <Select 
                        value={selectedKundeId} 
                        onValueChange={(value) => {
                          setSelectedKundeId(value);
                          handleAssignKunde(value);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Bestehendes Unternehmen zuordnen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedKunden.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Create new Kunde company */}
                  <div className="space-y-2 p-3 rounded-lg border border-dashed border-border">
                    <Label className="text-xs text-muted-foreground">Neues Unternehmen erstellen</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Domain (optional)"
                        value={newCompanyDomain}
                        onChange={(e) => setNewCompanyDomain(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={handleCreateKunde}
                        disabled={!newCompanyName.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Partner Companies (editable) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Partner-Unternehmen ({linkedPartners.length})
                  </Label>
                  
                  {linkedPartners.length > 0 && (
                    <div className="space-y-1">
                      {linkedPartners.map(partner => (
                        <div 
                          key={partner.id} 
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{partner.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemovePartner(partner.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Partner */}
                  {availablePartners.length > 0 && (
                    <div className="flex gap-2">
                      <Select 
                        value={selectedPartnerId} 
                        onValueChange={(value) => {
                          setSelectedPartnerId(value);
                          if (value && account && onAddAccountPartner) {
                            onAddAccountPartner({
                              accountId: account.id,
                              companyId: value,
                            });
                            setSelectedPartnerId('');
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Partner zuordnen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePartners.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
          </ScrollArea>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {account ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}