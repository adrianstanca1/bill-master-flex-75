import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { secureStorage } from '@/lib/SecureStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function SecurityMigrationManager() {
  const [migrationStatus, setMigrationStatus] = useState<{
    migrated: number;
    errors: number;
    unencryptedKeys: string[];
    isRunning: boolean;
    lastRun?: Date;
  }>({
    migrated: 0,
    errors: 0,
    unencryptedKeys: [],
    isRunning: false
  });

  const { toast } = useToast();

  const scanAndMigrate = async () => {
    setMigrationStatus(prev => ({ ...prev, isRunning: true }));

    try {
      // Scan for unencrypted data
      const unencryptedKeys = secureStorage.scanForUnencryptedData();
      
      // Force migration of legacy data
      const { migrated, errors } = secureStorage.migrateLegacyData();
      
      // Clear any remaining legacy data after successful migration
      if (migrated > 0 && errors === 0) {
        unencryptedKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // Log security event
      await supabase.from('security_audit_log').insert({
        action: 'DATA_MIGRATION_COMPLETED',
        resource: 'client_storage',
        details: {
          migrated_keys: migrated,
          error_count: errors,
          unencrypted_keys_found: unencryptedKeys.length,
          timestamp: new Date().toISOString()
        }
      });

      setMigrationStatus({
        migrated,
        errors,
        unencryptedKeys: secureStorage.scanForUnencryptedData(), // Re-scan after migration
        isRunning: false,
        lastRun: new Date()
      });

      if (migrated > 0) {
        toast({
          title: "Security Enhancement Complete",
          description: `Successfully migrated ${migrated} items to encrypted storage.`,
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus(prev => ({ ...prev, isRunning: false }));
      
      toast({
        title: "Migration Error",
        description: "Failed to complete data migration. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Auto-run migration on component mount
    scanAndMigrate();
  }, []);

  const getMigrationStatusVariant = () => {
    if (migrationStatus.unencryptedKeys.length === 0) return "default";
    if (migrationStatus.unencryptedKeys.length <= 2) return "secondary";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Storage Migration
        </CardTitle>
        <CardDescription>
          Automatic encryption of sensitive client-side data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrationStatus.unencryptedKeys.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Found {migrationStatus.unencryptedKeys.length} unencrypted items requiring migration
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-semibold">{migrationStatus.migrated}</span>
            </div>
            <p className="text-sm text-muted-foreground">Migrated</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">{migrationStatus.unencryptedKeys.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Unencrypted</p>
          </div>
          
          <div className="text-center">
            <Badge variant={getMigrationStatusVariant()}>
              {migrationStatus.unencryptedKeys.length === 0 ? 'Secure' : 'At Risk'}
            </Badge>
          </div>
        </div>

        {migrationStatus.unencryptedKeys.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Unencrypted Keys:</p>
            <div className="flex flex-wrap gap-2">
              {migrationStatus.unencryptedKeys.map((key) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button 
            onClick={scanAndMigrate}
            disabled={migrationStatus.isRunning}
            size="sm"
            variant={migrationStatus.unencryptedKeys.length > 0 ? "default" : "outline"}
          >
            {migrationStatus.isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              'Force Migration'
            )}
          </Button>
          
          {migrationStatus.lastRun && (
            <p className="text-xs text-muted-foreground">
              Last run: {migrationStatus.lastRun.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}