import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PlannerDataProvider, usePlannerData } from './hooks/usePlannerData';
import { Layout } from './components/Layout';
import { Identification } from './pages/Identification';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TodoList } from './pages/TodoList';
import { Annotations } from './pages/Annotations';
import { Schedule } from './pages/Schedule';
import './assets/styles.css';

import { useEffect } from 'react';
import { initGA, pageview } from './lib/analytics';

function AppRouterWrapper() {
  const location = useLocation();

  useEffect(() => {
    // sends pageview whenever the route changes
    pageview(location.pathname + location.search);
  }, [location]);

  return null;
}

const AppRoutes: React.FC = () => {
  const { data, loading, isAuthenticated } = usePlannerData();

  if (loading) {
    return <div className="loading-screen">Loading Planner Hub...</div>;
  }

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated) {
      return <Navigate to="/identification" replace />;
    }
    return children;
  };

  return (
    <Router basename="/">
      <AppRouterWrapper />
      <Routes>
        <Route path="/identification" element={<Identification />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

        {data?.menuConfig.menuItems.map(item => {
          if (item.id !== 'index') {
            return (
              <Route
                key={item.id}
                path={`/${item.id}`}
                element={
                  <ProtectedRoute>
                    <Layout>
                      {item.id === 'pro-todo' || item.id === 'per-todo' ? <TodoList categoryId={item.id} /> :
                       item.id === 'annotations' ? <Annotations /> :
                       item.id === 'schedule' ? <Schedule /> :
                       <div className="placeholder">Content for {item.title}</div>}
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          }
          return null;
        })}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  useEffect(() => {
    // Initializes Google Analytics when the application is built.
    // Automatic script injection was not enabled by default,
    // because the GA snippet is usually added to index.html.
    // If you prefer to load dynamically, call initGA(true).
    initGA();
  }, []);

  return (
    <PlannerDataProvider>
      <AppRoutes />
    </PlannerDataProvider>
  );
}

export default App;