import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Account, Company, AccountPartner } from '@/types';
import { Plus, Trash2, Building2, StickyNote } from 'lucide-react';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';

interface AccountPartnerManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  accounts: Account[];
  accountPartners: AccountPartner[];
  onAddPartner: (partner: AccountPartner) => void;
  onRemovePartner: (accountId: string, companyId: string) => void;
  onUpdatePartnerNote: (accountId: string, companyId: string, note: string) => void;
}

export function AccountPartnerManager({
  open,
  onOpenChange,
  company,
  accounts,
  accountPartners,
  onAddPartner,
  onRemovePartner,
  onUpdatePartnerNote,
}: AccountPartnerManagerProps) {
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [note, setNote] = useState('');
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [editedNote, setEditedNote] = useState('');
  const { getAccountPlanDisplay, isPremiumPlan } = usePlanDisplay();

  // Get current partner assignments for this company
  const currentAssignments = accountPartners.filter(ap => ap.companyId === company.id);
  const assignedAccountIds = currentAssignments.map(ap => ap.accountId);
  
  // Available accounts (not yet assigned)
  const availableAccounts = accounts.filter(a => !assignedAccountIds.includes(a.id));

  const handleAddAssignment = () => {
    if (!selectedAccountId) return;
    
    onAddPartner({
      accountId: selectedAccountId,
      companyId: company.id,
      note: note || undefined,
    });
    
    setSelectedAccountId('');
    setNote('');
  };

  const handleStartEditNote = (accountId: string, currentNote?: string) => {
    setEditingNoteFor(accountId);
    setEditedNote(currentNote || '');
  };

  const handleSaveNote = (accountId: string) => {
    onUpdatePartnerNote(accountId, company.id, editedNote);
    setEditingNoteFor(null);
    setEditedNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Partner-Zuordnungen: {company.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              Zugeordnete Accounts ({currentAssignments.length})
            </Label>
            
            {currentAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                Noch keine Accounts zugeordnet
              </p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {currentAssignments.map((assignment) => {
                    const account = accounts.find(a => a.id === assignment.accountId);
                    if (!account) return null;
                    
                    return (
                      <div 
                        key={assignment.accountId}
                        className="p-3 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.name}</span>
                            <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'} className="text-xs">
                              {getAccountPlanDisplay(account)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onRemovePartner(assignment.accountId, company.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Note editing */}
                        {editingNoteFor === assignment.accountId ? (
                          <div className="mt-2 flex gap-2">
                            <Input
                              value={editedNote}
                              onChange={(e) => setEditedNote(e.target.value)}
                              placeholder="Notiz zur Beziehung..."
                              className="text-sm"
                            />
                            <Button size="sm" onClick={() => handleSaveNote(assignment.accountId)}>
                              Speichern
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingNoteFor(null)}>
                              Abbrechen
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="mt-2 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                            onClick={() => handleStartEditNote(assignment.accountId, assignment.note)}
                          >
                            <StickyNote className="h-3 w-3" />
                            {assignment.note ? (
                              <span className="italic">{assignment.note}</span>
                            ) : (
                              <span className="text-muted-foreground/60">Notiz hinzufügen...</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Add New Assignment */}
          {availableAccounts.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                Neuen Account zuordnen
              </Label>
              
              <div className="space-y-3">
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span>{account.name}</span>
                          <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'secondary'} className="text-xs">
                            {getAccountPlanDisplay(account)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optionale Notiz (z.B. 'Technische Integration')"
                />

                <Button 
                  onClick={handleAddAssignment} 
                  disabled={!selectedAccountId}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Account zuordnen
                </Button>
              </div>
            </div>
          )}

          {availableAccounts.length === 0 && currentAssignments.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Alle verfügbaren Accounts sind bereits zugeordnet
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
