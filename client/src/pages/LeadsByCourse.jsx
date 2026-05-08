import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsByCourse = () => {
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
        // Custom merging logic
        if (s.toLowerCase() === 'it') return 'IT';
        if (s.toLowerCase() === 'cs') return 'CS';
        if (s.toLowerCase() === 'cse') return 'CSE';
        // Title Case for others
        return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    // Grouping
    const grouped = leads.reduce((acc, lead) => {
        const key = normalize(lead.courseName);
        if (!acc[key]) acc[key] = [];
        acc[key].push(lead);
        return acc;
    }, {});

    // Filter Groups
    const filteredGroups = Object.entries(grouped).map(([course, courseLeads]) => {
        // Filter leads within the group based on status/search? 
        // User asked "Add search & status filters to By Course view".
        // Search usually filters the Course Name or the Leads inside?
        // Let's assume global search filters the Course Name OR leads inside.

        // Actually, if I search "John", I want to see courses containing John? Or just filter leads?
        // Usually "By Course" view lists Courses as cards.

        const filteredLeads = courseLeads.filter(l => {
            const matchesStatus = filterStatus.length === 0 || filterStatus.includes(l.status);
            const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        return { course, leads: filteredLeads, total: courseLeads.length };
    }).filter(group => group.leads.length > 0)
        .sort((a, b) => b.leads.length - a.leads.length);

    const toggleStatus = (status) => {
        setFilterStatus(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Leads By Course</h1>
                <p className="text-muted text-sm mt-1">Analyze lead distribution across different courses.</p>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-xl border border-white/10 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Course Name or Student Name..."
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
                                ? 'bg-primary text-white border-primary'
                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(({ course, leads: groupLeads }) => (
                    <div key={course} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 text-primary rounded-lg">
                                    <BookOpen size={20} />
                                </div>
                                <h4 className="font-bold text-lg line-clamp-1" title={course}>{course}</h4>
                            </div>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold whitespace-nowrap">{groupLeads.length} Leads</span>
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

                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/manage-leads', { state: { filterCourse: course } })}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-primary text-sm font-bold transition flex items-center justify-center gap-2"
                            >
                                View {groupLeads.length} leads
                            </button>
                        </div>
                        {groupLeads.length <= 5 && (
                            <div className="mt-2 text-center text-[10px] text-muted italic">End of list</div>
                        )}
                    </div>
                ))}
                {filteredGroups.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-muted">No courses found matching criteria.</div>
                )}
            </div>
        </div>
    );
};

export default LeadsByCourse;
