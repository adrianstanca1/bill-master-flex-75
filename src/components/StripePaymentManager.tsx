import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Receipt, 
  Crown, 
  Zap, 
  Star,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  interval?: 'month' | 'year';
  currency: string;
  features: string[];
  recommended?: boolean;
  icon: React.ComponentType<any>;
}

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'one-time-small',
    name: 'Quick Payment',
    amount: 99,
    currency: 'gbp',
    features: ['One-time invoice payment', 'Instant processing', 'Email receipt'],
    icon: Receipt
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    amount: 29.99,
    interval: 'month',
    currency: 'gbp',
    features: ['Basic dashboard', '5 projects', 'Invoice management', 'Email support'],
    icon: Star
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    amount: 79.99,
    interval: 'month',
    currency: 'gbp',
    features: ['Full dashboard', 'Unlimited projects', 'Advanced analytics', 'AI agents', 'Priority support'],
    recommended: true,
    icon: Crown
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    amount: 199.99,
    interval: 'month',
    currency: 'gbp',
    features: ['Enterprise features', 'Custom integrations', 'Dedicated support', 'On-premise options'],
    icon: Zap
  }
];

export function StripePaymentManager() {
  const { toast } = useToast();
  const { user, session } = useAuthContext();
  const [loading, setLoading] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('gbp');

  const handlePayment = async (planId: string, isSubscription: boolean = false) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to process payments",
        variant: "destructive"
      });
      return;
    }

    setLoading(planId);
    
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const functionName = isSubscription ? 'create-subscription' : 'create-payment';
      const payload = isSubscription ? {
        planName: planId,
        amount: Math.round(plan.amount * 100), // Convert to pence
        interval: plan.interval || 'month',
        currency: plan.currency,
        metadata: { plan_id: planId }
      } : {
        amount: plan.amount,
        currency: plan.currency,
        description: plan.name,
        metadata: { plan_id: planId }
      };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab",
        });
      } else {
        throw new Error("No payment URL received");
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCustomPayment = async () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to process payments",
        variant: "destructive"
      });
      return;
    }

    setLoading('custom');

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: amount,
          currency: selectedCurrency,
          description: customDescription || 'Custom Payment',
          metadata: { type: 'custom' }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab",
        });

        // Reset form
        setCustomAmount('');
        setCustomDescription('');
      } else {
        throw new Error("No payment URL received");
      }

    } catch (error) {
      console.error('Custom payment error:', error);
      toast({
        title: "Payment Error", 
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment & Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="one-time">One-Time Payments</TabsTrigger>
            <TabsTrigger value="custom">Custom Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PAYMENT_PLANS.filter(plan => plan.interval).map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card key={plan.id} className={`relative ${plan.recommended ? 'ring-2 ring-primary' : ''}`}>
                    {plan.recommended && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Recommended
                      </Badge>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">£{plan.amount}</div>
                          <div className="text-sm text-muted-foreground">/{plan.interval}</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handlePayment(plan.id, true)}
                        disabled={loading === plan.id}
                        className="w-full"
                        variant={plan.recommended ? "default" : "outline"}
                      >
                        {loading === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Subscribe
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="one-time" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {PAYMENT_PLANS.filter(plan => !plan.interval).map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <div className="text-xl font-bold">£{plan.amount}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handlePayment(plan.id, false)}
                        disabled={loading === plan.id}
                        className="w-full"
                        variant="outline"
                      >
                        {loading === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay Now
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Payment description..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={handleCustomPayment}
                  disabled={loading === 'custom' || !customAmount}
                  className="w-full"
                >
                  {loading === 'custom' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Payment
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}