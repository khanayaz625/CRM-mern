import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ResponsiveTable from '../components/ResponsiveTable';
import EditLeadModal from '../components/EditLeadModal';
import { Search, Filter, UserCheck, X, RefreshCw } from 'lucide-react';
import MultiSelect from '../components/MultiSelect';
import Button from '../components/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const LeadsManagement = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState([]); // Empty means All
    const [filterAssignedTo, setFilterAssignedTo] = useState([]); // Empty means All, strings of IDs
    const [dateRange, setDateRange] = useState('All'); // All, Today, Week, Month

    const [users, setUsers] = useState([]);

    // Selection
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignToUser, setAssignToUser] = useState('');

    // Editing
    const [editingLead, setEditingLead] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const location = useLocation();
    const [filterCourse, setFilterCourse] = useState('');
    const [filterCollege, setFilterCollege] = useState('');

    useEffect(() => {
        if (location.state?.filterCourse) {
            setFilterCourse(location.state.filterCourse);
        }
        if (location.state?.filterCollege) {
            setFilterCollege(location.state.filterCollege);
        }
    }, [location.state]);

    useEffect(() => {
        fetchLeads();
        if (user?.role === 'admin') fetchUsers();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) { console.error(err); }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.patch(`/leads/${id}/status`, { status: newStatus });
            setLeads(leads.map(lead => lead._id === id ? res.data : lead));
        } catch (error) {
            console.error(error);
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
            alert('Failed to assign leads');
        }
    };

    // Filter Logic
    const toggleStatus = (status) => {
        setFilterStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.phone && lead.phone.includes(searchQuery));

        const matchesStatus = filterStatus.length === 0 || filterStatus.includes(lead.status);

        const matchesAssigned = filterAssignedTo.length === 0 ||
            (filterAssignedTo.includes('Unassigned') && !lead.assignedTo) ||
            (lead.assignedTo && filterAssignedTo.includes(lead.assignedTo._id));

        let matchesDate = true;
        const created = new Date(lead.createdAt);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const createdDate = new Date(created);
        createdDate.setHours(0, 0, 0, 0);

        if (dateRange === 'Today') {
            matchesDate = createdDate.getTime() === now.getTime();
        } else if (dateRange === 'Week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            matchesDate = created >= oneWeekAgo;
        } else if (dateRange === 'Month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(now.getMonth() - 1);
            matchesDate = created >= oneMonthAgo;
        }

        const checkCourse = !filterCourse || (lead.courseName && lead.courseName.toLowerCase().includes(filterCourse.toLowerCase()));
        const matchesCollege = !filterCollege || (lead.collegeName && lead.collegeName.toLowerCase().includes(filterCollege.toLowerCase()));

        return matchesSearch && matchesStatus && matchesAssigned && matchesDate && checkCourse && matchesCollege;
    });

    const clearFilters = () => {
        setSearchQuery('');
        setFilterStatus([]);
        setFilterAssignedTo([]);
        setDateRange('All');
        setFilterCourse('');
        setFilterCollege('');
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

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Email", "Phone", "Status", "Source", "Assigned To"];
        const tableRows = [];
        filteredLeads.forEach(lead => {
            tableRows.push([lead.name, lead.email, lead.phone || 'N/A', lead.status, lead.source, lead.assignedTo?.name || 'Unassigned']);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save('leads.pdf');
    };

    const exportToXLSX = () => {
        const data = filteredLeads.map(l => ({
            Name: l.name, Email: l.email, Phone: l.phone, Status: l.status, Assigned: l.assignedTo?.name
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(wb, "leads.xlsx");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Lead Management</h1>
                    <p className="text-muted text-sm mt-1">Manage, track, and assign your leads efficiently.</p>
                </div>
                {user?.role === 'admin' && selectedLeads.length > 0 && (
                    <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-purple-600 text-white transition font-bold shadow-lg animate-in bounce-in">
                        <UserCheck size={16} /> Assign {selectedLeads.length} Leads
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by Name or Mobile Number..."
                            className="w-full pl-9 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {/* Date Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white"
                        >
                            <option value="All">All Time</option>
                            <option value="Today">Today</option>
                            <option value="Week">This Week</option>
                            <option value="Month">This Month</option>
                        </select>

                        {/* Assigned To Filter (Admin Only) */}
                        {user?.role === 'admin' && (
                            <div className="w-[200px]">
                                <MultiSelect
                                    options={[
                                        { value: 'Unassigned', label: 'Unassigned' },
                                        ...users.map(u => ({ value: u._id, label: u.name }))
                                    ]}
                                    selected={filterAssignedTo}
                                    onChange={setFilterAssignedTo}
                                    placeholder="Select Staff"
                                />
                            </div>
                        )}

                        <button onClick={clearFilters} className="px-4 py-3 bg-surface hover:bg-white/5 border border-white/10 rounded-xl text-white transition" title="Clear Filters">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400 mr-2">Status:</span>
                    {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(status => (
                        <button
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${filterStatus.includes(status)
                                ? getStatusColor(status).replace('text-', 'bg-').replace('bg-', 'border-').split(" ")[0] + " text-white border-transparent" // Hacky color mapping or just use simple active state
                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                }`}
                            style={filterStatus.includes(status) ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                        >
                            {status}
                        </button>
                    ))}
                    {filterStatus.length > 0 && (
                        <button onClick={() => setFilterStatus([])} className="text-xs text-red-400 hover:text-red-300 ml-2 underline">Clear Status</button>
                    )}
                    {filterStatus.length > 0 && (
                        <button onClick={() => setFilterStatus([])} className="text-xs text-red-400 hover:text-red-300 ml-2 underline">Clear Status</button>
                    )}
                </div>

                {/* Active Filters Display */}
                {(filterCourse || filterCollege) && (
                    <div className="flex gap-2 items-center text-sm text-gray-300 mt-2">
                        <span className="text-muted">Active Filters:</span>
                        {filterCourse && (
                            <span className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg flex items-center gap-1">
                                Course: {filterCourse}
                                <button onClick={() => setFilterCourse('')}><X size={12} /></button>
                            </span>
                        )}
                        {filterCollege && (
                            <span className="px-2 py-1 bg-accent/20 text-accent border-accent/30 rounded-lg flex items-center gap-1">
                                College: {filterCollege}
                                <button onClick={() => setFilterCollege('')}><X size={12} /></button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            <ResponsiveTable
                leads={filteredLeads}
                loading={loading}
                getStatusColor={getStatusColor}
                updateStatus={updateStatus}
                openEditModal={(lead) => { setEditingLead(lead); setShowEditModal(true); }}
                handleDeleteLead={handleDeleteLead}
                user={user}
                selectedLeads={selectedLeads}
                onSelectLead={(id) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onSelectAll={() => setSelectedLeads(selectedLeads.length === filteredLeads.length ? [] : filteredLeads.map(l => l._id))}
                onPrint={undefined}
                onExportPDF={exportToPDF}
                onExportXLSX={exportToXLSX}
                onAssignLead={(lead) => { setSelectedLeads([lead._id]); setAssignToUser(lead.assignedTo?._id || ''); setShowAssignModal(true); }}
            />

            {/* Modals */}
            {showEditModal && editingLead && (
                <EditLeadModal
                    lead={editingLead}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => { fetchLeads(); }}
                />
            )}

            {/* Assign Leads Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Assign Leads</h2>
                        <form onSubmit={handleAssignLeads} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Select Employee</label>
                                <select
                                    className="w-full p-4 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white appearance-none cursor-pointer"
                                    value={assignToUser}
                                    onChange={e => setAssignToUser(e.target.value)}
                                    required
                                >
                                    <option value="" className="bg-surface">Select User</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id} className="bg-surface">{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 border-white/5">Cancel</Button>
                                <Button type="submit" className="flex-1 bg-accent hover:bg-purple-600 border-accent">Confirm</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsManagement;
