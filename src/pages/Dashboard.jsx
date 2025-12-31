import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Link as LinkIcon, UserPlus, X, Menu, Edit, Trash2, Key, User, Briefcase, Calendar, Upload, Camera, Download, Printer, UserCheck, BookOpen, Globe, Users } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Input from '../components/Input';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';
import ResponsiveTable from '../components/ResponsiveTable';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'leads' | 'users' | 'profile'

    // Modals state
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);

    // Form states
    const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual', courseName: '', collegeName: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });

    // Profile Update State
    const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        user?.avatar
            ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`)
            : null
    );

    // Edit States
    const [editingLead, setEditingLead] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');


    const [leadSubTab, setLeadSubTab] = useState('all'); // 'all' | 'course' | 'college'

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Selection & Assignment State
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignToUser, setAssignToUser] = useState('');

    // Users State
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'leads' || activeTab === 'dashboard' || activeTab === 'course-data') {
            fetchLeads();
        }
    }, [activeTab]);

    // Initialize profile data when user changes (or loads)
    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, email: user.email, password: '' });
            setImagePreview(
                user.avatar
                    ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`)
                    : null
            );
        }
    }, [user]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (user?.role !== 'admin') return;
        setLoading(true);
        try {
            const res = await api.get('/auth/users');
            setUsersList(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);
        if (profileData.password) formData.append('password', profileData.password);
        if (profileImage) formData.append('avatar', profileImage);

        try {
            const res = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data);
            // Update image preview immediately - handle both Cloudinary and local URLs
            if (res.data.avatar) {
                setImagePreview(
                    res.data.avatar.startsWith('http')
                        ? res.data.avatar
                        : `${import.meta.env.VITE_API_URL}${res.data.avatar}`
                );
            }
            alert('Profile updated successfully!');
            setProfileData(prev => ({ ...prev, password: '' }));
            setProfileImage(null); // Clear the file input
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // ... (Keep existing CRUD handlers: updateStatus, handleCreateLead, etc.)
    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.patch(`/leads/${id}/status`, { status: newStatus });
            setLeads(leads.map(lead => lead._id === id ? res.data : lead));
        } catch (error) {
            console.error(error);
        }
    }

    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/leads', newLead);
            setLeads([res.data, ...leads]);
            setShowLeadModal(false);
            setNewLead({ name: '', email: '', phone: '', source: 'Manual' });
        } catch (error) {
            console.error(error);
            alert('Failed to create lead');
        }
    };

    const handleUpdateLead = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/leads/${editingLead._id}`, editingLead);
            setLeads(leads.map(lead => lead._id === editingLead._id ? res.data : lead));
            setShowEditModal(false);
            setEditingLead(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update lead');
        }
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;
        try {
            await api.delete(`/leads/${id}`);
            setLeads(leads.filter(lead => lead._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete lead');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/auth/users/${userId}`);
            setUsersList(usersList.filter(u => u._id !== userId));
        } catch (error) {
            console.error(error);
            alert('Failed to delete user: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            // Re-fetch users to reset the select value if cancelled
            fetchUsers();
            return;
        }
        try {
            const res = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
            setUsersList(usersList.map(u => u._id === userId ? { ...u, role: res.data.role } : u));
            alert('User role updated successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to update user role: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
            fetchUsers(); // Reset on failure
        }
    };

    const handleUpdateUserPassword = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/auth/users/${editingUser._id}/password`, { password: newPassword });
            alert('Password updated successfully');
            setNewPassword('');
            setShowUserEditModal(false);
        } catch (error) {
            alert('Failed to update password');
        }
    };

    const openEditModal = (lead) => {
        setEditingLead(lead);
        setShowEditModal(true);
    };

    const openEditUserModal = (selectedUser) => {
        setEditingUser(selectedUser);
        setNewPassword(''); // Reset password field
        setShowUserEditModal(true);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            alert('User created successfully');
            setShowUserModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'employee' });
            if (activeTab === 'users') fetchUsers();
        } catch (error) {
            alert('Failed to create user: ' + (error.response?.data?.message || error.message));
        }
    };

    const copyFormLink = () => {
        const url = window.location.origin;
        navigator.clipboard.writeText(url);
        alert('Lead Form Link copied to clipboard: ' + url);
    };

    const toggleSelectLead = (id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length && filteredLeads.length > 0) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map(l => l._id));
        }
    };

    const openAssignModal = (lead) => {
        setSelectedLeads([lead._id]);
        setAssignToUser(lead.assignedTo?._id || '');
        fetchUsers();
        setShowAssignModal(true);
    };

    const handleAssignLeads = async (e) => {
        e.preventDefault();
        if (!assignToUser) return alert('Please select a user');
        try {
            await api.post('/leads/assign', { leadIds: selectedLeads, userId: assignToUser });
            alert('Leads assigned successfully');
            setSelectedLeads([]);
            setShowAssignModal(false);
            setAssignToUser('');
            fetchLeads();
        } catch (error) {
            console.error(error);
            alert('Failed to assign leads: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Email", "Phone", "Status", "Source", "Assigned To"];
        const tableRows = [];

        filteredLeads.forEach(lead => {
            const leadData = [
                lead.name,
                lead.email,
                lead.phone || 'N/A',
                lead.status,
                lead.source,
                lead.assignedTo?.name || 'Unassigned'
            ];
            tableRows.push(leadData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [63, 131, 248] }
        });
        doc.text("CRM Leads Report", 14, 15);
        doc.save(`leads_report_${new Date().toLocaleDateString()}.pdf`);
    };

    const exportToXLSX = () => {
        const data = filteredLeads.map(lead => ({
            Name: lead.name,
            Email: lead.email,
            Phone: lead.phone || 'N/A',
            Status: lead.status,
            Source: lead.source,
            'Assigned To': lead.assignedTo?.name || 'Unassigned',
            'Date Created': new Date(lead.createdAt).toLocaleDateString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(workbook, `leads_export_${new Date().toLocaleDateString()}.xlsx`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Qualified': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'Won': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'Lost': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    }

    // Filter Logic
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                onAddLead={() => setShowLeadModal(true)}
                user={user}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Mobile Header */}
                <header className="flex md:hidden items-center justify-between p-4 bg-surface border-b border-white/10">
                    <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">CRM Portal</div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white"><Menu /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    {/* Top Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'leads' ? 'Lead Management' : activeTab === 'profile' ? 'My Profile' : 'Team Members'}
                            </h1>
                            <p className="text-muted text-sm md:text-base mt-2">
                                {activeTab === 'users' ? 'Administer team roles and access.' :
                                    activeTab === 'profile' ? 'Manage your account settings and profile.' :
                                        `Welcome back, ${user?.name}! Here is your daily overview.`}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
                            {/* Actions Buttons */}
                            {activeTab !== 'users' && activeTab !== 'profile' && (
                                <button onClick={copyFormLink} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-white/10 transition border border-white/5 text-sm whitespace-nowrap shadow-lg shadow-black/20">
                                    <LinkIcon size={16} /> <span className="hidden sm:inline">Copy Link</span>
                                </button>
                            )}

                            {user?.role === 'admin' && activeTab === 'users' && (
                                <button onClick={() => setShowUserModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition border border-accent/20 text-sm whitespace-nowrap shadow-lg shadow-accent/10">
                                    <UserPlus size={16} /> <span className="hidden sm:inline">Add Employee</span>
                                </button>
                            )}

                            {(activeTab === 'leads' || activeTab === 'dashboard') && (
                                <>


                                    {user?.role === 'admin' && selectedLeads.length > 0 && (
                                        <button onClick={() => { fetchUsers(); setShowAssignModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-purple-600 text-white transition border border-accent text-sm font-bold animate-in bounce-in duration-300">
                                            <UserCheck size={16} /> Assign {selectedLeads.length} Leads
                                        </button>
                                    )}

                                    <button onClick={() => setShowLeadModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white transition border border-primary text-sm font-bold whitespace-nowrap shadow-lg shadow-primary/30">
                                        <Plus size={16} /> Add Lead
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* DASHBOARD TAB CONTENT */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Profile Widget (Smaller) */}
                            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 flex items-center gap-6">
                                <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                                <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary/30 overflow-hidden flex-shrink-0">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-surface text-muted">
                                            <User size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                                    <div className="text-sm text-gray-400 capitalize">{user?.role}</div>
                                </div>
                                <div className="ml-auto flex gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-muted font-bold uppercase">Leads</p>
                                        <p className="text-xl font-bold text-white">{leads.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted font-bold uppercase">Won</p>
                                        <p className="text-xl font-bold text-green-400">{leads.filter(l => l.status === 'Won').length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Search & Filter Bar (Restored to Dashboard) */}
                            <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search leads by name or email..."
                                        className="w-full pl-9 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="pl-9 pr-8 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition appearance-none cursor-pointer text-white min-w-[140px]"
                                    >
                                        <option value="All" className="bg-surface">All Status</option>
                                        {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(s => (
                                            <option key={s} value={s} className="bg-surface">{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Responsive Leads Table (Restored to Dashboard) */}
                            <ResponsiveTable
                                leads={filteredLeads}
                                loading={loading}
                                getStatusColor={getStatusColor}
                                updateStatus={updateStatus}
                                openEditModal={openEditModal}
                                handleDeleteLead={handleDeleteLead}
                                user={user}
                                selectedLeads={selectedLeads}
                                onSelectLead={toggleSelectLead}
                                onSelectAll={toggleSelectAll}
                                onPrint={handlePrint}
                                onExportPDF={exportToPDF}
                                onExportXLSX={exportToXLSX}
                                onAssignLead={openAssignModal}
                            />
                        </div>
                    )}

                    {/* LEADS TAB CONTENT (Same as Dashboard now, can be redundant but requested separate tab exists) */}
                    {activeTab === 'leads' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Sub-tabs Navigation */}
                            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                                {[
                                    { id: 'all', label: 'All Leads', icon: Users },
                                    { id: 'course', label: 'By Course', icon: BookOpen },
                                    { id: 'college', label: 'By College', icon: Globe }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setLeadSubTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${leadSubTab === tab.id
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-muted hover:text-white hover:bg-white/5'}`}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {leadSubTab === 'all' && (
                                <>
                                    <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search leads by name or email..."
                                                className="w-full pl-9 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="pl-9 pr-8 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition appearance-none cursor-pointer text-white min-w-[140px]"
                                            >
                                                <option value="All" className="bg-surface">All Status</option>
                                                {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(s => (
                                                    <option key={s} value={s} className="bg-surface">{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <ResponsiveTable
                                        leads={filteredLeads}
                                        loading={loading}
                                        getStatusColor={getStatusColor}
                                        updateStatus={updateStatus}
                                        openEditModal={openEditModal}
                                        handleDeleteLead={handleDeleteLead}
                                        user={user}
                                        selectedLeads={selectedLeads}
                                        onSelectLead={toggleSelectLead}
                                        onSelectAll={toggleSelectAll}
                                        onPrint={handlePrint}
                                        onExportPDF={exportToPDF}
                                        onExportXLSX={exportToXLSX}
                                        onAssignLead={openAssignModal}
                                    />
                                </>
                            )}

                            {leadSubTab === 'course' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
                                    {Object.entries(
                                        leads.reduce((acc, lead) => {
                                            const course = lead.courseName || 'Not Specified';
                                            acc[course] = (acc[course] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).sort((a, b) => b[1] - a[1]).map(([course, count]) => (
                                        <div key={course} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/20 text-primary rounded-lg">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <h4 className="font-bold text-lg">{course}</h4>
                                                </div>
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{count} Leads</span>
                                            </div>
                                            <div className="space-y-2">
                                                {leads.filter(l => (l.courseName || 'Not Specified') === course).slice(0, 3).map(l => (
                                                    <div key={l._id} className="text-xs text-muted flex justify-between border-b border-white/5 pb-2">
                                                        <span>{l.name}</span>
                                                        <span className="text-[10px] uppercase font-bold">{l.status}</span>
                                                    </div>
                                                ))}
                                                {count > 3 && <button onClick={() => { setSearchQuery(course); setLeadSubTab('all'); }} className="text-[10px] text-primary hover:underline mt-2">View all {count} leads...</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {leadSubTab === 'college' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
                                    {Object.entries(
                                        leads.reduce((acc, lead) => {
                                            const college = lead.collegeName || 'Not Specified';
                                            acc[college] = (acc[college] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).sort((a, b) => b[1] - a[1]).map(([college, count]) => (
                                        <div key={college} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-accent/20 text-accent rounded-lg">
                                                        <Globe size={20} />
                                                    </div>
                                                    <h4 className="font-bold text-lg">{college}</h4>
                                                </div>
                                                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">{count} Leads</span>
                                            </div>
                                            <div className="space-y-2">
                                                {leads.filter(l => (l.collegeName || 'Not Specified') === college).slice(0, 3).map(l => (
                                                    <div key={l._id} className="text-xs text-muted flex justify-between border-b border-white/5 pb-2">
                                                        <span>{l.name}</span>
                                                        <span className="text-[10px] uppercase font-bold">{l.status}</span>
                                                    </div>
                                                ))}
                                                {count > 3 && <button onClick={() => { setSearchQuery(college); setLeadSubTab('all'); }} className="text-[10px] text-accent hover:underline mt-2">View all {count} leads...</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB CONTENT */}
                    {activeTab === 'profile' && (
                        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
                            <div className="glass-card p-8 rounded-3xl border border-white/10">
                                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4 mb-6">
                                        <div className="relative group cursor-pointer w-32 h-32">
                                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-2xl bg-surface">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                                                        <User size={48} />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition shadow-lg">
                                                <Camera size={18} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-400">Click icon to change photo</p>
                                    </div>

                                    <div className="grid gap-4">
                                        <Input
                                            label="Full Name"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={profileData.email}
                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                        />
                                        <Input
                                            label="New Password (optional)"
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={profileData.password}
                                            onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex justify-end">
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* COURSE ANALYSIS TAB CONTENT */}
                    {activeTab === 'course-data' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Course Distribution */}
                                <div className="glass-card p-6 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/20 text-primary rounded-xl">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Leads by Course</h3>
                                            <p className="text-xs text-muted">Distribution of interest across programs</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(
                                            leads.reduce((acc, lead) => {
                                                const course = lead.courseName || 'Not Specified';
                                                acc[course] = (acc[course] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).sort((a, b) => b[1] - a[1]).map(([course, count]) => (
                                            <div key={course} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">{course}</span>
                                                    <span className="font-bold text-white">{count}</span>
                                                </div>
                                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${(count / leads.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {leads.length === 0 && <p className="text-center text-muted py-8">No data available</p>}
                                    </div>
                                </div>

                                {/* College Distribution */}
                                <div className="glass-card p-6 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-accent/20 text-accent rounded-xl">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Leads by College</h3>
                                            <p className="text-xs text-muted">Sourcing origins of students</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(
                                            leads.reduce((acc, lead) => {
                                                const college = lead.collegeName || 'Not Specified';
                                                acc[college] = (acc[college] || 0) + 1;
                                                return acc;
                                            }, {})
                                        ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([college, count]) => (
                                            <div key={college} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-sm font-medium text-gray-300">{college}</span>
                                                <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-lg">{count} Leads</span>
                                            </div>
                                        ))}
                                        {leads.length === 0 && <p className="text-center text-muted py-8">No data available</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed List */}
                            <div className="glass-card p-6 rounded-2xl border border-white/10">
                                <h3 className="text-lg font-bold mb-4">Detailed Academic Background</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs text-muted uppercase tracking-wider border-b border-white/5">
                                                <th className="pb-3 font-medium">Lead Name</th>
                                                <th className="pb-3 font-medium">Course Program</th>
                                                <th className="pb-3 font-medium">College/University</th>
                                                <th className="pb-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {leads.filter(l => l.courseName || l.collegeName).map((l) => (
                                                <tr key={l._id} className="text-sm">
                                                    <td className="py-4 text-white font-medium">{l.name}</td>
                                                    <td className="py-4 text-gray-400">{l.courseName || '-'}</td>
                                                    <td className="py-4 text-gray-400">{l.collegeName || '-'}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${getStatusColor(l.status)}`}>
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB CONTENT */}
                    {activeTab === 'users' && (
                        <div className="glass-card overflow-hidden rounded-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <h2 className="text-xl font-bold">Team Members</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-sm uppercase text-muted">
                                            <th className="p-4 font-medium">Name</th>
                                            <th className="p-4 font-medium">Email</th>
                                            <th className="p-4 font-medium">Role</th>
                                            <th className="p-4 font-medium">Joined Date</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="5" className="p-8 text-center text-muted">Loading...</td></tr>
                                        ) : usersList.map((u) => (
                                            <tr key={u._id} className="hover:bg-white/5 transition">
                                                <td className="p-4 font-medium text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-surface border border-white/10 overflow-hidden flex-shrink-0">
                                                        {u.avatar ? (
                                                            <img
                                                                src={u.avatar.startsWith('http') ? u.avatar : `${import.meta.env.VITE_API_URL}${u.avatar}`}
                                                                alt={u.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs font-bold text-muted">
                                                                {u.name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {u.name}
                                                </td>
                                                <td className="p-4 text-gray-300">{u.email}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                        className={`text-xs font-bold px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}
                                                    >
                                                        <option value="employee" className="bg-surface text-white">Employee</option>
                                                        <option value="admin" className="bg-surface text-white">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-gray-400 text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEditUserModal(u)} className="p-2 hover:bg-white/10 rounded-lg transition text-yellow-400" title="Change Password">
                                                            <Key size={18} />
                                                        </button>
                                                        {user._id !== u._id && (
                                                            <button onClick={() => handleDeleteUser(u._id)} className="p-2 hover:bg-white/10 rounded-lg transition text-red-400" title="Delete User">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {usersList.length === 0 && !loading && (
                                            <tr><td colSpan="5" className="p-8 text-center text-muted">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals are unaffected by layout, kept fixed */}
            {/* Add Lead Modal */}
            {showLeadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowLeadModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Add New Lead</h2>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <Input label="Name" required value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} />
                            <Input label="Email" type="email" required value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
                            <Input label="Phone" value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Course" value={newLead.courseName} onChange={e => setNewLead({ ...newLead, courseName: e.target.value })} />
                                <Input label="College" value={newLead.collegeName} onChange={e => setNewLead({ ...newLead, collegeName: e.target.value })} />
                            </div>
                            <Button type="submit">Create Lead</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lead Modal */}
            {showEditModal && editingLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Edit Lead</h2>
                        <form onSubmit={handleUpdateLead} className="space-y-4">
                            <Input label="Name" required value={editingLead.name} onChange={e => setEditingLead({ ...editingLead, name: e.target.value })} />
                            <Input label="Email" type="email" required value={editingLead.email} onChange={e => setEditingLead({ ...editingLead, email: e.target.value })} />
                            <Input label="Phone" value={editingLead.phone} onChange={e => setEditingLead({ ...editingLead, phone: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Course" value={editingLead.courseName || ''} onChange={e => setEditingLead({ ...editingLead, courseName: e.target.value })} />
                                <Input label="College" value={editingLead.collegeName || ''} onChange={e => setEditingLead({ ...editingLead, collegeName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Notes</label>
                                <textarea
                                    className="w-full p-3 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white min-h-[100px]"
                                    value={editingLead.notes || ''}
                                    onChange={e => setEditingLead({ ...editingLead, notes: e.target.value })}
                                    placeholder="Add notes about interaction..."
                                />
                            </div>
                            <Button type="submit">Update Lead</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Add New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input label="Name" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            <Input label="Email" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            <Input label="Password" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Role</label>
                                <select
                                    className="w-full p-3 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <Button type="submit">Create User</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* User Edit Modal (Password Reset) */}
            {showUserEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowUserEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Update Password for {editingUser.name}</h2>
                        <form onSubmit={handleUpdateUserPassword} className="space-y-4">
                            <Input
                                label="New Password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                            <Button type="submit">Update Password</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Leads Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-accent/20 text-accent rounded-xl">
                                <UserCheck size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Assign {selectedLeads.length} Leads</h2>
                        </div>
                        <p className="text-muted text-sm mb-6">Select an employee to allocate these leads to. Only the assigned employee will be able to view and manage these leads.</p>
                        <form onSubmit={handleAssignLeads} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Select Employee</label>
                                <select
                                    className="w-full p-4 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white appearance-none cursor-pointer"
                                    value={assignToUser}
                                    onChange={e => setAssignToUser(e.target.value)}
                                    required
                                >
                                    <option value="" className="bg-surface">Unassigned</option>
                                    {usersList.map(u => (
                                        <option key={u._id} value={u._id} className="bg-surface">
                                            {u.name} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 border-white/5">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-accent hover:bg-purple-600 border-accent">Confirm Assignment</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    aside, header, .no-print, button, .flex-wrap, .glass-card > div:first-child {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .glass-card {
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        color: black !important;
                    }
                    table {
                        color: black !important;
                    }
                    th {
                        background: #f3f4f6 !important;
                        color: black !important;
                    }
                    td {
                        border-bottom: 1px solid #e5e7eb !important;
                        color: black !important;
                    }
                    .text-white { color: black !important; }
                    .text-gray-300 { color: #374151 !important; }
                    .bg-surface { background: white !important; }
                }
            ` }} />
        </div>
    );
};

export default Dashboard;
