import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Loading from './components/common/Loading';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentLayout from './layouts/StudentLayout';
import HomePage from './pages/student/HomePage';
import CanteensPage from './pages/student/CanteensPage';
import CanteenDetailPage from './pages/student/CanteenDetailPage';
import CartPage from './pages/student/CartPage';
import CheckoutPage from './pages/student/CheckoutPage';
import OrdersPage from './pages/student/OrdersPage';
import OrderDetailPage from './pages/student/OrderDetailPage';
import ProfilePage from './pages/student/ProfilePage';
import WalletPage from './pages/student/WalletPage';

// Owner/Staff Pages
import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/owner/DashboardPage';
import MenuManagePage from './pages/owner/MenuManagePage';
import OwnerOrdersPage from './pages/owner/OrdersPage';
import CanteenProfilePage from './pages/owner/CanteenProfilePage';
import EarningsPage from './pages/owner/EarningsPage';
import StaffPage from './pages/owner/StaffPage';
import QRVerifyPage from './pages/owner/QRVerifyPage';

// Staff Pages
import StaffLayout from './layouts/StaffLayout';
import StaffMenuPage from './pages/staff/MenuPage';
import StaffQRVerifyPage from './pages/staff/QRVerifyPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminUsers from './pages/admin/UsersPage';
import AdminCanteens from './pages/admin/CanteensPage';
import AdminUniversities from './pages/admin/UniversitiesPage';
import AdminAds from './pages/admin/AdsPage';

const AppRoutes = () => {
  const { initialLoading, user } = useAuth();
  if (initialLoading) return <Loading fullScreen />;

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <PrivateRoute roles={['student']}>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomePage />} />
          <Route path="canteens" element={<CanteensPage />} />
          <Route path="canteens/:id" element={<CanteenDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        {/* Owner */}
        <Route
          path="/owner"
          element={
            <PrivateRoute roles={['owner']}>
              <OwnerLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="menu" element={<MenuManagePage />} />
          <Route path="orders" element={<OwnerOrdersPage />} />
          <Route path="profile" element={<CanteenProfilePage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="qr-verify" element={<QRVerifyPage />} />
        </Route>

        {/* Staff */}
        <Route
          path="/staff"
          element={
            <PrivateRoute roles={['staff']}>
              <StaffLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OwnerOrdersPage />} />
          <Route path="qr-verify" element={<StaffQRVerifyPage />} />
          <Route path="menu" element={<StaffMenuPage />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="canteens" element={<AdminCanteens />} />
          <Route path="universities" element={<AdminUniversities />} />
          <Route path="ads" element={<AdminAds />} />
        </Route>

        {/* Root path - redirect based on user role */}
        <Route path="/" element={user ? (
          user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
          user.role === 'owner' ? <Navigate to="/owner/dashboard" replace /> :
          user.role === 'staff' ? <Navigate to="/staff/orders" replace /> :
          <Navigate to="/student/home" replace />
        ) : (
          <Navigate to="/login" replace />
        )} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/student/home' : '/login'} replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <AppRoutes />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
