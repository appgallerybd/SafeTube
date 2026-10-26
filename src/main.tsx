import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Safely unregister any stale dev-sw registrations in development
if ('serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('dev-sw.js')) {
        registration.unregister();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
