import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email.toLowerCase(), password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && (err.response.status === 400 || err.response.status === 401)) {
                setError('Invalid credentials');
            } else {
                setError('Server error. Please check if backend is running.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 glass rounded-2xl shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <Link to="/" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-sm font-medium group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-center text-muted mb-8">Access your CRM Portal</p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        icon={Mail}
                        type="email"
                        required
                        placeholder="admin@crm.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        label="Password"
                        icon={Lock}
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button type="submit">
                        Sign In
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                {/* Demo Credentials Hint */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-center text-muted mb-4 uppercase tracking-widest">Demo Access</p>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-[10px] text-primary font-bold uppercase mb-1">Admin</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">demoadmin@crm.com</span>
                                <span className="font-mono text-accent">demo123</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-[10px] text-accent font-bold uppercase mb-1">Employee</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">employeeadmin@crm.com</span>
                                <span className="font-mono text-primary">demo123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
