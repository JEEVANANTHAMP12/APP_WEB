import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ROLES = ['all', 'student', 'owner', 'staff', 'admin'];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...(role !== 'all' && { role }), ...(search && { search }) };
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data.users);
      setTotal(data.data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBlock = async (id, is_blocked) => {
    try {
      await adminAPI.toggleBlock(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, is_blocked: !is_blocked } : u));
      toast.success(is_blocked ? 'User unblocked' : 'User blocked');
    } catch { toast.error('Action failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Users</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {ROLES.map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${role === r ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {r}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 ml-auto">
          <input className="input py-1.5 text-sm" placeholder="Search name / email..." value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} />
          <button type="submit" className="btn-primary py-1.5 px-4 text-sm">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-12"><div className="spinner" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {['Name', 'Email', 'Role', 'Phone', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-10">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-blue capitalize">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_blocked ? 'badge-red' : 'badge-green'}`}>
                      {u.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleBlock(u._id, u.is_blocked)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${u.is_blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      {u.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
