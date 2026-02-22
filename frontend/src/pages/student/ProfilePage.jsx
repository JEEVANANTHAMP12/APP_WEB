// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Building2, IdCard, Camera, Wallet,
  ShoppingBag, MapPin, Heart, Bell, Settings2, ChevronRight,
  Sun, Moon, LogOut, Lock, Plus, Trash2, Package, Star, X,
  Check, RefreshCw, Download, Eye, ToggleLeft, ToggleRight,
  ShieldCheck, BellRing, Tag, Smartphone, Edit3, Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authAPI, orderAPI, paymentAPI } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true); s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const DEFAULT_LOCATIONS = [
  { id: 'hostel', label: 'Hostel Block', icon: '🏠' },
  { id: 'dept',   label: 'Department Block', icon: '🏛️' },
  { id: 'library',label: 'Library', icon: '📚' },
];
const STATUS_STEPS = ['placed','confirmed','preparing','ready','picked_up'];
const TABS = [
  { id: 'profile',       label: 'Personal Info',     icon: User,       color: '#6366f1' },
  { id: 'orders',        label: 'My Orders',          icon: ShoppingBag,color: '#0ea5e9' },
  { id: 'wallet',        label: 'Wallet',             icon: Wallet,     color: '#10b981' },
  { id: 'locations',     label: 'Pickup Spots',       icon: MapPin,     color: '#f59e0b' },
  { id: 'favorites',     label: 'Favorites',          icon: Heart,      color: '#ef4444' },
  { id: 'notifications', label: 'Notifications',      icon: Bell,       color: '#8b5cf6' },
  { id: 'settings',      label: 'Settings',           icon: Settings2,  color: '#64748b' },
];

/* ─────────────────────── Personal Info ───────────────────────── */
const PersonalInfoSection = ({ user, updateUser }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', avatar: user?.avatar||'' });
  const [loading, setLoading] = useState(false);
  const uniName = typeof user?.university_id === 'object' ? user?.university_id?.name : user?.university_id || '—';
  const studentId = user?._id?.toString().slice(-8).toUpperCase() || '--------';

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await authAPI.updateProfile({ name: form.name, phone: form.phone, avatar: form.avatar });
      updateUser(data.data.user); toast.success('Profile updated!'); setEditing(false);
    } catch { toast.error('Update failed'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="section-title">Personal Info</h2><p className="section-desc">Your profile and account details</p></div>
        {!editing && <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-2"><Edit3 size={14}/>Edit</button>}
      </div>

      <div className="card flex flex-col sm:flex-row items-center gap-5">
        <div className="relative shrink-0">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border-2" style={{borderColor:'var(--border-color)'}}/>
            : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{background:'linear-gradient(135deg,#6366f1,#a855f7)'}}>{user?.name?.[0]?.toUpperCase()||'?'}</div>
          }
          {editing && <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center"><Camera size={11} className="text-white"/></div>}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold" style={{color:'var(--text-primary)'}}>{user?.name}</h3>
          <p className="text-sm" style={{color:'var(--text-muted)'}}>{user?.email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            <span className="badge-role">🎓 Student</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'var(--bg-elevated)',color:'var(--text-muted)',border:'1px solid var(--border-color)'}}>ID: {studentId}</span>
          </div>
        </div>
        <div className="text-center shrink-0">
          <p className="text-xs" style={{color:'var(--text-muted)'}}>Wallet</p>
          <p className="text-2xl font-bold" style={{background:'linear-gradient(135deg,#10b981,#059669)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>₹{user?.wallet_balance||0}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="card space-y-4">
          <ImageUpload label="Profile Photo" value={form.avatar} onChange={v=>setForm({...form,avatar:v})}/>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="input-label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
            <div><label className="input-label">Phone</label><input className="input" type="tel" value={form.phone} placeholder="+91 XXXXX XXXXX" onChange={e=>setForm({...form,phone:e.target.value})}/></div>
            <div><label className="input-label">Email</label><input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled/></div>
            <div><label className="input-label">University</label><input className="input opacity-60 cursor-not-allowed" value={uniName} disabled/></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><Save size={14}/>{loading?'Saving...':'Save Changes'}</button>
            <button type="button" onClick={()=>setEditing(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="card grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{icon:User,label:'Name',value:user?.name},{icon:Phone,label:'Phone',value:user?.phone||'Not set'},{icon:Mail,label:'Email',value:user?.email},{icon:Building2,label:'University',value:uniName},{icon:IdCard,label:'Student ID',value:studentId},{icon:Wallet,label:'Wallet',value:`₹${user?.wallet_balance||0}`}]
            .map(({icon:Icon,label,value})=>(
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--bg-elevated)'}}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'rgba(99,102,241,0.1)'}}><Icon size={14} style={{color:'#6366f1'}}/></div>
                <div className="min-w-0"><p className="text-2xs font-semibold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>{label}</p><p className="text-sm font-medium truncate" style={{color:'var(--text-primary)'}}>{value}</p></div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── Orders ───────────────────────────────── */
const OrdersSection = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { orderAPI.getMyOrders({limit:5}).then(({data})=>setOrders(data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const stepColor = { placed:'#6366f1',confirmed:'#0ea5e9',preparing:'#f59e0b',ready:'#10b981',picked_up:'#6b7280',cancelled:'#ef4444' };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="section-title">My Orders</h2><p className="section-desc">Recent orders and quick actions</p></div>
        <button onClick={()=>navigate('/student/orders')} className="btn-outline flex items-center gap-1.5 text-sm">View All<ChevronRight size={13}/></button>
      </div>
      {loading ? <Loading/> : orders.length===0 ? (
        <div className="card text-center py-12">
          <Package size={36} className="mx-auto mb-3 opacity-20" style={{color:'var(--text-muted)'}}/>
          <p className="font-semibold" style={{color:'var(--text-primary)'}}>No orders yet</p>
          <button onClick={()=>navigate('/student/canteens')} className="btn-primary mt-4">Browse Canteens</button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order=>{
            const stepIdx = STATUS_STEPS.indexOf(order.order_status);
            const col = stepColor[order.order_status]||'#6366f1';
            return (
              <div key={order._id} className="card-hover space-y-3" onClick={()=>navigate(`/student/orders/${order._id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold" style={{color:'var(--text-primary)'}}>#{order.order_number}</span>
                      <StatusBadge status={order.order_status}/>
                    </div>
                    <p className="text-sm mt-0.5" style={{color:'var(--text-secondary)'}}>🍽️ {order.canteen_id?.name}</p>
                    <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{order.items?.length} item{order.items?.length!==1?'s':''} · {new Date(order.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg" style={{color:'var(--text-primary)'}}>₹{order.total_amount}</p>
                    <p className="text-xs capitalize" style={{color:'var(--text-muted)'}}>{order.payment_method?.replace(/_/g,' ')}</p>
                  </div>
                </div>
                {order.order_status!=='cancelled' && (
                  <div className="flex items-center gap-1">{STATUS_STEPS.map((s,i)=><div key={s} className="flex-1 h-1.5 rounded-full" style={{background:i<=stepIdx?col:'var(--bg-elevated)'}}/>)}</div>
                )}
                <div className="flex items-center gap-2" onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>navigate(`/student/orders/${order._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{background:'var(--bg-elevated)',color:'var(--text-secondary)',border:'1px solid var(--border-color)'}}><Eye size={11}/>Details</button>
                  {order.order_status==='picked_up' && <>
                    <button onClick={()=>navigate(`/student/canteens/${order.canteen_id?._id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all" style={{border:'1px solid rgba(99,102,241,0.3)'}}><RefreshCw size={11}/>Reorder</button>
                    <button onClick={()=>{
                      const items = order.items?.map(i=>`${i.name||i.menu_item_id?.name} x${i.quantity} = ₹${i.price*i.quantity}`).join('\n');
                      const text = `RECEIPT\nOrder #${order.order_number}\n${new Date(order.createdAt).toLocaleString()}\nCanteen: ${order.canteen_id?.name}\n${items}\nTotal: ₹${order.total_amount}`;
                      const blob = new Blob([text],{type:'text/plain'}); const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href=url; a.download=`receipt-${order.order_number}.txt`; a.click(); URL.revokeObjectURL(url);
                    }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all" style={{border:'1px solid rgba(16,185,129,0.3)'}}><Download size={11}/>Receipt</button>
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────── Wallet ───────────────────────────────── */
const WalletSection = ({ user, updateUser }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const handleTopup = async () => {
    const amt = parseFloat(amount);
    if (!amt||amt<10) { toast.error('Minimum ₹10'); return; }
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed'); return; }
      const { data } = await paymentAPI.walletTopup(amt);
      const rzp = data.data;
      new window.Razorpay({ key:rzp.key, amount:rzp.amount, currency:rzp.currency, name:'Campus Cravings', description:`Add ₹${amt}`, order_id:rzp.razorpay_order_id, prefill:{name:user?.name,email:user?.email}, theme:{color:'#6366f1'},
        handler: async(response) => {
          try { const {data:v} = await paymentAPI.verifyWallet({...response,amount:amt}); updateUser({...user,wallet_balance:v.data.wallet_balance}); toast.success(`₹${amt} added! 🎉`); setAmount(''); }
          catch { toast.error('Verification failed'); }
        }
      }).open();
    } catch { toast.error('Top-up failed'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Wallet</h2><p className="section-desc">Your campus wallet balance and top-up</p></div>
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl" style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)'}}>
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10"/><div className="absolute -right-2 bottom-2 w-24 h-24 rounded-full bg-white/5"/>
        <div className="relative"><p className="text-white/70 text-sm">Available Balance</p><p className="text-5xl font-bold text-white mt-1">₹{user?.wallet_balance||0}</p><p className="text-white/60 text-xs mt-2">Instant checkout at all campus canteens</p></div>
      </div>
      <div className="card space-y-4">
        <h3 className="font-bold text-sm" style={{color:'var(--text-primary)'}}>Add Money</h3>
        <div className="flex flex-wrap gap-2">{QUICK_AMOUNTS.map(a=><button key={a} onClick={()=>setAmount(String(a))} className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${amount===String(a)?'border-indigo-500 bg-indigo-500/10 text-indigo-400':''}`} style={amount!==String(a)?{borderColor:'var(--border-color)',color:'var(--text-secondary)',background:'var(--bg-elevated)'}:{}}>₹{a}</button>)}</div>
        <div className="flex gap-3">
          <input type="number" className="input flex-1" placeholder="Custom amount (min ₹10)" value={amount} onChange={e=>setAmount(e.target.value)} min={10}/>
          <button onClick={handleTopup} disabled={loading||!amount} className="btn-primary shrink-0 flex items-center gap-2"><Plus size={14}/>{loading?'Opening...':'Add Money'}</button>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-xl border" style={{background:'rgba(99,102,241,0.05)',borderColor:'rgba(99,102,241,0.2)'}}>
        <ShieldCheck size={15} className="shrink-0 mt-0.5" style={{color:'#6366f1'}}/><p className="text-sm" style={{color:'var(--text-secondary)'}}>Secured via Razorpay. Refunds for cancelled orders return to wallet within minutes.</p>
      </div>
    </div>
  );
};

/* ─────────────────────── Locations ────────────────────────────── */
const LocationsSection = () => {
  const [saved, setSaved] = useState(()=>{ try{return JSON.parse(localStorage.getItem('pickup_locations'))||[];}catch{return [];} });
  const [custom, setCustom] = useState('');
  const persist = list => { setSaved(list); localStorage.setItem('pickup_locations',JSON.stringify(list)); };
  const toggleDefault = item => { const ex = saved.find(s=>s.id===item.id); persist(ex?saved.filter(s=>s.id!==item.id):[...saved,item]); };
  const addCustom = () => { const t=custom.trim(); if(!t)return; persist([...saved,{id:`c_${Date.now()}`,label:t,icon:'📍'}]); setCustom(''); toast.success('Saved!'); };

  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Pickup Locations</h2><p className="section-desc">Save your frequent campus pickup spots</p></div>
      <div className="card space-y-3">
        <p className="text-sm font-semibold" style={{color:'var(--text-secondary)'}}>Campus Spots</p>
        {DEFAULT_LOCATIONS.map(loc=>{ const active=!!saved.find(s=>s.id===loc.id); return (
          <button key={loc.id} onClick={()=>toggleDefault(loc)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${active?'border-indigo-500 bg-indigo-500/8':''}`} style={!active?{borderColor:'var(--border-color)',background:'var(--bg-elevated)'}:{}}>
            <span className="text-xl">{loc.icon}</span><span className="flex-1 font-medium text-sm" style={{color:'var(--text-primary)'}}>{loc.label}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active?'bg-indigo-500 border-indigo-500':''}`} style={!active?{borderColor:'var(--border-color)'}:{}}>{active&&<Check size={10} className="text-white"/>}</div>
          </button>
        );})}
      </div>
      <div className="card space-y-3">
        <p className="text-sm font-semibold" style={{color:'var(--text-secondary)'}}>Custom Location</p>
        <div className="flex gap-2"><input className="input flex-1" placeholder="e.g. Lab Block A, Gate 2..." value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCustom()}/><button onClick={addCustom} className="btn-primary shrink-0 flex items-center gap-1.5"><Plus size={14}/>Add</button></div>
        {saved.filter(s=>s.id.startsWith('c_')).map(loc=>(
          <div key={loc.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{background:'var(--bg-elevated)',border:'1px solid var(--border-color)'}}>
            <span>📍</span><span className="flex-1 text-sm" style={{color:'var(--text-primary)'}}>{loc.label}</span>
            <button onClick={()=>persist(saved.filter(s=>s.id!==loc.id))} className="text-red-400 hover:text-red-500"><Trash2 size={13}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────── Favorites ────────────────────────────── */
const FavoritesSection = () => {
  const navigate = useNavigate();
  const [favC, setFavC] = useState(()=>{ try{return JSON.parse(localStorage.getItem('fav_canteens'))||[];}catch{return[];} });
  const [favI, setFavI] = useState(()=>{ try{return JSON.parse(localStorage.getItem('fav_items'))||[];}catch{return[];} });
  const remC = id => { const u=favC.filter(c=>c._id!==id); setFavC(u); localStorage.setItem('fav_canteens',JSON.stringify(u)); };
  const remI = id => { const u=favI.filter(i=>i._id!==id); setFavI(u); localStorage.setItem('fav_items',JSON.stringify(u)); };

  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Favorites</h2><p className="section-desc">Saved canteens and food items</p></div>
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Building2 size={15} style={{color:'#6366f1'}}/><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Canteens</p><span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{background:'var(--bg-elevated)',color:'var(--text-muted)'}}>{favC.length}</span></div>
        {favC.length===0 ? <p className="text-sm text-center py-4 cursor-pointer text-indigo-400" onClick={()=>navigate('/student/canteens')}>Browse canteens to add favorites →</p>
          : favC.map(c=><div key={c._id} className="flex items-center gap-3 p-2 rounded-xl" style={{background:'var(--bg-elevated)'}}>
              {c.image?<img src={c.image} className="w-9 h-9 rounded-lg object-cover" alt=""/>:<div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{background:'rgba(99,102,241,0.1)'}}>🍽️</div>}
              <span className="flex-1 font-medium text-sm truncate" style={{color:'var(--text-primary)'}}>{c.name}</span>
              <button onClick={()=>navigate(`/student/canteens/${c._id}`)} className="text-xs text-indigo-400 hover:underline mr-2">Visit</button>
              <button onClick={()=>remC(c._id)} className="text-red-400 hover:text-red-500"><X size={13}/></button>
            </div>)}
      </div>
      <div className="card space-y-3">
        <div className="flex items-center gap-2"><Tag size={15} style={{color:'#f59e0b'}}/><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Food Items</p><span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{background:'var(--bg-elevated)',color:'var(--text-muted)'}}>{favI.length}</span></div>
        {favI.length===0 ? <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>Heart items while browsing menus to save them here</p>
          : favI.map(item=><div key={item._id} className="flex items-center gap-3 p-2 rounded-xl" style={{background:'var(--bg-elevated)'}}>
              {item.image?<img src={item.image} className="w-9 h-9 rounded-lg object-cover" alt=""/>:<div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{background:'rgba(245,158,11,0.1)'}}>🍔</div>}
              <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate" style={{color:'var(--text-primary)'}}>{item.name}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>₹{item.price}</p></div>
              <button onClick={()=>remI(item._id)} className="text-red-400 hover:text-red-500"><X size={13}/></button>
            </div>)}
      </div>
    </div>
  );
};

/* ─────────────────────── Notifications ────────────────────────── */
const NOTIF_DEF = { order_alerts:true, offer_alerts:true, app_updates:false, sound:true };
const NotificationsSection = () => {
  const [prefs, setPrefs] = useState(()=>{ try{return {...NOTIF_DEF,...JSON.parse(localStorage.getItem('notif_prefs'))};}catch{return NOTIF_DEF;} });
  const toggle = key => { const u={...prefs,[key]:!prefs[key]}; setPrefs(u); localStorage.setItem('notif_prefs',JSON.stringify(u)); };
  const items = [
    {key:'order_alerts',icon:BellRing, label:'Order Alerts',  desc:'Notified when your order status changes'},
    {key:'offer_alerts',icon:Tag,      label:'Offer Alerts',  desc:'Canteen promotions and special deals'},
    {key:'app_updates', icon:Smartphone,label:'App Updates', desc:'New features and announcements'},
    {key:'sound',       icon:Bell,     label:'Sound',         desc:'Play notification sounds'},
  ];
  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Notifications</h2><p className="section-desc">Choose what to be notified about</p></div>
      <div className="card divide-y" style={{borderColor:'var(--border-color)'}}>
        {items.map(({key,icon:Icon,label,desc},i)=>(
          <div key={key} className={`flex items-center gap-4 py-4 ${i===0?'pt-0':''} ${i===items.length-1?'pb-0':''}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:prefs[key]?'rgba(99,102,241,0.12)':'var(--bg-elevated)'}}>
              <Icon size={16} style={{color:prefs[key]?'#6366f1':'var(--text-muted)'}}/>
            </div>
            <div className="flex-1"><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{label}</p><p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{desc}</p></div>
            <button onClick={()=>toggle(key)}>{prefs[key]?<ToggleRight size={28} style={{color:'#6366f1'}}/>:<ToggleLeft size={28} style={{color:'var(--text-muted)'}}/>}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────── Settings ─────────────────────────────── */
const SettingsSection = ({ user, logout }) => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ current_password:'', new_password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const handlePw = async e => {
    e.preventDefault();
    if (pwForm.new_password!==pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try { await authAPI.changePassword({current_password:pwForm.current_password,new_password:pwForm.new_password}); toast.success('Password changed!'); setPwForm({current_password:'',new_password:'',confirm:''}); setShowPw(false); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); } finally { setLoading(false); }
  };
  return (
    <div className="space-y-5">
      <div><h2 className="section-title">Settings</h2><p className="section-desc">App preferences and account</p></div>
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{color:'var(--text-muted)'}}>Appearance</p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:'rgba(245,158,11,0.1)'}}>
            {isDark?<Moon size={16} style={{color:'#f59e0b'}}/>:<Sun size={16} style={{color:'#f59e0b'}}/>}
          </div>
          <div className="flex-1"><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{isDark?'Dark Mode':'Light Mode'}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>Toggle app theme</p></div>
          <button onClick={toggleTheme}>{isDark?<ToggleRight size={28} style={{color:'#6366f1'}}/>:<ToggleLeft size={28} style={{color:'var(--text-muted)'}}/>}</button>
        </div>
      </div>
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:'rgba(99,102,241,0.1)'}}><Lock size={16} style={{color:'#6366f1'}}/></div>
            <div><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Change Password</p><p className="text-xs" style={{color:'var(--text-muted)'}}>Update your account password</p></div>
          </div>
          <button onClick={()=>setShowPw(!showPw)} className="btn-outline text-xs">{showPw?'Cancel':'Change'}</button>
        </div>
        {showPw && (
          <form onSubmit={handlePw} className="space-y-3 pt-3 border-t" style={{borderColor:'var(--border-color)'}}>
            {[['current_password','Current Password'],['new_password','New Password'],['confirm','Confirm Password']].map(([k,l])=>(
              <div key={k}><label className="input-label">{l}</label><input type="password" className="input" value={pwForm[k]} onChange={e=>setPwForm({...pwForm,[k]:e.target.value})} required/></div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2"><Save size={14}/>{loading?'Changing...':'Update Password'}</button>
          </form>
        )}
      </div>
      <div className="card p-4 flex items-center gap-4 border" style={{borderColor:'rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.04)'}}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 shrink-0"><LogOut size={16} className="text-red-400"/></div>
        <div className="flex-1"><p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Sign Out</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{user?.email}</p></div>
        <button onClick={()=>{logout();navigate('/login');}} className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border hover:bg-red-500/10 transition-colors" style={{borderColor:'rgba(239,68,68,0.3)'}}>Logout</button>
      </div>
    </div>
  );
};

/* ─────────────────────── Root ──────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="page-title">My Profile</h1><p className="page-subtitle">Manage your campus account</p></div>
      <div className="flex gap-6 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-24 card p-2 gap-0.5">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl" style={{background:'var(--bg-elevated)'}}>
            {user?.avatar?<img src={user.avatar} className="w-9 h-9 rounded-xl object-cover shrink-0" alt=""/>:<div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:'linear-gradient(135deg,#6366f1,#a855f7)'}}>{user?.name?.[0]?.toUpperCase()||'?'}</div>}
            <div className="min-w-0"><p className="text-sm font-bold truncate" style={{color:'var(--text-primary)'}}>{user?.name}</p><p className="text-xs truncate" style={{color:'var(--text-muted)'}}>₹{user?.wallet_balance||0}</p></div>
          </div>
          {TABS.map(({id,label,icon:Icon,color})=>(
            <button key={id} onClick={()=>setActiveTab(id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full"
              style={activeTab===id?{background:`linear-gradient(135deg,${color}cc,${color}88)`,color:'#fff',boxShadow:`0 4px 12px ${color}40`}:{color:'var(--text-secondary)'}}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background:activeTab===id?'rgba(255,255,255,0.2)':'var(--bg-elevated)'}}>
                <Icon size={14} style={{color:activeTab===id?'#fff':color}}/>
              </div>{label}
            </button>
          ))}
        </aside>
        <div className="flex-1 min-w-0 space-y-5">
          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:hidden">
            {TABS.map(({id,label,icon:Icon,color})=>(
              <button key={id} onClick={()=>setActiveTab(id)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={activeTab===id?{background:`${color}20`,color,border:`1.5px solid ${color}60`}:{background:'var(--bg-elevated)',color:'var(--text-secondary)',border:'1px solid var(--border-color)'}}>
                <Icon size={13}/><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          {activeTab==='profile'       && <PersonalInfoSection user={user} updateUser={updateUser}/>}
          {activeTab==='orders'        && <OrdersSection/>}
          {activeTab==='wallet'        && <WalletSection user={user} updateUser={updateUser}/>}
          {activeTab==='locations'     && <LocationsSection/>}
          {activeTab==='favorites'     && <FavoritesSection/>}
          {activeTab==='notifications' && <NotificationsSection/>}
          {activeTab==='settings'      && <SettingsSection user={user} logout={logout}/>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

