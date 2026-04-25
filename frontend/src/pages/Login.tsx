import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Backend'deki giriş ucuna (endpoint) istek atıyoruz
            const response = await api.post('/auth/login', { email, password });

            // Backend'den gelen cevabı parçalıyoruz (access_token ve user bilgileri)
            const { access_token, user } = response.data;

            // AuthContext'teki login fonksiyonunu çağırıp sistemi bilgilendiriyoruz
            login(user, access_token);

            // Rolüne göre yönlendirme yapıyoruz
            if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) {
                navigate('/admin'); // Yöneticiyse admin paneline
            } else {
                navigate('/'); // Müşteriyse ana sayfaya
            }
        } catch (err: any) {
            // Hata durumunda (yanlış şifre vb.) mesajı ekrana yansıt
            setError(err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' }}>Giriş Yap</h2>

                {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Şifre:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: '#2c3e50',
                            color: 'white',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d' }}>
                    Hesabınız yok mu?{' '}
                    <Link to="/register" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
                        Yeni Hesap Oluşturun
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;