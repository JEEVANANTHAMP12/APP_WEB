import { useState, useEffect, useCallback } from 'react';
import { adminAPI, universityAPI } from '../../services/api';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';

const TABS = ['pending', 'active', 'all'];

const STATUS_STYLES = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  active:    'bg-emerald-500/20 text-emerald-400',
  suspended: 'bg-red-500/20 text-red-400',
  inactive:  'bg-slate-500/20 text-slate-400',
  rejected:  'bg-red-600/20 text-red-500',
};

const EMPTY_FORM = {
  name: '', description: '', phone: '',
  university_id: '', owner_id: '',
  commission_percentage: 10,
  opening_time: '08:00', closing_time: '20:00',
  status: 'active',
};

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const AdminCanteensPage = () => {
  const [canteens, setCanteens]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [tab, setTab]                           = useState('all');
  const [commissionInputs, setCommissionInputs] = useState({});

  const [universities, setUniversities] = useState([]);
  const [ownerUsers, setOwnerUsers]     = useState([]);

  const [modal, setModal]           = useState(null); // 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchCanteens = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? { status: tab } : {};
      const { data } = await adminAPI.getPendingCanteens(params);
      setCanteens(data.data.canteens);
    } catch { toast.error('Failed to load canteens'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchCanteens(); }, [fetchCanteens]);

  useEffect(() => {
    universityAPI.getAll({ limit: 100, status: '' })
      .then(({ data }) => setUniversities(data.data || []))
      .catch(() => {});
    adminAPI.getUsers({ role: 'owner', limit: 100 })
      .then(({ data }) => setOwnerUsers(data.data || []))
      .catch(() => {});
  }, []);

  const handleApprove = async (ownerId) => {
    try {
      await adminAPI.approveOwner(ownerId);
      toast.success('Owner approved! Canteen is now active.');
      fetchCanteens();
    } catch (err) { toast.error(err.response?.data?.message || 'Approval failed'); }
  };

  const handleSetCommission = async (canteenId) => {
    const pct = commissionInputs[canteenId];
    if (!pct || isNaN(pct)) return toast.error('Enter a valid percentage');
    try {
      await adminAPI.setCommission(canteenId, Number(pct));
      toast.success(`Commission set to ${pct}%`);
      fetchCanteens();
    } catch { toast.error('Failed to set commission'); }
  };

  const handleStatusChange = async (canteenId, newStatus) => {
    try {
      await adminAPI.updateCanteenStatus(canteenId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchCanteens();
    } catch { toast.error('Status update failed'); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('create'); };

  const openEdit = (c) => {
    setEditTarget(c);
    setForm({
      name:                  c.name || '',
      description:           c.description || '',
      phone:                 c.phone || '',
      university_id:         c.university_id?._id || c.university_id || '',
      owner_id:              c.owner_id?._id || c.owner_id || '',
      commission_percentage: c.commission_percentage ?? 10,
      opening_time:          c.opening_time || '08:00',
      closing_time:          c.closing_time || '20:00',
      status:                c.status || 'active',
    });
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Canteen name is required');
    if (!form.university_id) return toast.error('Please select a university');
    setSaving(true);
    try {
      if (modal === 'create') {
        await adminAPI.createCanteen(form);
        toast.success('Canteen created!');
        closeModal();
        setTab('all'); // triggers useEffect → fetchCanteens with status=all
      } else {
        await adminAPI.editCanteen(editTarget._id, form);
        toast.success('Canteen updated!');
        closeModal();
        fetchCanteens();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAPI.deleteCanteen(deleteTarget.id);
      setCanteens((prev) => prev.filter((c) => c._id !== deleteTarget.id));
      toast.success('Canteen deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Canteens</h1>
          <p className="page-subtitle">Manage canteen registrations and details</p>
        </div>
        <button
          onClick={openCreate}
          className="flex-shrink-0 flex items-center gap-2 btn-primary py-2 px-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Canteen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : ''}
                style={activeTab !== tab.value ? { color: 'var(--text-muted)' } : {}}
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : canteens.length === 0 ? (
        <div className="card text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">🏪</div>
          <p>No canteens in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {canteens.map((c) => (
            <div key={c._id} className="card card-hover animate-slide-up">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4 items-start">
                  {c.image && (
                    <img src={c.image} alt={c.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" style={{ background: 'var(--bg-elevated)' }} />
                  )}
                  <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.university_id?.name} · {c.phone || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Owner: {c.owner_id?.name || '—'} {c.owner_id?.email ? `(${c.owner_id.email})` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[c.status] || ''}`}
                        style={!STATUS_STYLES[c.status] ? { background: 'var(--bg-elevated)', color: 'var(--text-secondary)' } : {}}>
                    {c.status}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.is_open ? 'bg-emerald-500/20 text-emerald-400' : ''}`}
                        style={!c.is_open ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : {}}>
                    {c.is_open ? '🟢 Open' : '⚫ Closed'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                {c.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(c.owner_id?._id)}
                    className="text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    ✓ Approve Owner
                  </button>
                )}
                {c.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(c._id, 'suspended')}
                    className="text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 px-4 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Suspend
                  </button>
                )}
                {c.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(c._id, 'active')}
                    className="text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => openEdit(c)}
                  className="text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-4 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                  className="text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  Delete
                </button>

                {/* Commission */}
                <div className="flex gap-2 ml-auto items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Commission: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.commission_percentage}%</span>
                  </span>
                  <input
                    type="number" min="0" max="50" step="0.5"
                    placeholder="Set %"
                    className="input py-1.5 px-2 text-sm w-20"
                    value={commissionInputs[c._id] || ''}
                    onChange={(e) => setCommissionInputs((prev) => ({ ...prev, [c._id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleSetCommission(c._id)}
                    className="text-sm bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {modal === 'create' ? 'Add New Canteen' : 'Edit Canteen'}
              </h2>
              <button onClick={closeModal} className="btn-ghost p-1 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Canteen Name *">
                    <input className="input w-full" placeholder="e.g. Central Canteen" value={form.name} onChange={f('name')} required />
                  </Field>
                </div>

                <Field label="University *">
                  <CustomSelect
                    value={form.university_id}
                    onChange={f('university_id')}
                    placeholder="Select university…"
                    options={universities.map((u) => ({ value: u._id, label: u.name }))}
                    required
                  />
                </Field>

                <Field label="Owner (optional)">
                  <CustomSelect
                    value={form.owner_id}
                    onChange={f('owner_id')}
                    options={[{ value: '', label: 'No owner assigned' }, ...ownerUsers.map((u) => ({ value: u._id, label: `${u.name} (${u.email})` }))]}
                  />
                </Field>

                <Field label="Phone">
                  <input className="input w-full" placeholder="Contact number" value={form.phone} onChange={f('phone')} />
                </Field>

                <Field label="Status">
                  <CustomSelect
                    value={form.status}
                    onChange={f('status')}
                    options={['active', 'pending', 'inactive', 'suspended', 'rejected'].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                  />
                </Field>

                <Field label="Opening Time">
                  <input type="time" className="input w-full" value={form.opening_time} onChange={f('opening_time')} />
                </Field>

                <Field label="Closing Time">
                  <input type="time" className="input w-full" value={form.closing_time} onChange={f('closing_time')} />
                </Field>

                <Field label="Commission %">
                  <input
                    type="number" min="0" max="100" step="0.5"
                    className="input w-full"
                    value={form.commission_percentage}
                    onChange={f('commission_percentage')}
                  />
                </Field>

                <div className="col-span-2">
                  <Field label="Description">
                    <textarea
                      className="input w-full resize-none"
                      rows={3}
                      placeholder="Brief description…"
                      value={form.description}
                      onChange={f('description')}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 py-2 text-sm" disabled={saving}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl bg-brand-gradient text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Canteen' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
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
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delete Canteen</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Permanently delete <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</span>?
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 py-2 text-sm" disabled={deleting}>
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
          </div>        </div>
      )}
    </div>
  );
};

export default AdminCanteensPage;