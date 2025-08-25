import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeographicData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

interface LoginAnomaly {
  isAnomalous: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  previousLocation?: GeographicData;
  currentLocation?: GeographicData;
}

export function useGeographicSecurity() {
  const [currentLocation, setCurrentLocation] = useState<GeographicData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Get approximate location from browser
  const getCurrentLocation = useCallback(async (): Promise<GeographicData | null> => {
    try {
      // Use timezone and language as location indicators
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || 'en-US';
      
      // Simple location detection based on timezone
      const locationMap: Record<string, { country: string; region: string; city: string }> = {
        'Europe/London': { country: 'GB', region: 'England', city: 'London' },
        'America/New_York': { country: 'US', region: 'New York', city: 'New York' },
        'America/Los_Angeles': { country: 'US', region: 'California', city: 'Los Angeles' },
        'Europe/Paris': { country: 'FR', region: 'Île-de-France', city: 'Paris' },
        'Europe/Berlin': { country: 'DE', region: 'Berlin', city: 'Berlin' },
        // Add more as needed
      };

      const location = locationMap[timezone] || {
        country: locale.split('-')[1] || 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      };

      return {
        ...location,
        timezone
      };
    } catch (error) {
      console.warn('Could not determine location:', error);
      return null;
    }
  }, []);

  // Check for login anomalies
  const checkLoginAnomaly = useCallback(async (userId: string): Promise<LoginAnomaly> => {
    try {
      setIsChecking(true);
      
      const current = await getCurrentLocation();
      if (!current) {
        return { isAnomalous: false, riskLevel: 'low' };
      }

      // Get recent login locations from audit log
      const { data: recentLogins } = await supabase
        .from('security_audit_log')
        .select('details')
        .eq('user_id', userId)
        .eq('action', 'LOGIN_SUCCESS')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentLogins?.length) {
        // First time login or no recent history
        return { isAnomalous: false, riskLevel: 'low', currentLocation: current };
      }

      // Check for location patterns - parse stored location data
      const locations: GeographicData[] = [];
      
      recentLogins.forEach(log => {
        if (typeof log.details === 'object' && log.details) {
          // Try to parse location data from various possible formats
          let locationData: any = null;
          
          if ('location' in log.details && typeof log.details.location === 'object') {
            locationData = log.details.location;
          } else if ('country' in log.details && 'timezone' in log.details) {
            locationData = {
              country: log.details.country,
              region: log.details.region || 'Unknown',
              city: log.details.city || 'Unknown',
              timezone: log.details.timezone
            };
          }
          
          if (locationData && locationData.country && locationData.timezone) {
            locations.push(locationData as GeographicData);
          }
        }
      });

      if (locations.length === 0) {
        return { isAnomalous: false, riskLevel: 'low', currentLocation: current };
      }

      // Check for significant location changes
      const lastLocation = locations[0];
      const isNewCountry = current.country !== lastLocation.country;
      const isNewTimezone = current.timezone !== lastLocation.timezone;

      let anomaly: LoginAnomaly = {
        isAnomalous: false,
        riskLevel: 'low',
        currentLocation: current,
        previousLocation: lastLocation
      };

      if (isNewCountry) {
        anomaly = {
          isAnomalous: true,
          reason: 'Login from new country detected',
          riskLevel: 'high',
          currentLocation: current,
          previousLocation: lastLocation
        };
      } else if (isNewTimezone) {
        anomaly = {
          isAnomalous: true,
          reason: 'Login from new timezone detected',
          riskLevel: 'medium',
          currentLocation: current,
          previousLocation: lastLocation
        };
      }

      // Log the location check
      await supabase.from('security_audit_log').insert({
        user_id: userId,
        action: 'LOCATION_CHECK',
        resource_type: 'security_monitoring',
        details: {
          country: current.country,
          region: current.region,
          timezone: current.timezone,
          anomaly: anomaly.isAnomalous,
          risk_level: anomaly.riskLevel,
          timestamp: new Date().toISOString()
        }
      });

      return anomaly;
    } catch (error) {
      console.error('Geographic security check failed:', error);
      return { isAnomalous: false, riskLevel: 'low' };
    } finally {
      setIsChecking(false);
    }
  }, [getCurrentLocation]);

  // Alert user of anomalies
  const handleLocationAnomaly = useCallback((anomaly: LoginAnomaly) => {
    if (!anomaly.isAnomalous) return;

    const severity = anomaly.riskLevel === 'high' ? 'destructive' : 'default';
    
    toast({
      title: "Unusual Login Location Detected",
      description: `${anomaly.reason}. If this wasn't you, please secure your account immediately.`,
      variant: severity as any,
      duration: 10000,
    });
  }, [toast]);

  // Initialize location tracking
  useEffect(() => {
    getCurrentLocation().then(setCurrentLocation);
  }, [getCurrentLocation]);

  return {
    currentLocation,
    isChecking,
    checkLoginAnomaly,
    handleLocationAnomaly,
    getCurrentLocation
  };
}