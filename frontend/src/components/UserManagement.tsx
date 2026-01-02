import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Mail, Trash2, Key, Edit2, X, Check, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { ConfirmationModal } from './ConfirmationModal';
import { InfoModal } from './InfoModal';

interface User {
    aid: string;
    username: string;
    email: string;
    full_name: string;
    roles: string[];
    is_active: boolean;
    password_expired: boolean;
    created_date: string;
}

const ROLE_GROUPS = [
    {
        artifact: 'Vision',
        roles: ['vision_create', 'vision_edit', 'vision_delete']
    },
    {
        artifact: 'Need',
        roles: ['need_create', 'need_edit', 'need_delete']
    },
    {
        artifact: 'Use Case',
        roles: ['uc_create', 'uc_edit', 'uc_delete']
    },
    {
        artifact: 'Requirement',
        roles: ['req_create', 'req_edit', 'req_delete']
    },
    {
        artifact: 'Document',
        roles: ['doc_create', 'doc_edit', 'doc_delete']
    },
    {
        artifact: 'Comment',
        roles: ['comment_create', 'comment_resolve']
    }
];

const SPECIAL_ROLES = [
    { id: 'admin', label: 'Administrator', description: 'Full system access', color: 'purple' },
    { id: 'operator', label: 'Operator', description: 'Database backup/restore', color: 'blue' },
    { id: 'viewer', label: 'Viewer', description: 'Read-only access', color: 'slate' }
];

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        full_name: '',
        roles: [] as string[]
    });

    const [showPassword, setShowPassword] = useState(false);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [infoModal, setInfoModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    const { data: users } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/users/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Failed to create user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsCreating(false);
            setFormData({ username: '', password: '', email: '', full_name: '', roles: [] });
            setInfoModal({
                isOpen: true,
                title: 'Success',
                message: 'User created successfully!'
            });
        },
        onError: (err: any) => setInfoModal({
            isOpen: true,
            title: 'Error',
            message: err.message
        })
    });

    const updateMutation = useMutation({
        mutationFn: async ({ aid, data }: { aid: string, data: any }) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/users/${aid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || 'Failed to update user');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingUser(null);
            setFormData({ username: '', password: '', email: '', full_name: '', roles: [] });
            setInfoModal({
                isOpen: true,
                title: 'Success',
                message: 'User updated successfully!'
            });
        },
        onError: (err: any) => setInfoModal({
            isOpen: true,
            title: 'Error',
            message: err.message
        })
    });

    const deleteMutation = useMutation({
        mutationFn: async (aid: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/users/${aid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete user');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (aid: string) => {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/users/${aid}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to reset password');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setInfoModal({
                isOpen: true,
                title: 'Password Reset',
                message: `Password reset to: ${data.new_password}\n\nUser will be prompted to change it on next login.`
            });
        }
    });

    const toggleRole = (roleId: string) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(roleId)
                ? prev.roles.filter(r => r !== roleId)
                : [...prev.roles, roleId]
        }));
    };

    const toggleArtifactRoles = (artifactRoles: string[]) => {
        const allSelected = artifactRoles.every(r => formData.roles.includes(r));
        setFormData(prev => ({
            ...prev,
            roles: allSelected
                ? prev.roles.filter(r => !artifactRoles.includes(r))
                : [...new Set([...prev.roles, ...artifactRoles])]
        }));
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            email: user.email,
            full_name: user.full_name,
            roles: user.roles || []
        });
    };

    const handleSave = () => {
        if (editingUser) {
            updateMutation.mutate({
                aid: editingUser.aid,
                data: {
                    email: formData.email,
                    full_name: formData.full_name,
                    roles: formData.roles
                }
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setIsCreating(false);
        setFormData({ username: '', password: '', email: '', full_name: '', roles: [] });
    };

    const RoleSelector = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Special Roles</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {SPECIAL_ROLES.map(role => (
                        <label
                            key={role.id}
                            className={clsx(
                                "flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-white",
                                formData.roles.includes(role.id)
                                    ? `bg-${role.color}-50 border-${role.color}-500`
                                    : "bg-white border-slate-200"
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={formData.roles.includes(role.id)}
                                onChange={() => toggleRole(role.id)}
                                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-bold text-sm text-slate-800">{role.label}</div>
                                <div className="text-xs text-slate-500">{role.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Artifact Permissions</label>
                <div className="space-y-2 border rounded-lg p-4 bg-slate-50">
                    {ROLE_GROUPS.map(group => {
                        const allSelected = group.roles.every(r => formData.roles.includes(r));

                        return (
                            <div key={group.artifact} className="bg-white rounded-lg border border-slate-200 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-slate-700">{group.artifact}</span>
                                    <button
                                        onClick={() => toggleArtifactRoles(group.roles)}
                                        className={clsx(
                                            "px-3 py-1 rounded-md text-xs font-bold transition-all",
                                            allSelected
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        )}
                                    >
                                        {allSelected ? '✓ All Granted' : 'Grant All'}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {group.roles.map(roleId => {
                                        const label = roleId.split('_').pop();
                                        return (
                                            <label
                                                key={roleId}
                                                className={clsx(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all",
                                                    formData.roles.includes(roleId)
                                                        ? label === 'create' ? "bg-green-100 text-green-700 border border-green-300"
                                                            : label === 'edit' ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                                : label === 'delete' ? "bg-red-100 text-red-700 border border-red-300"
                                                                    : "bg-purple-100 text-purple-700 border border-purple-300"
                                                        : "bg-slate-50 text-slate-500 border border-slate-200"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.roles.includes(roleId)}
                                                    onChange={() => toggleRole(roleId)}
                                                    className="w-3 h-3"
                                                />
                                                {label?.charAt(0).toUpperCase()}{label?.slice(1)}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        User Management
                    </h2>
                    <p className="text-sm text-slate-500">Create and manage registry users and their permissions.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </header>

            {(isCreating || editingUser) && (
                <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-slate-800 mb-4">
                        {editingUser ? `Edit User: ${editingUser.username}` : 'Create New User'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                disabled={!!editingUser}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                                placeholder="john_doe"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="john@example.com"
                            />
                        </div>
                        {!editingUser && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Initial Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Min 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <RoleSelector />

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={cancelEdit}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save User"}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users?.map(user => (
                            <tr key={user.aid} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{user.full_name}</div>
                                            <div className="text-sm text-slate-400 font-mono">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-300" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles?.slice(0, 3).map(role => (
                                            <span
                                                key={role}
                                                className={clsx(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    role === 'admin' ? "bg-purple-100 text-purple-700 border border-purple-200" :
                                                        role.includes('delete') ? "bg-red-100 text-red-700 border border-red-200" :
                                                            role.includes('edit') ? "bg-blue-100 text-blue-700 border border-blue-200" :
                                                                role.includes('create') ? "bg-green-100 text-green-700 border border-green-200" :
                                                                    "bg-slate-100 text-slate-700 border border-slate-200"
                                                )}
                                            >
                                                {role.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                        {user.roles && user.roles.length > 3 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                                +{user.roles.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className={clsx("w-2 h-2 rounded-full", user.is_active ? "bg-green-500" : "bg-red-500")} />
                                            <span className="text-sm font-medium">{user.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                        {user.password_expired && (
                                            <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                                                <Key className="w-3 h-3" /> PWD Change Req
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(user)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmModal({
                                                    isOpen: true,
                                                    title: 'Reset Password',
                                                    message: `Are you sure you want to reset the password for ${user.username}? A temporary password will be generated.`,
                                                    onConfirm: () => resetPasswordMutation.mutate(user.aid)
                                                });
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Reset Password"
                                        >
                                            <Key className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setConfirmModal({
                                                    isOpen: true,
                                                    title: 'Delete User',
                                                    message: `Are you sure you want to delete ${user.username}? This action is irreversible.`,
                                                    isDestructive: true,
                                                    onConfirm: () => deleteMutation.mutate(user.aid)
                                                });
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                {...confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />

            <InfoModal
                {...infoModal}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
            />
        </div>
    );
}
