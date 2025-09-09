import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DEVICE_TYPES, DeviceType } from './DeviceFrame';
import { Smartphone, Tablet } from 'lucide-react';

interface DeviceSelectorProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  className?: string;
}

export function DeviceSelector({ selectedDevice, onDeviceChange, className }: DeviceSelectorProps) {
  const handleDeviceChange = (deviceId: string) => {
    const device = DEVICE_TYPES.find(d => d.id === deviceId);
    if (device) {
      onDeviceChange(device);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {selectedDevice.id.includes('ipad') ? (
            <Tablet className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Smartphone className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Device Preview</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedDevice.screenWidth} × {selectedDevice.screenHeight}
        </Badge>
      </div>
      
      <Select 
        value={selectedDevice.id} 
        onValueChange={handleDeviceChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedDevice.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DEVICE_TYPES.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              <div className="flex items-center justify-between w-full">
                <span>{device.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {device.screenWidth} × {device.screenHeight}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}