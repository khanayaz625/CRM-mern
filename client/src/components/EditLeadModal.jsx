import React, { useState, useEffect } from 'react';
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

const EditLeadModal = ({ lead, onClose, onSuccess }) => {
    const [editingLead, setEditingLead] = useState({ ...lead });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setEditingLead({ ...lead });
    }, [lead]);

    const validate = () => {
        const errs = {};

        if (!editingLead.name.trim()) errs.name = "Name is required";
        else if (!/^[A-Za-z\s]+$/.test(editingLead.name)) errs.name = "Name must contain alphabets only";

        if (!editingLead.email.trim()) errs.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingLead.email)) errs.email = "Invalid email format";

        if (!editingLead.phone) errs.phone = "Phone is required";
        else if (!/^\d+$/.test(editingLead.phone)) errs.phone = "Phone must be numeric";
        // min/max check?
        else if (editingLead.phone.length < 10 || editingLead.phone.length > 15) errs.phone = "Phone must be 10-15 digits";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (field, value) => {
        let finalValue = value;
        if (field === 'name') {
            if (/[^A-Za-z\s]/.test(value)) return;
        }
        if (field === 'email') finalValue = value.toLowerCase();
        if (field === 'phone') {
            if (/[^0-9]/.test(value)) return;
            if (value.length > 15) return;
        }

        setEditingLead(prev => ({ ...prev, [field]: finalValue }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleBlur = (field) => {
        if (field === 'name' || field === 'courseName' || field === 'collegeName') {
            let val = editingLead[field] ? editingLead[field].trim() : '';
            if (['IT', 'CS', 'GPT'].includes(val.toUpperCase())) {
                setEditingLead(prev => ({ ...prev, [field]: val.toUpperCase() }));
            } else {
                setEditingLead(prev => ({ ...prev, [field]: toTitleCase(val) }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.put(`/leads/${editingLead._id}`, editingLead);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message?.toLowerCase().includes('duplicate')) {
                if (error.response.data.message.toLowerCase().includes('email')) setErrors(prev => ({ ...prev, email: 'Email already exists' }));
                else if (error.response.data.message.toLowerCase().includes('phone')) setErrors(prev => ({ ...prev, phone: 'Phone number already exists' }));
                else alert(error.response.data.message);
            } else {
                alert('Failed to update lead');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-6">Edit Lead</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" required value={editingLead.name} onChange={e => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} error={errors.name} />
                    <Input label="Email" type="email" required value={editingLead.email} onChange={e => handleChange('email', e.target.value)} error={errors.email} />
                    <Input label="Phone" required value={editingLead.phone} onChange={e => handleChange('phone', e.target.value)} error={errors.phone} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Course" value={editingLead.courseName || ''} onChange={e => handleChange('courseName', e.target.value)} onBlur={() => handleBlur('courseName')} />
                        <Input label="College" value={editingLead.collegeName || ''} onChange={e => handleChange('collegeName', e.target.value)} onBlur={() => handleBlur('collegeName')} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Remarks</label>
                        <textarea
                            className="w-full p-3 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white min-h-[100px]"
                            value={editingLead.notes || ''}
                            onChange={e => handleChange('notes', e.target.value)}
                            placeholder="Add notes..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 border-white/5 !text-gray-300">Cancel</Button>
                        <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-blue-600">{loading ? 'Updating...' : 'Update Lead'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLeadModal;
