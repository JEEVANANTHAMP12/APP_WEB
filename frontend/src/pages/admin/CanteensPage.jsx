import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TABS = ['pending', 'active', 'all'];

const AdminCanteensPage = () => {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [commissionInputs, setCommissionInputs] = useState({});

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

  const handleApprove = async (ownerId, canteenId) => {
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
      toast.success(`Canteen status → ${newStatus}`);
      fetchCanteens();
    } catch { toast.error('Status update failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Canteens</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : canteens.length === 0 ? (
        <div className="card text-center text-gray-400 py-16">No canteens in this category.</div>
      ) : (
        <div className="space-y-4">
          {canteens.map((c) => (
            <div key={c._id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{c.name}</p>
                  <p className="text-sm text-gray-400">{c.university_id?.name} · {c.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Owner: {c.owner_id?.name} ({c.owner_id?.email})</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge capitalize ${
                    c.status === 'active' ? 'badge-green' : c.status === 'pending' ? 'badge-yellow' : 'badge-red'
                  }`}>{c.status}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.is_open ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {c.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t">
                {c.status === 'pending' && (
                  <button onClick={() => handleApprove(c.owner_id?._id, c._id)}
                    className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-green-700">
                    ✓ Approve Owner
                  </button>
                )}
                {c.status === 'active' && (
                  <button onClick={() => handleStatusChange(c._id, 'suspended')}
                    className="text-sm bg-red-50 text-red-500 px-4 py-1.5 rounded-lg font-semibold hover:bg-red-100">
                    Suspend
                  </button>
                )}
                {c.status === 'suspended' && (
                  <button onClick={() => handleStatusChange(c._id, 'active')}
                    className="text-sm bg-green-50 text-green-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-green-100">
                    Reactivate
                  </button>
                )}

                {/* Commission input */}
                <div className="flex gap-2 ml-auto items-center">
                  <span className="text-xs text-gray-500">Commission: <strong>{c.commission_percentage}%</strong></span>
                  <input
                    type="number" min="0" max="50" step="0.5"
                    placeholder="Set %"
                    className="input py-1 px-2 text-sm w-24"
                    value={commissionInputs[c._id] || ''}
                    onChange={(e) => setCommissionInputs((prev) => ({ ...prev, [c._id]: e.target.value }))}
                  />
                  <button onClick={() => handleSetCommission(c._id)}
                    className="text-sm bg-orange-50 text-orange-500 px-3 py-1 rounded-lg font-semibold hover:bg-orange-100">
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCanteensPage;
