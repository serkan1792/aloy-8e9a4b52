import { 
  LayoutDashboard, 
  Building2, 
  AlertCircle,
  FolderKanban,
  Megaphone,
  BarChart3,
  FileText,
  BookOpen,
  Plug,
  Settings, 
  RefreshCw,
  ChevronLeft,
  Users,
  Building,
  Contact,
  ListTodo,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface SubItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  subItems?: SubItem[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { 
    icon: Building2, 
    label: 'Accounts', 
    path: '/accounts',
    subItems: [
      { icon: Building2, label: 'Accounts', path: '/accounts' },
      { icon: Building, label: 'Companies', path: '/accounts/companies' },
      { icon: Contact, label: 'Contacts', path: '/accounts/contacts' },
    ]
  },
  { 
    icon: AlertCircle, 
    label: 'Issues', 
    path: '/issues',
    subItems: [
      { icon: ListTodo, label: 'All Issues', path: '/issues' },
    ]
  },
  { 
    icon: FolderKanban, 
    label: 'Projects & Tasks', 
    path: '/projects',
    subItems: [
      { icon: FolderKanban, label: 'All Projects', path: '/projects' },
      { icon: CheckSquare, label: 'All Tasks', path: '/projects/tasks' },
    ]
  },
  { icon: Megaphone, label: 'Broadcasts', path: '/broadcasts' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BookOpen, label: 'Knowledge Base', path: '/knowledge-base' },
  { icon: Plug, label: 'Integrations', path: '/integrations' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

// Helper to find which nav item we're currently in based on path
function findActiveSection(pathname: string): NavItem | null {
  for (const item of navItems) {
    if (item.subItems) {
      // Check if any sub-item path matches
      if (item.subItems.some(sub => pathname === sub.path || pathname.startsWith(sub.path + '/'))) {
        return item;
      }
      // Also check the parent path
      if (pathname.startsWith(item.path)) {
        return item;
      }
    }
  }
  return null;
}

export function AppSidebar() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're in a sub-section
  const activeSection = findActiveSection(location.pathname);
  const hasSubItems = activeSection?.subItems && activeSection.subItems.length > 0;
  const showSubNav = hasSubItems;

  const handleCrmSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
    toast({
      title: 'CRM Sync erfolgreich',
      description: '12 Kontakte und 3 Unternehmen wurden synchronisiert.',
    });
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Items to display - either sub-items or main items
  const displayItems = showSubNav ? activeSection.subItems! : navItems;

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SP</span>
          </div>
          <span className="font-semibold text-foreground">SupportHub</span>
        </div>
      </div>

      {/* Back button when in sub-navigation */}
      {showSubNav && (
        <div className="px-4 pt-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {activeSection.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 pt-2">
        <ul className="space-y-1">
          {displayItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* CRM Sync Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleCrmSync}
          disabled={syncing}
        >
          <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
          {syncing ? 'Synchronisiere...' : 'Sync CRM'}
        </Button>
      </div>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium text-sm">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Support Agent</p>
            <p className="text-xs text-muted-foreground truncate">agent@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
