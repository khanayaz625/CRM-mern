import React from 'react';
import { LayoutDashboard, Users, LogOut, X, Settings, BarChart3, ChevronLeft, ChevronRight, Menu, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarContent = ({ onClose, activeTab, setActiveTab, onLogout, user, isCollapsed, setSidebarCollapsed, onAddLead }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leads', label: 'Manage Leads', icon: Users },
        { id: 'course-data', label: 'Course Analysis', icon: BarChart3 },
        { id: 'profile', label: 'My Profile', icon: Settings },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ id: 'users', label: 'Team Members', icon: Users });
    }

    return (
        <div className={`flex flex-col h-full bg-surface border-r border-white/10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`p-6 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent whitespace-nowrap overflow-hidden">
                        CRM Portal
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!isCollapsed)}
                        className="hidden md:flex p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    {/* Mobile close button */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className={`p-4 ${isCollapsed ? 'px-2' : ''}`}>
                <div className={`mb-6 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center px-0 bg-transparent border-transparent' : ''}`}>
                    <div className={`rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-white/10 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
                        {user?.avatar ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="font-bold truncate text-sm text-white">{user?.name}</p>
                            <p className="text-[10px] text-muted truncate uppercase tracking-wider font-semibold">{user?.role}</p>
                        </div>
                    )}
                </div>

                {/* Add Lead Quick Button */}
                <button
                    onClick={() => onAddLead()}
                    title={isCollapsed ? 'Add New Lead' : ''}
                    className={`w-full mb-6 flex items-center gap-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-blue-600 transition-all duration-300 ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}
                >
                    <Plus size={20} className="shrink-0" />
                    {!isCollapsed && <span className="font-bold whitespace-nowrap overflow-hidden text-sm">Add New Lead</span>}
                </button>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (onClose) onClose(); // Close on mobile selection
                            }}
                            title={isCollapsed ? item.label : ''}
                            className={`w-full flex items-center gap-3 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-muted hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className="shrink-0" />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className={`mt-auto p-4 border-t border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
                <button
                    onClick={onLogout}
                    title={isCollapsed ? 'Logout' : ''}
                    className={`w-full flex items-center gap-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">Logout</span>}
                </button>
            </div>
        </div>
    );
};

const Sidebar = ({ isOpen, onClose, activeTab, setActiveTab, onLogout, user, isCollapsed, setSidebarCollapsed, onAddLead }) => {
    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0">
                <SidebarContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogout={onLogout}
                    user={user}
                    isCollapsed={isCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    onAddLead={onAddLead}
                />
            </div>

            {/* Mobile Sidebar (Overlay) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed top-0 left-0 h-full z-50 shadow-2xl w-64"
                        >
                            <SidebarContent
                                onClose={onClose}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                onLogout={onLogout}
                                user={user}
                                isCollapsed={false} // Always expanded on mobile overlay
                                setSidebarCollapsed={() => { }} // No collapse on mobile overlay
                                onAddLead={onAddLead}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
