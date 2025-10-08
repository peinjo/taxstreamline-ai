import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    {
      key: 'd',
      ctrl: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: 'c',
      ctrl: true,
      action: () => navigate('/calendar'),
      description: 'Go to Calendar',
    },
    {
      key: 'l',
      ctrl: true,
      action: () => navigate('/compliance'),
      description: 'Go to Compliance',
    },
    {
      key: 't',
      ctrl: true,
      action: () => navigate('/tax'),
      description: 'Go to Tax Reports',
    },
    {
      key: 'g',
      ctrl: true,
      action: () => navigate('/global-reporting'),
      description: 'Go to Global Reporting',
    },
    {
      key: 'p',
      ctrl: true,
      action: () => navigate('/transfer-pricing'),
      description: 'Go to Transfer Pricing',
    },
    {
      key: 'a',
      ctrl: true,
      action: () => navigate('/audit-reporting'),
      description: 'Go to Audit Reporting',
    },
  ]);
}
