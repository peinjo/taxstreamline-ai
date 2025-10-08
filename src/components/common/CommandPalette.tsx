import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle command palette with Ctrl+K
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => setOpen(prev => !prev),
      description: 'Open command palette',
    },
  ]);

  // Close on escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleNavigate('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/compliance')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Compliance</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘L</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/tax')}>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Tax Reports</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘T</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/global-reporting')}>
            <Globe className="mr-2 h-4 w-4" />
            <span>Global Reporting</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘G</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/transfer-pricing')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Transfer Pricing</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘P</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate('/audit-reporting')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Audit Reporting</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘A</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleAction(() => console.log('Create event'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Event</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘N E</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction(() => console.log('New compliance'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Compliance Item</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘N C</span>
          </CommandItem>
          <CommandItem onSelect={() => handleAction(() => console.log('New document'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Document</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘N D</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Search">
          <CommandItem onSelect={() => handleAction(() => console.log('Search'))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Everything</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘/</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
