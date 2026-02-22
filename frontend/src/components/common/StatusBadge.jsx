const statusConfig = {
  placed: { label: 'Placed', class: 'bg-blue-50 text-blue-600' },
  confirmed: { label: 'Confirmed', class: 'bg-indigo-50 text-indigo-600' },
  preparing: { label: 'Preparing', class: 'bg-yellow-50 text-yellow-600' },
  ready: { label: 'Ready', class: 'bg-green-50 text-green-600' },
  picked_up: { label: 'Picked Up', class: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-500' },
  // payment
  paid: { label: 'Paid', class: 'bg-green-50 text-green-600' },
  pending: { label: 'Pending', class: 'bg-yellow-50 text-yellow-600' },
  failed: { label: 'Failed', class: 'bg-red-50 text-red-500' },
  refunded: { label: 'Refunded', class: 'bg-purple-50 text-purple-600' },
  // canteen
  active: { label: 'Active', class: 'bg-green-50 text-green-600' },
  inactive: { label: 'Inactive', class: 'bg-gray-100 text-gray-500' },
  blocked: { label: 'Blocked', class: 'bg-red-50 text-red-500' },
  rejected: { label: 'Rejected', class: 'bg-red-50 text-red-500' },
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
