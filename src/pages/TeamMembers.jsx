import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Trash2, Key, UserPlus, X, Phone, Mail, ShieldAlert } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const TeamMembers = () => {
    const { user: currentUser } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // State for actions
    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'employee' });
    const [editingUser, setEditingUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/users');
            setUsersList(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', newUser);
            alert('User created successfully');
            setShowAddModal(false);
            setNewUser({ name: '', email: '', phone: '', password: '', role: 'employee' });
            fetchUsers();
        } catch (error) {
            alert('Failed to create user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        if (!window.confirm(`Change role to ${newRole}?`)) return;
        try {
            const res = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
            setUsersList(usersList.map(u => u._id === userId ? { ...u, role: res.data.role } : u));
        } catch (error) {
            console.error(error);
            alert('Failed to update role');
        }
    };

    const handleUpdateUserPassword = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/auth/users/${editingUser._id}/password`, { password: newPassword });
            alert('Password updated successfully');
            setNewPassword('');
            setShowPasswordModal(false);
        } catch (error) {
            alert('Failed to update password');
        }
    };

    const confirmDelete = async (e) => {
        e.preventDefault();
        try {
            // Verify admin password
            await api.post('/auth/login', { email: currentUser.email, password: adminPassword });

            // Proceed to delete
            await api.delete(`/auth/users/${userToDelete._id}`);
            setUsersList(usersList.filter(u => u._id !== userToDelete._id));
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            setAdminPassword('');
            alert('User deleted successfully');
        } catch (error) {
            alert('Incorrect admin password or deletion failed.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Team Members</h1>
                    <p className="text-muted text-sm mt-1">Manage employee access and roles.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition border border-accent/20 font-bold">
                        <UserPlus size={16} /> Add Employee
                    </button>
                )}
            </div>

            <div className="glass-card overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-sm uppercase text-muted">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Contact</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Joined Date</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-muted">Loading team...</td></tr>
                            ) : usersList.map((u) => (
                                <tr key={u._id} className="hover:bg-white/5 transition">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 overflow-hidden flex-shrink-0">
                                            {u.avatar ? (
                                                <img src={u.avatar.startsWith('http') ? u.avatar : `${import.meta.env.VITE_API_URL}${u.avatar}`} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs font-bold text-muted">{u.name[0]}</div>
                                            )}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-300"><Mail size={12} className="text-muted" /> {u.email}</div>
                                            {u.phone && <div className="flex items-center gap-2 text-sm text-gray-300"><Phone size={12} className="text-muted" /> {u.phone}</div>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                            disabled={currentUser._id === u._id} // Prevent changing own role
                                            className={`text-xs font-bold px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}
                                        >
                                            <option value="employee" className="bg-surface text-white">Employee</option>
                                            <option value="admin" className="bg-surface text-white">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setEditingUser(u); setShowPasswordModal(true); }} className="p-2 hover:bg-white/10 rounded-lg transition text-yellow-400" title="Reset Password">
                                                <Key size={18} />
                                            </button>
                                            {currentUser._id !== u._id && (
                                                <button onClick={() => { setUserToDelete(u); setShowDeleteConfirm(true); }} className="p-2 hover:bg-white/10 rounded-lg transition text-red-400" title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-bold mb-6">Add Employee</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <Input label="Name" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            <Input label="Email" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            <Input label="Phone" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                            <Input label="Password" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Role</label>
                                <select
                                    className="w-full p-3 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="employee" className="bg-surface">Employee</option>
                                    <option value="admin" className="bg-surface">Admin</option>
                                </select>
                            </div>
                            <Button type="submit">Create User</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <h2 className="text-lg font-bold mb-6">Reset Password for {editingUser.name}</h2>
                        <form onSubmit={handleUpdateUserPassword} className="space-y-4">
                            <Input label="New Password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <Button type="submit">Update Password</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-red-500/30 p-6 md:p-8 rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => { setShowDeleteConfirm(false); setAdminPassword(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                        <div className="flex items-center gap-3 mb-4 text-red-400">
                            <ShieldAlert size={32} />
                            <h2 className="text-xl font-bold">Admin Authorization</h2>
                        </div>
                        <p className="text-gray-300 mb-6">
                            You are about to delete <strong>{userToDelete.name}</strong>. This action cannot be undone.
                            Please enter your admin password to confirm.
                        </p>
                        <form onSubmit={confirmDelete} className="space-y-4">
                            <Input label="Admin Password" type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter your password" />
                            <div className="flex gap-3">
                                <Button type="button" onClick={() => { setShowDeleteConfirm(false); setAdminPassword(''); }} className="bg-white/5 border-white/10">Cancel</Button>
                                <Button type="submit" className="bg-red-500 hover:bg-red-600 border-red-500">Confirm Deletion</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMembers;
