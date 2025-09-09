import { useState } from 'react';
import { DeviceFrame, DEVICE_TYPES, DeviceType } from '@/components/DeviceFrame';
import { DeviceSelector } from '@/components/DeviceSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

// Import your main app pages to preview
import Dashboard from './Dashboard';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function MobilePreview() {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(DEVICE_TYPES[0]);
  const [selectedPage, setSelectedPage] = useState('dashboard');

  const pages = [
    { id: 'dashboard', name: 'Dashboard', component: Dashboard },
    // Add more pages as needed
  ];

  const currentPage = pages.find(p => p.id === selectedPage);
  const PageComponent = currentPage?.component || Dashboard;

  return (
    <>
      <SEO 
        title="Mobile Preview" 
        description="Preview your construction management app on different mobile devices"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Mobile Preview</h1>
                <p className="text-muted-foreground">
                  Preview your app on different mobile devices
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Preview
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DeviceSelector
                    selectedDevice={selectedDevice}
                    onDeviceChange={setSelectedDevice}
                  />
                </CardContent>
              </Card>

              {/* Page Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Page Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <Button
                        key={page.id}
                        variant={selectedPage === page.id ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedPage(page.id)}
                      >
                        {page.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span className="font-mono">
                      {selectedDevice.screenWidth} × {selectedDevice.screenHeight}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aspect Ratio:</span>
                    <span className="font-mono">
                      {(selectedDevice.screenWidth / selectedDevice.screenHeight).toFixed(2)}:1
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Device:</span>
                    <span>{selectedDevice.name}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => window.open(window.location.href, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Device Preview */}
            <div className="lg:col-span-3">
              <div className="flex justify-center items-start py-8">
                <DeviceFrame device={selectedDevice}>
                  <SidebarProvider>
                    <div className="w-full h-full">
                      <PageComponent />
                    </div>
                  </SidebarProvider>
                </DeviceFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}