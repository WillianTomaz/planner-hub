// src/App.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { usePlannerData } from './hooks/usePlannerData';
import { Layout } from './components/Layout';
import { Identification } from './pages/Identification';
import { Dashboard } from './pages/Dashboard';
import { TodoList } from './pages/TodoList';
import { Annotations } from './pages/Annotations';
import { Schedule } from './pages/Schedule';
import './assets/styles.css';

function App() {
  const { data, loading, isAuthenticated } = usePlannerData();

  if (loading) {
    return <div className="loading-screen">Loading Planner Hub...</div>;
  }
  
  // Routes protected by authentication status
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated) {
      return <Navigate to="/identification" replace />;
    }
    return children;
  };

  return (
    <Router basename="/">
      <Routes>
        <Route path="/identification" element={<Identification />} />
        
        {/* Protected Routes - All main pages */}
        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        
        {/* Dynamic routing based on JSON menu items */}
        {data?.menuConfig.menuItems.map(item => {
          // Use 'id' for the path, only for non-index items
          if (item.id !== 'index') {
            return (
              <Route 
                key={item.id}
                path={`/${item.id}`}
                element={
                  <ProtectedRoute>
                    <Layout>
                      {item.id === 'pro-todo' || item.id === 'per-todo' ? 
                        <TodoList categoryId={item.id} /> 
                        : item.id === 'annotations' ? 
                        <Annotations /> 
                        : item.id === 'schedule' ? 
                        <Schedule /> 
                        : 
                        <div className="placeholder">Content for {item.title}</div>
                      }
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
}

export default App;