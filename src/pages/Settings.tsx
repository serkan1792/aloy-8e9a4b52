import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Euro, DollarSign, PoundSterling } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { AVAILABLE_CURRENCIES, PricingPlan, PricingTier } from '@/types';

export default function Settings() {
  const { 
    settings, 
    setCurrency, 
    formatCurrency,
    plans, 
    addPlan, 
    updatePlan, 
    deletePlan,
    tiers, 
    addTier, 
    updateTier, 
    deleteTier,
    pricingMatrix,
    setPrice,
    getPrice,
  } = useSettings();

  // Plan dialog state
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');

  // Tier dialog state
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  const [tierName, setTierName] = useState('');
  const [tierDescription, setTierDescription] = useState('');

  // Price editing state
  const [editingPrice, setEditingPrice] = useState<{ planId: string; tierId: string } | null>(null);
  const [priceValue, setPriceValue] = useState('');

  const handleOpenPlanDialog = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanName(plan.name);
      setPlanDescription(plan.description || '');
    } else {
      setEditingPlan(null);
      setPlanName('');
      setPlanDescription('');
    }
    setPlanDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;
    
    if (editingPlan) {
      updatePlan(editingPlan.id, { name: planName.trim(), description: planDescription.trim() || undefined });
    } else {
      addPlan({ name: planName.trim(), description: planDescription.trim() || undefined });
    }
    setPlanDialogOpen(false);
  };

  const handleOpenTierDialog = (tier?: PricingTier) => {
    if (tier) {
      setEditingTier(tier);
      setTierName(tier.name);
      setTierDescription(tier.description || '');
    } else {
      setEditingTier(null);
      setTierName('');
      setTierDescription('');
    }
    setTierDialogOpen(true);
  };

  const handleSaveTier = () => {
    if (!tierName.trim()) return;
    
    if (editingTier) {
      updateTier(editingTier.id, { name: tierName.trim(), description: tierDescription.trim() || undefined });
    } else {
      addTier({ name: tierName.trim(), description: tierDescription.trim() || undefined });
    }
    setTierDialogOpen(false);
  };

  const handleStartPriceEdit = (planId: string, tierId: string) => {
    setEditingPrice({ planId, tierId });
    setPriceValue((getPrice(planId, tierId) / 100).toFixed(2));
  };

  const handleSavePrice = () => {
    if (editingPrice) {
      const cents = Math.round(parseFloat(priceValue || '0') * 100);
      setPrice(editingPrice.planId, editingPrice.tierId, cents);
      setEditingPrice(null);
    }
  };

  const getCurrencyIcon = (code: string) => {
    switch (code) {
      case 'EUR': return Euro;
      case 'USD': return DollarSign;
      case 'GBP': return PoundSterling;
      default: return Euro;
    }
  };

  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  return (
    <>
      <Helmet>
        <title>Einstellungen | SupportHub</title>
        <meta name="description" content="Einstellungen für SupportHub verwalten" />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl py-8 px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
              <p className="text-muted-foreground mt-1">Verwalten Sie Ihre App-Einstellungen</p>
            </div>

            <Tabs defaultValue="pricing" className="space-y-6">
              <TabsList>
                <TabsTrigger value="pricing">Preise & Pläne</TabsTrigger>
                <TabsTrigger value="general">Allgemein</TabsTrigger>
              </TabsList>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                {/* Plans Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pläne</CardTitle>
                      <CardDescription>Verwalten Sie Ihre Produkt-Pläne</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenPlanDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Plan hinzufügen
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {sortedPlans.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Noch keine Pläne definiert</p>
                    ) : (
                      <div className="space-y-2">
                        {sortedPlans.map((plan) => (
                          <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              {plan.description && (
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenPlanDialog(plan)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deletePlan(plan.id)}
                                disabled={plans.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tiers Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pricing Tiers</CardTitle>
                      <CardDescription>Verwalten Sie Ihre Preis-Stufen</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenTierDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tier hinzufügen
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {sortedTiers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Noch keine Tiers definiert</p>
                    ) : (
                      <div className="space-y-2">
                        {sortedTiers.map((tier) => (
                          <div key={tier.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div>
                              <p className="font-medium">{tier.name}</p>
                              {tier.description && (
                                <p className="text-sm text-muted-foreground">{tier.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenTierDialog(tier)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteTier(tier.id)}
                                disabled={tiers.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Matrix */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preismatrix</CardTitle>
                    <CardDescription>
                      Legen Sie die monatlichen Preise für jede Plan-Tier Kombination fest. Klicken Sie auf einen Preis zum Bearbeiten.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sortedPlans.length === 0 || sortedTiers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Fügen Sie zuerst Pläne und Tiers hinzu
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-40">Tier / Plan</TableHead>
                              {sortedPlans.map((plan) => (
                                <TableHead key={plan.id} className="text-center">
                                  {plan.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedTiers.map((tier) => (
                              <TableRow key={tier.id}>
                                <TableCell className="font-medium">{tier.name}</TableCell>
                                {sortedPlans.map((plan) => {
                                  const isEditing = editingPrice?.planId === plan.id && editingPrice?.tierId === tier.id;
                                  const price = getPrice(plan.id, tier.id);
                                  
                                  return (
                                    <TableCell key={plan.id} className="text-center">
                                      {isEditing ? (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={priceValue}
                                            onChange={(e) => setPriceValue(e.target.value)}
                                            className="w-24 h-8 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSavePrice();
                                              if (e.key === 'Escape') setEditingPrice(null);
                                            }}
                                          />
                                          <Button size="sm" variant="ghost" onClick={handleSavePrice}>
                                            ✓
                                          </Button>
                                        </div>
                                      ) : (
                                        <button
                                          className="px-3 py-1 rounded hover:bg-muted transition-colors font-semibold text-primary"
                                          onClick={() => handleStartPriceEdit(plan.id, tier.id)}
                                        >
                                          {formatCurrency(price)}
                                        </button>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Währung</CardTitle>
                    <CardDescription>Wählen Sie Ihre bevorzugte Währung</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Select 
                        value={settings.currency.code} 
                        onValueChange={(code) => {
                          const currency = AVAILABLE_CURRENCIES.find(c => c.code === code);
                          if (currency) setCurrency(currency);
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CURRENCIES.map((currency) => {
                            const Icon = getCurrencyIcon(currency.code);
                            return (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{currency.name} ({currency.symbol})</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Badge variant="outline">
                        Beispiel: {formatCurrency(99900)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Plan bearbeiten' : 'Neuer Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Bearbeiten Sie die Plan-Details.' : 'Erstellen Sie einen neuen Plan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name *</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="z.B. Enterprise"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description">Beschreibung</Label>
              <Input
                id="plan-description"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="z.B. Für große Unternehmen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSavePlan} disabled={!planName.trim()}>
              {editingPlan ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Tier bearbeiten' : 'Neuer Tier'}</DialogTitle>
            <DialogDescription>
              {editingTier ? 'Bearbeiten Sie die Tier-Details.' : 'Erstellen Sie einen neuen Pricing Tier.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tier-name">Name *</Label>
              <Input
                id="tier-name"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                placeholder="z.B. Professional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-description">Beschreibung</Label>
              <Input
                id="tier-description"
                value={tierDescription}
                onChange={(e) => setTierDescription(e.target.value)}
                placeholder="z.B. Bis 50 Nutzer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveTier} disabled={!tierName.trim()}>
              {editingTier ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}