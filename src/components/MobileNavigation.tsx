
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Calculator, 
  Users,
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Business', url: '/business-manager', icon: Briefcase },
  { title: 'Invoices', url: '/invoices', icon: FileText },
  { title: 'Quotes', url: '/quotes', icon: Calculator },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Advisor', url: '/advisor', icon: MessageSquare },
];

export function MobileNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="grid grid-cols-6 h-16">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors touch-manipulation",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] leading-none">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
