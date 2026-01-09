import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import api from '../api';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

const AddLeadModal = ({ onClose, onSuccess }) => {
    const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual', courseName: '', collegeName: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};

        // Name: Alphabets only
        if (!newLead.name.trim()) errs.name = "Name is required";
        else if (!/^[A-Za-z\s]+$/.test(newLead.name)) errs.name = "Name must contain alphabets only";

        // Email: Lowercase & Valid
        if (!newLead.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) errs.email = "Invalid email format";

        // Phone: Numeric, 10-15 digits
        if (!newLead.phone) errs.phone = "Phone number is required";
        else if (!/^\d+$/.test(newLead.phone)) errs.phone = "Phone must be numeric";
        else if (newLead.phone.length !== 10) errs.phone = "Phone must be 10 digits";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (field, value) => {
        let finalValue = value;

        if (field === 'name') {
            if (/[^A-Za-z\s]/.test(value)) return; // Prevent non-alphabets
        }

        if (field === 'email') {
            finalValue = value.toLowerCase();
        }

        if (field === 'phone') {
            if (/[^0-9]/.test(value)) return;
            if (value.length > 10) return;
        }

        setNewLead(prev => ({ ...prev, [field]: finalValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleBlur = (field) => {
        if (field === 'name' || field === 'courseName' || field === 'collegeName') {
            let val = newLead[field].trim();
            // Specific Normalization: IT -> IT, CS -> CS, GPT -> GPT
            if (['IT', 'CS', 'GPT'].includes(val.toUpperCase())) {
                setNewLead(prev => ({ ...prev, [field]: val.toUpperCase() }));
            } else {
                setNewLead(prev => ({ ...prev, [field]: toTitleCase(val) }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.post('/leads', newLead);
            onSuccess();
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message?.toLowerCase().includes('duplicate')) {
                if (error.response.data.message.toLowerCase().includes('email')) setErrors(prev => ({ ...prev, email: 'Email already exists' }));
                else if (error.response.data.message.toLowerCase().includes('phone')) setErrors(prev => ({ ...prev, phone: 'Phone number already exists' }));
                else alert(error.response.data.message);
            } else {
                alert('Failed to create lead: ' + (error.response?.data?.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in duration-200 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Add New Lead</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"><X size={20} /></button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Name"
                            required
                            value={newLead.name}
                            onChange={e => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            error={errors.name}
                            placeholder="John Doe"
                        />
                        <Input
                            label="Email"
                            type="email"
                            required
                            value={newLead.email}
                            onChange={e => handleChange('email', e.target.value.toLowerCase())}
                            error={errors.email}
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Phone Number"
                            required
                            value={newLead.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            error={errors.phone}
                            prefix="+91"
                            placeholder="9876543210"
                        />
                        <div className="space-y-4">
                            <Input
                                label="Course"
                                value={newLead.courseName}
                                onChange={e => handleChange('courseName', e.target.value)}
                                onBlur={() => handleBlur('courseName')}
                                placeholder="e.g. B.Tech"
                            />
                            <Input
                                label="College"
                                value={newLead.collegeName}
                                onChange={e => handleChange('collegeName', e.target.value)}
                                onBlur={() => handleBlur('collegeName')}
                                placeholder="e.g. ABC Univ"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border-white/5 !text-gray-300">Cancel</Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-blue-600">{loading ? 'Creating...' : 'Confirm'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddLeadModal;
