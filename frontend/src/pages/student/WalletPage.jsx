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
    if (!amt || amt < 10) { toast.error('Minimum top-up is ₹10'); return; }
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
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">My Wallet</h1>
        <p className="page-subtitle">Manage your campus wallet</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 shadow-2xl shadow-orange-500/30">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-2 w-20 h-20 rounded-full bg-white/5" />
        <p className="text-white/70 text-sm font-medium mb-1">Available Balance</p>
        <p className="text-5xl font-bold text-white">₹{user?.wallet_balance || 0}</p>
        <p className="text-white/60 text-xs mt-3">Use wallet balance for instant checkout</p>
      </div>

      {/* Add Money */}
      <div className="card space-y-4">
        <h3 className="font-bold text-white">Add Money</h3>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(String(a))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                amount === String(a)
                  ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                  : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
              }`}
            >
              ₹{a}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div>
          <label className="input-label">Custom Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={10}
              className="input pl-8"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Minimum ₹10 · Secure payment via Razorpay</p>
        </div>

        <button
          onClick={handleTopup}
          disabled={loading || !amount}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
        </button>
      </div>

      {/* Info */}
      <div className="card space-y-3">
        <h3 className="font-bold text-white text-sm">How it works</h3>
        {[
          ['Add money', 'Top up using UPI, card, or net banking'],
          ['Use at checkout', 'Pay instantly without re-entering payment details'],
          ['Safe & secure', 'All transactions are encrypted and secure'],
        ].map(([title, desc]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs mt-0.5">✓</span>
            <div>
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletPage;
