import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import './i18n';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

// react-router expects a basename without trailing slash; Vite's BASE_URL
// always ends in one (e.g. "/" or "/bite-budget/").
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
