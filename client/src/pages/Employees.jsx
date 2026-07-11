import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import {
    UserPlus, Search, Pencil, Trash2, X,
    Loader2, CheckCircle2, AlertCircle, Users, Copy
} from 'lucide-react';

// ── Modal ─────────────────────────────────────────────────────────────────────

const EmployeeModal = ({ employee, onClose, onSave }) => {
    const isEdit = Boolean(employee);
    const [name, setName] = useState(employee?.name || '');
    const [email, setEmail] = useState(employee?.email || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            let data;
            if (isEdit) {
                const res = await api.put(`/auth/employees/${employee._id}`, { name, email });
                data = res.data;
            } else {
                const res = await api.post('/auth/employees', { name, email });
                data = res.data;
            }
            onSave(data, isEdit);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="font-bold text-white text-lg">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            placeholder="Employee's full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            placeholder="employee@company.com"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all font-medium cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold transition-all flex items-center justify-center cursor-pointer"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Create Employee'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Delete Confirm ────────────────────────────────────────────────────────────

const DeleteConfirm = ({ employee, onClose, onConfirm, deleting }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="font-bold text-white text-lg mb-2">Delete Employee</h2>
            <p className="text-slate-400 text-sm mb-1">Are you sure you want to delete <span className="text-white font-semibold">{employee?.name}</span>?</p>
            <p className="text-red-400 text-xs mb-6">This will also delete all tasks assigned to them. This action cannot be undone.</p>
            <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all font-medium cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold transition-all flex items-center justify-center cursor-pointer"
                >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border ${
        type === 'error'
            ? 'bg-slate-900 border-red-500/30 text-red-400'
            : 'bg-slate-900 border-emerald-500/30 text-emerald-400'
    }`}>
        {type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
        <span className="text-sm font-medium text-slate-200">{message}</span>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchEmployees = useCallback(async () => {
        try {
            const { data } = await api.get(`/auth/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`);
            setEmployees(data);
        } catch {
            showToast('Failed to load employees.', 'error');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchEmployees(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchEmployees]);

    const handleSave = (saved, isEdit) => {
        if (isEdit) {
            setEmployees(prev => prev.map(e => e._id === saved._id ? { ...e, ...saved } : e));
            showToast(`${saved.name} updated successfully.`);
        } else {
            setEmployees(prev => [saved, ...prev]);
            showToast(`${saved.name} added successfully.`);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/auth/employees/${deleteTarget._id}`);
            setEmployees(prev => prev.filter(e => e._id !== deleteTarget._id));
            showToast(`${deleteTarget.name} deleted.`);
            setDeleteTarget(null);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Employees</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage employee accounts.</p>
                </div>
                <button
                    onClick={() => { setEditEmployee(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl transition-all cursor-pointer flex-shrink-0"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : employees.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                    <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">{search ? 'No employees match your search.' : 'No employees yet. Add your first one.'}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Email</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Employee ID</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Joined</th>
                                        <th className="text-right text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {employees.map(emp => (
                                        <tr key={emp._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-white">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
                                                    <span>{emp.employeeId}</span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(emp.employeeId);
                                                            showToast('Employee ID copied to clipboard!');
                                                        }}
                                                        className="p-1 rounded hover:bg-slate-800 hover:text-orange-400 text-slate-500 transition-colors cursor-pointer"
                                                        title="Copy Employee ID"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    emp.isJoined
                                                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                                }`}>
                                                    {emp.isJoined ? 'Joined' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {emp.isJoined ? formatDate(emp.updatedAt) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => { setEditEmployee(emp); setShowModal(true); }}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(emp)}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="block md:hidden space-y-4">
                        {employees.map(emp => (
                            <div key={emp._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                            {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{emp.name}</p>
                                            <p className="text-xs text-slate-400">{emp.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        emp.isJoined
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                    }`}>
                                        {emp.isJoined ? 'Joined' : 'Pending'}
                                    </span>
                                </div>

                                <div className="border-t border-slate-800/60 pt-3 flex justify-between items-center text-xs">
                                    <div className="space-y-1">
                                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Employee ID</span>
                                        <div className="flex items-center space-x-1.5 font-mono text-slate-300">
                                            <span>{emp.employeeId}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(emp.employeeId);
                                                    showToast('Employee ID copied to clipboard!');
                                                }}
                                                className="p-1 text-slate-500 hover:text-orange-400 transition-colors"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Joined</span>
                                        <p className="text-slate-300 font-medium">{emp.isJoined ? formatDate(emp.updatedAt) : '—'}</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800/60 pt-3 flex gap-3">
                                    <button
                                        onClick={() => { setEditEmployee(emp); setShowModal(true); }}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(emp)}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modals */}
            {showModal && (
                <EmployeeModal
                    employee={editEmployee}
                    onClose={() => { setShowModal(false); setEditEmployee(null); }}
                    onSave={handleSave}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    employee={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
};

export default Employees;
