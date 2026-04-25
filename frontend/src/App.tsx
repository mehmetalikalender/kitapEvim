import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart'; // SEPET SAYFASINI IMPORT ETTİK
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext'; // SEPET CONTEXT'İNİ IMPORT ETTİK
import './index.css';
import Register from './pages/Register';

function App() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { getCartCount } = useCart(); // SEPETTEKİ ÜRÜN SAYISINI ALIYORUZ
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#2c3e50', color: 'white', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📚 KitapEvim</Link>

        <div style={{ flexGrow: 1 }}></div> {/* Boşluk bırakmak için */}

        {/* SEPET İKONU VE LİNKİ EKLENDİ */}
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', marginRight: '15px' }}>
          🛒 Sepet
          {getCartCount() > 0 && (
            <span style={{ backgroundColor: '#e74c3c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {getCartCount()}
            </span>
          )}
        </Link>

        {/* Herkese görünen linkler */}
        {!isAuthenticated && <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Giriş Yap</Link>}

        {/* Sadece Adminlere görünen linkler */}
        {isAdmin && <Link to="/admin" style={{ color: 'white', textDecoration: 'none', backgroundColor: '#e74c3c', padding: '5px 10px', borderRadius: '4px' }}>⚙️ Admin Paneli</Link>}

        {/* Giriş yapmış kullanıcı menüsü */}
        {isAuthenticated && (
          <>
            <span style={{ fontSize: '0.9rem', color: '#bdc3c7' }}>Merhaba, {user?.firstName}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
              Çıkış
            </button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* SEPET ROTASI EKLENDİ */}
        <Route path="/cart" element={<Cart />} />

        {/* ADMİN PANELİ KORUMA ALTINDA */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;