import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { AuthPage } from '@/features/auth/AuthPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { AppLayout } from '@/components/AppLayout';
import { TodosPage } from '@/features/todos/TodosPage';
import { IdeasPage } from '@/features/ideas/IdeasPage';
import { ListsPage } from '@/features/lists/ListsPage';
import { ListDetailPage } from '@/features/lists/ListDetailPage';
import { useLastTab } from '@/hooks/useLastTab';

/** Sends "/" and unknown paths to the last visited tab (auth guard handles the rest). */
function RootRedirect() {
  const { getLastTab } = useLastTab();
  return <Navigate to={getLastTab()} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />

      {/* Protected app shell */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:listId" element={<ListDetailPage />} />
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
