import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Layout from './layouts/Layout';
import DashboardOverview from './pages/DashboardOverview';
import LeadsManagement from './pages/LeadsManagement';
import LeadsByCourse from './pages/LeadsByCourse';
import LeadsByCollege from './pages/LeadsByCollege';
import CourseAnalysis from './pages/CourseAnalysis';
import TeamMembers from './pages/TeamMembers';
import UserProfile from './pages/UserProfile';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes Wrapper */}
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route path="/dashboard" element={<DashboardOverview />} />
                    <Route path="/manage-leads" element={<LeadsManagement />} />
                    <Route path="/leads/by-course" element={<LeadsByCourse />} />
                    <Route path="/leads/by-college" element={<LeadsByCollege />} />
                    <Route path="/course-analysis" element={<CourseAnalysis />} />
                    <Route path="/team-members" element={<TeamMembers />} />
                    <Route path="/profile" element={<UserProfile />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
