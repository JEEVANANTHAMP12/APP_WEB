const statusConfig = {
  placed:    { label: 'Placed',     class: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' },
  confirmed: { label: 'Confirmed',  class: 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30' },
  preparing: { label: 'Preparing',  class: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' },
  ready:     { label: 'Ready',      class: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' },
  picked_up: { label: 'Picked Up',  class: 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30' },
  cancelled: { label: 'Cancelled',  class: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
  // payment
  paid:      { label: 'Paid',       class: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' },
  pending:   { label: 'Pending',    class: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30' },
  failed:    { label: 'Failed',     class: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
  refunded:  { label: 'Refunded',   class: 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30' },
  // canteen
  active:    { label: 'Active',     class: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' },
  inactive:  { label: 'Inactive',   class: 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30' },
  blocked:   { label: 'Blocked',    class: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
  rejected:  { label: 'Rejected',   class: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.class}`}>
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
