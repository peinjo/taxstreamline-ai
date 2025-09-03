import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './lib/logging/logger'

// Initialize performance monitoring
// Note: web-vitals package would need to be installed for production use

logger.info('Application starting');

createRoot(document.getElementById("root")!).render(<App />);
