import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DeviceType {
  id: string;
  name: string;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
}

export const DEVICE_TYPES: DeviceType[] = [
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    frameWidth: 430,
    frameHeight: 932,
    screenX: 18,
    screenY: 40,
    screenWidth: 393,
    screenHeight: 852,
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    frameWidth: 410,
    frameHeight: 747,
    screenX: 17,
    screenY: 40,
    screenWidth: 375,
    screenHeight: 667,
  },
  {
    id: 'android-pixel-7',
    name: 'Google Pixel 7',
    width: 412,
    height: 915,
    frameWidth: 448,
    frameHeight: 995,
    screenX: 18,
    screenY: 40,
    screenWidth: 412,
    screenHeight: 915,
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    frameWidth: 1064,
    frameHeight: 1406,
    screenX: 20,
    screenY: 20,
    screenWidth: 1024,
    screenHeight: 1366,
  },
];

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
  className?: string;
}

export function DeviceFrame({ device, children, className }: DeviceFrameProps) {
  const isTablet = device.id.includes('ipad');
  const isAndroid = device.id.includes('android') || device.id.includes('pixel');

  return (
    <div className={cn('relative mx-auto', className)}>
      {/* Device Frame */}
      <div
        className={cn(
          'relative bg-gradient-to-b shadow-2xl',
          isTablet 
            ? 'from-slate-200 to-slate-300 rounded-3xl border-4 border-slate-300'
            : isAndroid
            ? 'from-slate-800 to-slate-900 rounded-3xl border-2 border-slate-700'
            : 'from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] border-8 border-slate-900'
        )}
        style={{
          width: device.frameWidth,
          height: device.frameHeight,
        }}
      >
        {/* Notch for iPhone */}
        {device.id.includes('iphone') && !device.id.includes('se') && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-black rounded-b-2xl z-20" />
        )}

        {/* Home indicator for newer iPhones */}
        {device.id.includes('iphone') && !device.id.includes('se') && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-100 rounded-full opacity-60 z-20" />
        )}

        {/* Android navigation bar */}
        {isAndroid && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-6 z-20">
            <div className="w-4 h-4 rounded-full bg-slate-400 opacity-70" />
            <div className="w-4 h-4 rounded-full bg-slate-400 opacity-70" />
            <div className="w-4 h-4 rounded-full bg-slate-400 opacity-70" />
          </div>
        )}

        {/* Screen Area */}
        <div
          className={cn(
            'absolute bg-black overflow-hidden',
            isTablet ? 'rounded-2xl' : 'rounded-3xl'
          )}
          style={{
            left: device.screenX,
            top: device.screenY,
            width: device.screenWidth,
            height: device.screenHeight,
          }}
        >
          {/* Screen Content */}
          <div className="w-full h-full bg-background overflow-auto">
            <div 
              className="origin-top-left scale-75 sm:scale-90 lg:scale-100"
              style={{
                width: device.screenWidth,
                height: 'max-content',
                minHeight: device.screenHeight,
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Power Button */}
        {!isTablet && (
          <div 
            className={cn(
              'absolute w-1 h-12 rounded-full',
              isAndroid ? 'bg-slate-600 right-0 top-24' : 'bg-slate-700 right-0 top-32'
            )}
          />
        )}

        {/* Volume Buttons */}
        {!isTablet && (
          <>
            <div 
              className={cn(
                'absolute w-1 h-8 rounded-full',
                isAndroid ? 'bg-slate-600 left-0 top-20' : 'bg-slate-700 left-0 top-28'
              )}
            />
            <div 
              className={cn(
                'absolute w-1 h-8 rounded-full',
                isAndroid ? 'bg-slate-600 left-0 top-32' : 'bg-slate-700 left-0 top-40'
              )}
            />
          </>
        )}
      </div>

      {/* Status Bar Elements for iPhone */}
      {device.id.includes('iphone') && (
        <div className="absolute top-12 left-0 right-0 z-30 px-8 flex justify-between items-center text-white text-sm font-medium">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
              <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
            </div>
            <svg className="w-6 h-4" viewBox="0 0 24 12" fill="currentColor">
              <path d="M2 3h20v6H2z" opacity="0.35"/>
              <path d="M2 4h16v4H2z"/>
              <path d="M23 5v2h1V5z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Device Label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <span className="text-sm font-medium text-muted-foreground">
          {device.name}
        </span>
      </div>
    </div>
  );
}