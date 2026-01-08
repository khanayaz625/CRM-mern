import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import api from '../api';
import AddLeadModal from '../components/AddLeadModal';

const Layout = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                onLogout={handleLogout}
                user={user}
                onAddLead={() => setShowLeadModal(true)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header */}
                <header className="flex md:hidden items-center justify-between p-4 bg-surface border-b border-white/10">
                    <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">CRM Portal</div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white"><Menu /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <Outlet context={{ user }} />
                </main>
            </div>

            {/* Global Add Lead Modal */}
            {showLeadModal && (
                <AddLeadModal
                    onClose={() => setShowLeadModal(false)}
                    onSuccess={() => {
                        setShowLeadModal(false);
                        // Ideally we should refresh the data if we are on a leads page. 
                        // We can use a context or a custom event, or just let the user navigate/refresh.
                        // For now, simple close. 
                        window.location.reload(); // Simple but effective to ensure data consistency as requested
                    }}
                />
            )}
        </div>
    );
};

export default Layout;
