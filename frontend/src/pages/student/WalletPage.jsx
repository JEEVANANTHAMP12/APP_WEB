import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const WalletPage = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10) {
      toast.error('Minimum top-up is ₹10');
      return;
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed'); return; }

      const { data } = await paymentAPI.walletTopup(amt);
      const rzp = data.data;

      const options = {
        key: rzp.key,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'Campus Cravings Wallet',
        description: `Add ₹${amt} to wallet`,
        order_id: rzp.razorpay_order_id,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#f97316' },
        handler: async (response) => {
          try {
            const { data: vData } = await paymentAPI.verifyWallet({ ...response, amount: amt });
            updateUser({ ...user, wallet_balance: vData.data.wallet_balance });
            toast.success(`₹${amt} added to wallet! 🎉`);
            setAmount('');
          } catch { toast.error('Verification failed'); }
        },
      };
      new window.Razorpay(options).open();
    } catch { toast.error('Top-up failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-400 rounded-2xl p-6 text-white">
        <p className="text-white/70 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-4xl font-bold">₹{user?.wallet_balance || 0}</p>
        <p className="text-white/60 text-xs mt-2">Use wallet for quick checkout</p>
      </div>

      {/* Top-up Card */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-800">Add Money</h3>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                amount === String(a)
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              ₹{a}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
            <input
              type="number"
              className="input pl-8"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={10}
            />
          </div>
        </div>

        <button
          onClick={handleTopup}
          disabled={loading || !amount}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
        </button>
      </div>

      {/* How it works */}
      <div className="card bg-blue-50 border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2">💡 How Wallet Works</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Top-up using UPI, Cards, Net Banking</li>
          <li>• Use wallet balance at checkout</li>
          <li>• Instant payments, no waiting</li>
          <li>• Secure & hassle-free</li>
        </ul>
      </div>
    </div>
  );
};

export default WalletPage;
