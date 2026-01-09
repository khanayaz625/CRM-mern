import React, { useState } from 'react';
import api from '../api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Star, User, Mail, Phone, BookOpen, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

const LandingPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', courseName: '', collegeName: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const navigate = useNavigate();

    const handleChange = (field, value) => {
        let finalValue = value;
        if (field === 'email') finalValue = value.toLowerCase();
        if (field === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length > 10) return;
            finalValue = cleaned;
        }
        setFormData(prev => ({ ...prev, [field]: finalValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = "Name is required";
        if (!formData.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email format";

        if (!formData.phone) errs.phone = "Phone is required";
        else if (formData.phone.length !== 10) errs.phone = "Must be 10 digits";

        if (!formData.courseName.trim()) errs.courseName = "Course name is required";
        if (!formData.collegeName.trim()) errs.collegeName = "College name is required";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('submitting');
        try {
            await api.post('/leads', formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', courseName: '', collegeName: '' });
            setErrors({});
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message?.toLowerCase().includes('duplicate')) {
                if (error.response.data.message.toLowerCase().includes('email')) {
                    setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
                } else if (error.response.data.message.toLowerCase().includes('phone')) {
                    setErrors(prev => ({ ...prev, phone: 'This phone is already registered' }));
                }
            }
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

                    {/* Image Showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="mt-20 relative px-4"
                    >
                        <div className="relative group">
                            {/* Decorative background glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                            <div className="relative glass p-2 rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="/crm_title.png"
                                    alt="CRM Dashboard Mockup"
                                    className="w-full h-auto rounded-xl shadow-inner border border-white/10"
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Content & Form Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-16 items-center">

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
                        <form id="register" onSubmit={handleSubmit} className="space-y-6 relative z-10" >
                            <Input
                                label="Full Name"
                                required
                                icon={User}
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                onBlur={() => {
                                    const val = formData.name.trim();
                                    setFormData(prev => ({ ...prev, name: toTitleCase(val) }));
                                }}
                                error={errors.name}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                required
                                icon={Mail}
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                style={{ textTransform: 'lowercase' }}
                                error={errors.email}
                            />
                            <Input
                                label="Phone Number"
                                type="tel"
                                required
                                icon={Phone}
                                prefix="+91"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                error={errors.phone}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Course Name"
                                    required
                                    icon={BookOpen}
                                    placeholder="B.Tech, MBA etc."
                                    value={formData.courseName}
                                    onChange={e => handleChange('courseName', e.target.value)}
                                    onBlur={() => {
                                        const val = formData.courseName.trim();
                                        if (['IT', 'CS', 'GPT', 'CSE'].includes(val.toUpperCase())) {
                                            setFormData(prev => ({ ...prev, courseName: val.toUpperCase() }));
                                        } else {
                                            setFormData(prev => ({ ...prev, courseName: toTitleCase(val) }));
                                        }
                                    }}
                                    error={errors.courseName}
                                />
                                <Input
                                    label="College Name"
                                    required
                                    icon={School}
                                    placeholder="Your University"
                                    value={formData.collegeName}
                                    onChange={e => handleChange('collegeName', e.target.value)}
                                    onBlur={() => {
                                        const val = formData.collegeName.trim();
                                        setFormData(prev => ({ ...prev, collegeName: toTitleCase(val) }));
                                    }}
                                    error={errors.collegeName}
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
