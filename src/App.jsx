import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Invite from './pages/Invite';
import StepTemplate from './pages/StepTemplate';
import PodStepTemplate from './pages/PodStepTemplate';




function App() {
  const { onAuthStateChange } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange();
    return () => unsubscribe();
  }, [onAuthStateChange]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/project/:projectId/invite"
            element={
              <ProtectedRoute>
                <Invite />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Route for P.O.D projects - direct to P.O.D template */}
        <Route
          path="/project/:projectId/pod"
          element={
            <ProtectedRoute>
              <PodStepTemplate />
            </ProtectedRoute>
          }
        />
        {/* Route for branding projects - with section routing */}
        <Route
          path="/project/:projectId/step/:sectionId"
          element={
            <ProtectedRoute>
              <StepTemplate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App; 