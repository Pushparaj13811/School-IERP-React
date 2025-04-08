import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { routes } from './routes';
import AuthLayout from "./components/layout/AuthLayout";
import "@fortawesome/fontawesome-free/css/all.min.css";
import PublicLayout from "./components/layout/PublicLayout";

// Import bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Logout = lazy(() => import('./pages/Logout'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#292648]"></div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
          {/* Unauthorized page - accessible to everyone */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Logout route */}
          <Route path="/logout" element={<Logout />} />
          
          {/* Protected routes with authenticated layout */}
          <Route element={<AuthLayout />}>
            {routes.map((route) => {
              // Skip logout route as it's handled separately
              if (route.path === '/logout') return null;
              
              const RouteComponent = route.component;
              
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute allowedRoles={route.roles}>
                      <Suspense fallback={<LoadingFallback />}>
                        <RouteComponent user={user} />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              );
            })}
          </Route>
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
