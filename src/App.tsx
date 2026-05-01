import { AuthProvider } from './features/auth/AuthProvider';
import { AppRoutes } from './router';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
