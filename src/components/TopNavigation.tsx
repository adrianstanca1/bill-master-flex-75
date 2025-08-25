import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Menu,
  Home,
  LayoutDashboard,
  Building2,
  FileText,
  Receipt,
  Users,
  MessageSquare,
  Bot,
  Shield,
  Settings,
  Zap,
  Calculator,
  PieChart,
  Clock,
  Briefcase,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'Business',
    icon: Building2,
    children: [
      { title: 'Business Manager', href: '/business-manager', description: 'Comprehensive business overview' },
      { title: 'Projects', href: '/projects', description: 'Project management and tracking' },
      { title: 'Site Manager', href: '/site-manager', description: 'Site operations and coordination' },
      { title: 'HR Management', href: '/hr', description: 'Employee and team management' }
    ]
  },
  {
    title: 'Finance',
    icon: Calculator,
    children: [
      { title: 'Invoices', href: '/invoices', description: 'Create and manage invoices' },
      { title: 'Quotes', href: '/quotes', description: 'Generate professional quotes' },
      { title: 'Variations', href: '/variations', description: 'Project change orders' },
      { title: 'CRM', href: '/crm', description: 'Customer relationship management' }
    ]
  },
  {
    title: 'AI Tools',
    icon: Bot,
    children: [
      { title: 'AI Advisor', href: '/advisor', description: 'Business intelligence advisor' },
      { title: 'Smart Agents', href: '/agents', description: 'Automated AI assistants' }
    ]
  },
  {
    title: 'System',
    icon: Settings,
    children: [
      { title: 'Security', href: '/security', description: 'Security monitoring' },
      { title: 'Tool Setup', href: '/tool-setup', description: 'Configure integrations' },
      { title: 'Settings', href: '/settings', description: 'Application settings' }
    ]
  }
];

export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names.length > 1 ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase() : names[0].charAt(0).toUpperCase();
    }
    return session?.user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <Zap className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors duration-200" />
          </div>
          <span className="font-bold text-xl text-gradient">
            AS Agents
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                      isActivePath('/') && location.pathname === '/' && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger 
                        className={cn(
                          "bg-background",
                          item.children.some(child => isActivePath(child.href)) && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-1 p-2 w-[400px] bg-background border border-border shadow-lg z-50">
                          {item.children.map((child) => (
                            <NavigationMenuLink key={child.href} asChild>
                              <Link
                                to={child.href}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  isActivePath(child.href) && "bg-accent text-accent-foreground"
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{child.title}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {child.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                          isActivePath(item.href!) && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* User Menu / Auth */}
        <div className="flex items-center space-x-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg z-50" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account-settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background z-50">
                <div className="mt-6 flow-root">
                  <div className="space-y-2">
                    <Link
                      to="/"
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        location.pathname === '/' && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Home
                    </Link>

                    {navigationItems.map((item) => (
                      <div key={item.title}>
                        {item.children ? (
                          <div className="space-y-1">
                            <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.title}
                            </div>
                            <div className="ml-6 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActivePath(child.href) && "bg-accent text-accent-foreground"
                                  )}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={item.href!}
                            className={cn(
                              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActivePath(item.href!) && "bg-accent text-accent-foreground"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}