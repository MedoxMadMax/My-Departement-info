import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import DepartmentPage from './pages/public/DepartmentPage';
import FormationsPage from './pages/public/FormationsPage';
import TeamPage from './pages/public/TeamPage';
import TeacherDetailPage from './pages/public/TeacherDetailPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import EventPreviewPage from './pages/public/EventPreviewPage';
import ContactPage from './pages/public/ContactPage';

// Auth & Dashboard Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEnseignants from './pages/admin/AdminEnseignants';
import AdminUsers from './pages/admin/AdminUsers';
import GestionFilieres from './pages/admin/GestionFilieres';
import GestionLaboratoires from './pages/admin/GestionLaboratoires';
import GestionDepartement from './pages/admin/GestionDepartement';
import ValidationsSoumissions from './pages/admin/ValidationsSoumissions';
import HistoriquePage from './pages/admin/HistoriquePage';
import ProfilePage from './pages/dashboard/ProfilePage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/departement" element={<DepartmentPage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/equipe" element={<TeamPage />} />
            <Route path="/equipe/:id" element={<TeacherDetailPage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route path="/evenements/:id" element={<EventDetailPage />} />
            <Route path="/evenements/:id/preview" element={<EventPreviewPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/profil" element={<ProfilePage />} />
              
              <Route element={<RoleRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_SECRETAIRE']} />}>
                <Route path="/dashboard/actualites" element={<AdminDashboard />} />
                <Route path="/dashboard/departement" element={<GestionDepartement />} />
                <Route path="/dashboard/historique" element={<HistoriquePage />} />
                <Route path="/dashboard/enseignants" element={<AdminEnseignants />} />
                <Route path="/dashboard/filieres" element={<GestionFilieres />} />
                <Route path="/dashboard/laboratoires" element={<GestionLaboratoires />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_SECRETAIRE']} />}>
                <Route path="/dashboard/utilisateurs" element={<AdminUsers />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['ROLE_SUPER_ADMIN']} />}>
                <Route path="/dashboard/validation" element={<ValidationsSoumissions />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
