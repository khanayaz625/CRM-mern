import React, { useState, useEffect } from 'react';
import api from '../api';
import { Globe, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsByCollege = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/leads');
                setLeads(res.data);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const normalize = (str) => {
        if (!str) return 'Not Specified';
        const s = str.trim();
        if (s.length <= 3) return s.toUpperCase();
        return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const grouped = leads.reduce((acc, lead) => {
        const key = normalize(lead.collegeName);
        if (!acc[key]) acc[key] = [];
        acc[key].push(lead);
        return acc;
    }, {});

    const filteredGroups = Object.entries(grouped).map(([college, collegeLeads]) => {
        const filteredLeads = collegeLeads.filter(l => {
            const matchesStatus = filterStatus.length === 0 || filterStatus.includes(l.status);
            const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                college.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
        return { college, leads: filteredLeads };
    }).filter(group => group.leads.length > 0)
        .sort((a, b) => b.leads.length - a.leads.length);

    const toggleStatus = (status) => {
        setFilterStatus(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Leads By College</h1>
                <p className="text-muted text-sm mt-1">Geographic and institutional breakdown of leads.</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by College Name or Student Name..."
                        className="w-full pl-9 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-400 mr-2">Status:</span>
                    {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(status => (
                        <button
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition ${filterStatus.includes(status)
                                    ? 'bg-accent text-white border-accent'
                                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(({ college, leads: groupLeads }) => (
                    <div key={college} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/20 text-accent rounded-lg">
                                    <Globe size={20} />
                                </div>
                                <h4 className="font-bold text-lg line-clamp-1" title={college}>{college}</h4>
                            </div>
                            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold whitespace-nowrap">{groupLeads.length} Leads</span>
                        </div>

                        <div className="space-y-3 flex-1">
                            {groupLeads.slice(0, 5).map(l => (
                                <div key={l._id} className="text-xs text-muted flex justify-between border-b border-white/5 pb-2">
                                    <span className="font-medium text-gray-300 truncate pr-2">{l.name}</span>
                                    <span className={`text-[10px] uppercase font-bold shrink-0 ${l.status === 'Won' ? 'text-green-400' :
                                            l.status === 'Lost' ? 'text-red-400' : 'text-gray-500'
                                        }`}>{l.status}</span>
                                </div>
                            ))}
                        </div>

                        {groupLeads.length > 5 && (
                            <button
                                onClick={() => navigate('/manage-leads')}
                                className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-accent text-sm font-bold transition flex items-center justify-center gap-2"
                            >
                                View all {groupLeads.length} leads
                            </button>
                        )}
                        {groupLeads.length <= 5 && (
                            <div className="mt-4 pt-2 text-center text-xs text-muted italic">End of list</div>
                        )}
                    </div>
                ))}
                {filteredGroups.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-muted">No colleges found matching criteria.</div>
                )}
            </div>
        </div>
    )
}

export default LeadsByCollege;
