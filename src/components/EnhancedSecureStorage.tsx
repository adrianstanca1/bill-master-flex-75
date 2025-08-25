import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Unlock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StoredItem {
  key: string;
  timestamp: string;
  encrypted: boolean;
}

export function EnhancedSecureStorage() {
  const [storedItems, setStoredItems] = useState<StoredItem[]>([]);
  const [testKey, setTestKey] = useState('');
  const [testValue, setTestValue] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [legacyItems, setLegacyItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkStorageStatus();
    scanLegacyStorage();
  }, []);

  const checkStorageStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('resource_id, created_at')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('action', 'SECURE_STORE')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const items = data.map(item => ({
          key: item.resource_id,
          timestamp: item.created_at,
          encrypted: true
        }));
        setStoredItems(items);
      }
    } catch (error) {
      console.error('Failed to check storage status:', error);
    }
  };

  const scanLegacyStorage = () => {
    const legacyKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('supabase.') && !key.startsWith('sb-')) {
        legacyKeys.push(key);
      }
    }
    setLegacyItems(legacyKeys);
  };

  const testSecureStore = async () => {
    if (!testKey || !testValue) {
      toast({
        title: "Missing Data",
        description: "Please provide both key and value for testing",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('secure_store_data', {
        store_key: testKey,
        store_value: JSON.parse(`"${testValue}"`)
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Storage Test Successful",
          description: "Data has been securely stored",
        });
        setTestKey('');
        setTestValue('');
        checkStorageStatus();
      }
    } catch (error) {
      console.error('Secure store test failed:', error);
      toast({
        title: "Storage Test Failed",
        description: "Failed to store data securely",
        variant: "destructive",
      });
    }
  };

  const testSecureRetrieve = async (key: string) => {
    try {
      const { data, error } = await supabase.rpc('secure_retrieve_data', {
        store_key: key
      });

      if (error) throw error;

      toast({
        title: "Retrieval Successful",
        description: `Retrieved: ${JSON.stringify(data)}`,
      });
    } catch (error) {
      console.error('Secure retrieve test failed:', error);
      toast({
        title: "Retrieval Failed",
        description: "Failed to retrieve data securely",
        variant: "destructive",
      });
    }
  };

  const migrateToSecureStorage = async () => {
    setMigrationStatus('in-progress');
    let migrated = 0;
    let failed = 0;

    for (const key of legacyItems) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const { data, error } = await supabase.rpc('secure_store_data', {
            store_key: `migrated_${key}`,
            store_value: JSON.parse(`"${value}"`)
          });

          if (!error && data) {
            localStorage.removeItem(key);
            migrated++;
          } else {
            failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
        failed++;
      }
    }

    setMigrationStatus('completed');
    toast({
      title: "Migration Complete",
      description: `Migrated ${migrated} items, ${failed} failed`,
      variant: failed > 0 ? "destructive" : "default",
    });

    scanLegacyStorage();
    checkStorageStatus();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Secure Storage
          </CardTitle>
          <CardDescription>
            Test and manage encrypted data storage with database-backed security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {legacyItems.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Found {legacyItems.length} unencrypted items in localStorage:</p>
                  <div className="flex flex-wrap gap-1">
                    {legacyItems.map(key => (
                      <Badge key={key} variant="outline">{key}</Badge>
                    ))}
                  </div>
                  <Button
                    onClick={migrateToSecureStorage}
                    disabled={migrationStatus === 'in-progress'}
                    size="sm"
                    className="mt-2"
                  >
                    {migrationStatus === 'in-progress' ? 'Migrating...' : 'Migrate to Secure Storage'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-key">Test Key</Label>
              <Input
                id="test-key"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Enter test key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-value">Test Value</Label>
              <Input
                id="test-value"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
                placeholder="Enter test value"
              />
            </div>
          </div>

          <Button onClick={testSecureStore} className="w-full">
            <Lock className="h-4 w-4 mr-2" />
            Test Secure Store
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Stored Items ({storedItems.length})
          </CardTitle>
          <CardDescription>
            Securely stored items in encrypted database storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storedItems.length === 0 ? (
            <p className="text-muted-foreground">No items stored yet</p>
          ) : (
            <div className="space-y-2">
              {storedItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{item.key}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Lock className="h-3 w-3 mr-1" />
                      Encrypted
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSecureRetrieve(item.key)}
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}