import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Calendar,
  FileText,
  LayoutDashboard,
  Globe,
  ClipboardList,
  TrendingUp,
  Calculator,
  Plus,
  Search,
  Settings,
  Bell,
  Users,
  Upload,
  BookOpen,
  History,
  Receipt,
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘D', keywords: ['home', 'main'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, shortcut: '⌘C', keywords: ['events', 'schedule', 'deadlines'] },
  { path: '/compliance', label: 'Compliance', icon: ClipboardList, shortcut: '⌘L', keywords: ['regulatory', 'requirements'] },
  { path: '/tax', label: 'Tax Reports', icon: Calculator, shortcut: '⌘T', keywords: ['vat', 'income', 'calculation'] },
  { path: '/global-reporting', label: 'Global Reporting', icon: Globe, shortcut: '⌘G', keywords: ['international', 'countries'] },
  { path: '/transfer-pricing', label: 'Transfer Pricing', icon: FileText, shortcut: '⌘P', keywords: ['oecd', 'intercompany'] },
  { path: '/audit-reporting', label: 'Audit Reporting', icon: TrendingUp, shortcut: '⌘A', keywords: ['audit', 'analytics'] },
  { path: '/settings', label: 'Settings', icon: Settings, shortcut: '⌘,', keywords: ['preferences', 'profile', 'account'] },
  { path: '/notifications', label: 'Notifications', icon: Bell, shortcut: '⌘N', keywords: ['alerts', 'messages'] },
];

const quickActions = [
  { id: 'new-calculation', label: 'New Tax Calculation', icon: Calculator, path: '/tax', keywords: ['calculate', 'vat'] },
  { id: 'new-event', label: 'Create Calendar Event', icon: Plus, path: '/calendar', keywords: ['schedule', 'deadline'] },
  { id: 'new-compliance', label: 'Add Compliance Item', icon: ClipboardList, path: '/compliance', keywords: ['regulatory'] },
  { id: 'upload-document', label: 'Upload Document', icon: Upload, path: '/tax?tab=documents', keywords: ['file', 'receipt'] },
  { id: 'new-transaction', label: 'Add Transaction', icon: Receipt, path: '/tax?tab=transactions', keywords: ['income', 'expense'] },
  { id: 'view-guides', label: 'View Tax Guides', icon: BookOpen, path: '/tax?tab=guides', keywords: ['help', 'firs'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle command palette with Ctrl+K or Cmd+K
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => setOpen(prev => !prev),
      description: 'Open command palette',
    },
  ]);

  // Close on escape and handle other shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset search when opening
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  // Filter items based on search
  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return navigationItems;
    const query = searchQuery.toLowerCase();
    return navigationItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.keywords.some(k => k.includes(query))
    );
  }, [searchQuery]);

  const filteredActions = useMemo(() => {
    if (!searchQuery) return quickActions;
    const query = searchQuery.toLowerCase();
    return quickActions.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.keywords.some(k => k.includes(query))
    );
  }, [searchQuery]);

  // Get current page for highlighting
  const currentPath = location.pathname;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search pages, actions, or type a command..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>
        </CommandEmpty>
        
        {filteredNavigation.length > 0 && (
          <CommandGroup heading="Navigation">
            {filteredNavigation.map((item) => (
              <CommandItem 
                key={item.path}
                onSelect={() => handleNavigate(item.path)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                  {currentPath === item.path && (
                    <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{item.shortcut}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredActions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              {filteredActions.map((action) => (
                <CommandItem 
                  key={action.id}
                  onSelect={() => handleNavigate(action.path)}
                  className="flex items-center"
                >
                  <action.icon className="mr-2 h-4 w-4 text-primary" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Tips">
          <div className="px-2 py-3 text-xs text-muted-foreground">
            <p>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd> <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd> to navigate</p>
            <p className="mt-1">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to select</p>
            <p className="mt-1">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close</p>
          </div>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
