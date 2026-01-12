import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResponsiveTable from '../components/ResponsiveTable';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await api.get('/leads');
                setLeads(res.data);
            } catch (error) {
                console.error("Error fetching leads:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const wonLeads = leads.filter(l => l.status === 'Won').length;

    // Mini function for status color (dup from Dashboard, should be util)
    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Qualified': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'Won': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'Lost': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Overview</h1>
                <p className="text-muted text-sm md:text-base mt-2">Welcome back, {user?.name}! Here is your daily overview.</p>
            </div>

            {/* Stats / Profile Widget */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 flex flex-col md:flex-row items-center gap-6">
                <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="flex items-center gap-6 flex-1">
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
                </div>

                <div className="flex gap-8 text-center border-l border-white/10 pl-8 md:pl-8">
                    <div>
                        <p className="text-xs text-muted font-bold uppercase mb-1">Total Leads</p>
                        <p className="text-2xl font-bold text-white">{leads.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted font-bold uppercase mb-1">Won Deals</p>
                        <p className="text-2xl font-bold text-green-400">{wonLeads}</p>
                    </div>
                    <div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.origin);
                                alert("Public Form Link copied!");
                            }}
                            className="flex flex-col items-center justify-center gap-1 group"
                            title="Copy Public Form Link"
                        >
                            <p className="text-xs text-muted font-bold uppercase mb-1 group-hover:text-primary transition">Share Form</p>
                            <ArrowRight className="-rotate-45 text-white group-hover:text-primary transition" size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TODO: Add Analytics Graphs Here in future (Daily/Weekly trends) */}
            {/* For now, just a placeholder or simple text to indicate differentiation */}

            {/* Recent Leads Preview */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Recent Leads</h3>
                    <Link to="/manage-leads" className="text-sm text-primary hover:text-white flex items-center gap-1 transition">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Reusing ResponsiveTable mostly for consistency but could be simplified */}
                <div className="overflow-hidden">
                    <ResponsiveTable
                        leads={leads.slice(0, 5)} // Only show top 5
                        loading={loading}
                        getStatusColor={getStatusColor}
                        updateStatus={() => { }} // Read only on dashboard overview
                        // Disable actions
                        disableActions={true}
                        user={user}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
