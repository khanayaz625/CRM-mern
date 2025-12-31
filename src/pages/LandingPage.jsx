import React, { useState } from 'react';
import api from '../api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const LandingPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', courseName: '', collegeName: '' });
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await api.post('/leads', formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', courseName: '', collegeName: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-background text-text overflow-hidden">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto z-20 relative">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    E-Course4u
                </div>
                <button onClick={() => navigate('/login')} className="px-5 py-2 glass rounded-full hover:bg-white/10 transition text-sm">
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center px-4">
                {/* Background Elements */}
                <div className="absolute top-0 center w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-10 max-w-4xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-8 text-accent border-accent/20">
                        <Sparkles size={16} />
                        <span>New Cohort Starting Soon</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Unlock Your Potential with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Advanced Mastery</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted mb-12 max-w-2xl mx-auto">
                        Join thousands of students transforming their careers properly. Learn from industry experts and build real-world projects today.
                    </p>

                    <a href="#register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-colors shadow-xl shadow-white/10">
                        Get Started Now <ArrowRight size={20} />
                    </a>
                </motion.div>
            </section>

            {/* Content & Form Section */}
            <section id="register" className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-16 items-center">

                {/* Left Side: Benefits */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold">Why Choose Us?</h2>
                    <div className="space-y-6">
                        {[
                            "Comprehensive Curriculum covering latest Tech",
                            "1-on-1 Mentorship from Industry Experts",
                            "Real-world Project Portfolio building",
                            "Lifetime Access to Course Materials"
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 glass rounded-xl border-l-4 border-primary">
                                <CheckCircle className="text-primary flex-shrink-0" />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 mt-8">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-background flex items-center justify-center text-xs font-bold">
                                    {/* Placeholder avatars */}
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex text-yellow-400"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                            <span className="text-sm text-muted">Rated 5/5 by 2,000+ students</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Lead Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="glass-card p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-accent/20 blur-[80px]" />

                    <h3 className="text-2xl font-bold mb-2 relative z-10">Secure Your Spot</h3>
                    <p className="text-muted mb-8 relative z-10">Fill out the form below to get the course syllabus and a free consultation.</p>

                    {status === 'success' ? (
                        <div className="bg-green-500/20 text-green-400 p-6 rounded-xl border border-green-500/30 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                            <p>We've received your details. One of our experts will contact you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <Input
                                label="Full Name"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                required
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Course Name"
                                    placeholder="B.Tech, MBA etc."
                                    value={formData.courseName}
                                    onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                                />
                                <Input
                                    label="College Name"
                                    placeholder="Your University"
                                    value={formData.collegeName}
                                    onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                                />
                            </div>

                            <Button disabled={status === 'submitting'} type="submit">
                                {status === 'submitting' ? 'Sending...' : 'Request a Call'}
                            </Button>
                            {status === 'error' && <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>}
                        </form>
                    )}
                </motion.div>

            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-white/10 text-center text-muted text-sm">
                &copy; 2025 KSDYSA LEARNING. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
