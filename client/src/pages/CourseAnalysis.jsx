import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, Globe } from 'lucide-react';

const CourseAnalysis = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (['IT', 'CS', 'CSE'].includes(s.toUpperCase())) return s.toUpperCase();
        return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const courseData = Object.entries(leads.reduce((acc, lead) => {
        const course = normalize(lead.courseName);
        acc[course] = (acc[course] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1]);

    const collegeData = Object.entries(leads.reduce((acc, lead) => {
        const college = normalize(lead.collegeName);
        acc[college] = (acc[college] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Course Analysis</h1>
                <p className="text-muted text-sm mt-1">Deep dive into course popularity and student origins.</p>
            </div>

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
                        {courseData.map(([course, count]) => (
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
                        {collegeData.slice(0, 10).map(([college, count]) => (
                            <div key={college} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-sm font-medium text-gray-300 truncate max-w-[200px]" title={college}>{college}</span>
                                <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded-lg">{count} Leads</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalysis;
