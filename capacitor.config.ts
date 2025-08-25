
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5295eab364974c888ecf70d77bf6640d',
  appName: 'bill-master-flex',
  webDir: 'dist',
  server: {
    url: 'https://5295eab3-6497-4c88-8ecf-70d77bf6640d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1f36',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1f36'
    }
  }
};

export default config;
