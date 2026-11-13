import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureApiClient } from '@/shared/api/client';
import { apiConfig } from '@/shared/api/config';
import { App } from './app/App';
import '@/shared/styles/index.css';

async function bootstrap() {
  // With no backend yet, every API call is answered in the browser by the mock backend.
  if (apiConfig.useMocks) {
    const { mockFetch } = await import('./mocks/transport');
    configureApiClient({ transport: mockFetch });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
