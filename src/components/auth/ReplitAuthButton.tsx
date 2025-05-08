
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ReplitAuthProps {
  onAuth?: () => void;
}

export const ReplitAuthButton: React.FC<ReplitAuthProps> = ({ onAuth }) => {
  useEffect(() => {
    // Create script element for Replit Auth
    const script = document.createElement('script');
    script.src = 'https://auth.util.repl.co/script.js';
    script.setAttribute('authed', 'location.reload()');
    
    // Add the script to the container
    const container = document.getElementById('replit-auth-container');
    if (container) {
      container.appendChild(script);
    }
    
    return () => {
      // Clean up on unmount
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div id="replit-auth-container" className="flex justify-center">
      {/* The Replit Auth script will create its elements here */}
    </div>
  );
};

export default ReplitAuthButton;
