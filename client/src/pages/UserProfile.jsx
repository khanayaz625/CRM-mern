import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Camera, Save } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, email: user.email, password: '' });
            setImagePreview(
                user.avatar
                    ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`)
                    : null
            );
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('email', profileData.email);
        if (profileData.password) formData.append('password', profileData.password);
        if (profileImage) formData.append('avatar', profileImage);

        try {
            const res = await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data);
            if (res.data.avatar) {
                setImagePreview(
                    res.data.avatar.startsWith('http')
                        ? res.data.avatar
                        : `${import.meta.env.VITE_API_URL}${res.data.avatar}`
                );
            }
            alert('Profile updated successfully!');
            setProfileData(prev => ({ ...prev, password: '' }));
            setProfileImage(null);
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">My Profile</h1>
                <p className="text-muted text-sm mt-1">Manage your account settings</p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/10">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group cursor-pointer w-32 h-32">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-2xl bg-surface">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition shadow-lg">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-sm text-gray-400">Click icon to change photo</p>
                    </div>

                    <div className="grid gap-4">
                        <Input
                            label="Full Name"
                            value={profileData.name}
                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={profileData.email}
                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                        />
                        <Input
                            label="New Password (optional)"
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={profileData.password}
                            onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                        <Button type="submit" disabled={loading} className="flex items-center gap-2">
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
