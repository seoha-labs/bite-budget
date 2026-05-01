import { Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccountPage } from './features/account/AccountPage';
import { LoginPage } from './features/auth/LoginPage';
import { ItemFormPage } from './features/items/ItemFormPage';
import { ItemsPage } from './features/items/ItemsPage';
import { MealFormPage } from './features/meals/MealFormPage';
import { MealsPage } from './features/meals/MealsPage';
import { ReportsPage } from './features/reports/ReportsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/meals" replace />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/new" element={<ItemFormPage />} />
        <Route path="/items/:id" element={<ItemFormPage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/meals/new" element={<MealFormPage />} />
        <Route path="/meals/:id" element={<MealFormPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
