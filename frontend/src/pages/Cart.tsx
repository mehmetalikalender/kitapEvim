import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Cart = () => {
    const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            alert("Sipariş verebilmek için lütfen giriş yapın.");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const orderPayload = {
                items: cartItems.map(item => ({ bookId: item.bookId, quantity: item.quantity }))
            };

            // GERÇEK BACKEND İSTEĞİ (Artık simülasyon değil!)
            await api.post('/orders', orderPayload);

            setSuccessMsg("🎉 Siparişiniz başarıyla alındı! Kitaplarınız en kısa sürede kargoya verilecektir.");
            clearCart();
        } catch (error: any) {
            // Backend'den gelen stok yetersiz vb. hataları ekrana bas
            alert(error.response?.data?.message || "Sipariş oluşturulurken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (successMsg) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2 style={{ color: '#27ae60' }}>{successMsg}</h2>
                <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    Alışverişe Dön
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Sepetiniz şu an boş 🛒</h2>
                <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Hemen kitap keşfetmeye başlayın!</Link>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: '800px' }}>
            <h2 style={{ marginBottom: '20px' }}>Alışveriş Sepetim</h2>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {cartItems.map((item) => (
                    <div key={item.bookId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src={`http://localhost:3000${item.coverImageUrl}`} alt={item.title} style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                                <h4 style={{ margin: 0, color: '#2c3e50' }}>{item.title}</h4>
                                <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Adet: {item.quantity} x ₺{Number(item.price).toFixed(2)}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <strong style={{ color: '#e67e22', fontSize: '1.1rem' }}>₺{(item.price * item.quantity).toFixed(2)}</strong>
                            <button onClick={() => removeFromCart(item.bookId)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
                        </div>
                    </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #2c3e50' }}>
                    <h3 style={{ margin: 0 }}>Toplam Tutar:</h3>
                    <h2 style={{ margin: 0, color: '#27ae60' }}>₺{getCartTotal().toFixed(2)}</h2>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla (Satın Al)'}
                </button>
            </div>
        </div>
    );
};

export default Cart;