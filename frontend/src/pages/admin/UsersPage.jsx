import { useState, useEffect, useCallback } from 'react';
import { adminAPI, universityAPI } from '../../services/api';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';

const ROLES = ['all', 'student', 'owner', 'staff', 'admin'];
const FORM_ROLES = ['student', 'owner', 'staff', 'admin'];

const ROLE_COLORS = {
  student: 'bg-blue-500/20 text-blue-400',
  owner: 'bg-orange-500/20 text-orange-400',
  staff: 'bg-emerald-500/20 text-emerald-400',
  admin: 'bg-violet-500/20 text-violet-400',
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'student', phone: '', university_id: '' };

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // create / edit modal
  const [modal, setModal]         = useState(null); // 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [universities, setUniversities] = useState([]);
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(role !== 'all' && { role }), ...(search && { search }) };
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
      setTotal(data.pagination.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    universityAPI.getAll({ limit: 100, status: '' })
      .then(({ data }) => setUniversities(data.data || []))
      .catch(() => {});
  }, []);

  const handleBlock = async (id, is_active) => {
    try {
      await adminAPI.toggleBlock(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, is_active: !is_active } : u));
      toast.success(is_active ? 'User blocked' : 'User unblocked');
    } catch { toast.error('Action failed'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget.id));
      setTotal((t) => t - 1);
      toast.success('User deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('create'); };

  const openEdit = (u) => {
    setEditTarget(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      phone: u.phone || '',
      university_id: u.university_id?._id || u.university_id || '',
    });
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error('Name and email are required');
    if (modal === 'create' && !form.password) return toast.error('Password is required');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.university_id) delete payload.university_id;
      if (modal === 'edit' && !payload.password) delete payload.password;
      if (modal === 'create') {
        const { data } = await adminAPI.createUser(payload);
        setUsers((prev) => [data.data.user, ...prev]);
        setTotal((t) => t + 1);
        toast.success('User created!');
      } else {
        const { data } = await adminAPI.updateUser(editTarget._id, payload);
        setUsers((prev) => prev.map((u) => u._id === editTarget._id ? data.data.user : u));
        toast.success('User updated!');
      }
      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{total} registered accounts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex-shrink-0 flex items-center gap-2 btn-primary py-2 px-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-white/5">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                role === r
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
          className="flex gap-2 ml-auto"
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              className="input pl-9 py-2 text-sm w-56"
              placeholder="Search name / email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['User', 'Email', 'Role', 'Phone', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-14">
                      <div className="text-3xl mb-2">👤</div>
                      No users found
                    </td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-400 text-sm">{u.email}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-slate-700 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell text-slate-400 text-sm">{u.phone || '—'}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active === false ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {u.is_active === false ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBlock(u._id, u.is_active)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                            u.is_active === false
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                          }`}
                        >
                          {u.is_active === false ? 'Unblock' : 'Block'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteTarget({ id: u._id, name: u.name })}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            Page {page} of {totalPages} · {total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative card w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">
                {modal === 'create' ? 'Add New User' : 'Edit User'}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Full Name *">
                <input className="input w-full" placeholder="e.g. John Doe" value={form.name} onChange={f('name')} required />
              </Field>
              <Field label="Email *">
                <input type="email" className="input w-full" placeholder="user@email.com" value={form.email} onChange={f('email')} required />
              </Field>
              <Field label={modal === 'create' ? 'Password *' : 'New Password (leave blank to keep)'}>
                <input
                  type="password"
                  className="input w-full"
                  placeholder={modal === 'create' ? 'Min 6 characters' : 'Leave blank to keep current'}
                  value={form.password}
                  onChange={f('password')}
                  required={modal === 'create'}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Role">
                  <CustomSelect
                    value={form.role}
                    onChange={f('role')}
                    options={FORM_ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                  />
                </Field>
                <Field label="Phone">
                  <input className="input w-full" placeholder="Phone number" value={form.phone} onChange={f('phone')} />
                </Field>
              </div>
              <Field label="University">
                <CustomSelect
                  value={form.university_id}
                  onChange={f('university_id')}
                  options={[{ value: '', label: 'No university' }, ...universities.map((u) => ({ value: u._id, label: u.name }))]}
                />
              </Field>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 py-2 text-sm" disabled={saving}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {saving ? 'Saving…' : modal === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative card w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">Delete User</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">{deleteTarget.name}</span>?
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1 py-2 text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
