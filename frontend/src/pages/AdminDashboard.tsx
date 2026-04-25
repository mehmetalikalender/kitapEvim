import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- TİP TANIMLAMALARI ---
interface Book {
    id: string; title: string; author: string; price: number; stock: number; isbn: string; coverImageUrl?: string;
}

interface ChartData {
    name: string; satis: number;
}

// YENİ: Kullanıcı Tipi
interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

const AdminDashboard = () => {
    const { user: loggedInUser } = useAuth();

    // --- STATE YÖNETİMİ ---
    // YENİ: activeTab için 'users' seçeneği eklendi
    const [activeTab, setActiveTab] = useState<'dashboard' | 'books' | 'users'>('dashboard');

    const [books, setBooks] = useState<Book[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]); // YENİ: Kullanıcı listesi

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Kitap Form State'leri
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', author: '', price: '', stock: '', isbn: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // YENİ: Kullanıcı Form State'leri
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userFormData, setUserFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'CUSTOMER' });

    // --- EFFECT ---
    useEffect(() => {
        fetchBooks();
        fetchSalesStats();
        fetchUsers(); // YENİ: Sayfa yüklenince kullanıcıları da çek
    }, []);

    // --- API İSTEKLERİ (KİTAP & DASHBOARD) ---
    const fetchBooks = async () => {
        try { const response = await api.get('/books'); setBooks(response.data); } catch (error) { console.error(error); }
    };

    const fetchSalesStats = async () => {
        try { const response = await api.get('/orders/stats/monthly-sales'); setChartData(response.data); } catch (error) { console.error(error); }
    };

    const handleResetSystem = async () => {
        if (!window.confirm("DİKKAT: Veritabanı temizlenecek ve altın veriler yüklenecek. Emin misiniz?")) return;
        setLoading(true); setMessage(null);
        try {
            const response = await api.post('/seeder/reset');
            setMessage({ text: response.data.message, type: 'success' });
            await fetchBooks(); await fetchSalesStats(); await fetchUsers();
        } catch (error) { setMessage({ text: 'Sıfırlama işlemi başarısız.', type: 'error' }); }
        finally { setLoading(false); }
    };

    // --- KİTAP İŞLEMLERİ ---
    const handleDeleteBook = async (id: string) => {
        if (!window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) return;
        try { await api.delete(`/books/${id}`); setMessage({ text: 'Kitap silindi', type: 'success' }); fetchBooks(); }
        catch (error) { setMessage({ text: 'Silme başarısız.', type: 'error' }); }
    };

    const handleBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title); data.append('author', formData.author);
        data.append('price', formData.price); data.append('stock', formData.stock); data.append('isbn', formData.isbn);
        if (selectedFile) data.append('coverImage', selectedFile);

        try {
            if (isEditing && currentBookId) {
                await api.patch(`/books/${currentBookId}`, data); setMessage({ text: 'Kitap güncellendi', type: 'success' });
            } else {
                await api.post('/books', data); setMessage({ text: 'Kitap eklendi', type: 'success' });
            }
            resetBookForm(); fetchBooks();
        } catch (error) { setMessage({ text: 'İşlem başarısız.', type: 'error' }); }
    };

    const handleEditBookClick = (book: Book) => {
        setIsEditing(true); setCurrentBookId(book.id);
        setFormData({ title: book.title, author: book.author, price: book.price.toString(), stock: book.stock.toString(), isbn: book.isbn });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetBookForm = () => { setIsEditing(false); setCurrentBookId(null); setFormData({ title: '', author: '', price: '', stock: '', isbn: '' }); setSelectedFile(null); };

    // --- YENİ: KULLANICI İŞLEMLERİ ---
    const fetchUsers = async () => {
        try {
            const response = await api.get('/users'); // Backend'de GET /users ucu olmalı
            setUsers(response.data);
        } catch (error) {
            console.error("Kullanıcılar yüklenemedi", error);
        }
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditingUser && currentUserId) {
                // Backend'de PATCH /users/:id ucu olmalı
                await api.patch(`/users/${currentUserId}`, userFormData);
                setMessage({ text: 'Kullanıcı güncellendi', type: 'success' });
            } else {
                // Backend'de POST /users ucu olmalı (veya yetkili register)
                await api.post('/users', userFormData);
                setMessage({ text: 'Kullanıcı eklendi', type: 'success' });
            }
            resetUserForm();
            fetchUsers();
        } catch (error) {
            setMessage({ text: 'Kullanıcı işlemi başarısız. (Backend rotalarını kontrol edin)', type: 'error' });
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (id === loggedInUser?.id) {
            alert("Kendi hesabınızı silemezsiniz!");
            return;
        }
        if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/users/${id}`); // Backend'de DELETE /users/:id ucu olmalı
            setMessage({ text: 'Kullanıcı başarıyla silindi', type: 'success' });
            fetchUsers();
        } catch (error) {
            setMessage({ text: 'Silme işlemi başarısız.', type: 'error' });
        }
    };

    const handleEditUserClick = (u: UserData) => {
        setIsEditingUser(true);
        setCurrentUserId(u.id);
        // Şifreyi boş bırakıyoruz (sadece değiştirmek isterse doldursun diye)
        setUserFormData({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetUserForm = () => {
        setIsEditingUser(false); setCurrentUserId(null);
        setUserFormData({ firstName: '', lastName: '', email: '', password: '', role: 'CUSTOMER' });
    };


    return (
        <div className="admin-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

            {/* Üst Başlık ve Reset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50' }}>Yönetim Paneli</h2>
                <button onClick={handleResetSystem} disabled={loading} className="btn-reset">
                    {loading ? '⏳ İşlem Yapılıyor...' : '⚡ Sistemi Sıfırla (Golden State)'}
                </button>
            </div>

            {message && (
                <div className={`alert ${message.type}`} style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', border: '1px solid' }}>
                    {message.text}
                </div>
            )}

            {/* SEKME SEÇİMİ (TABS) */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #ecf0f1', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('dashboard')}
                    style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'dashboard' ? '4px solid #3498db' : 'none', color: activeTab === 'dashboard' ? '#3498db' : '#7f8c8d', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                    📊 Satış Grafiği
                </button>
                <button
                    onClick={() => setActiveTab('books')}
                    style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'books' ? '4px solid #3498db' : 'none', color: activeTab === 'books' ? '#3498db' : '#7f8c8d', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                    📚 Kitap Yönetimi
                </button>
                {/* YENİ: Kullanıcılar Sekme Butonu */}
                <button
                    onClick={() => setActiveTab('users')}
                    style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'users' ? '4px solid #3498db' : 'none', color: activeTab === 'users' ? '#3498db' : '#7f8c8d', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                    👥 Kullanıcı Yönetimi
                </button>
            </div>

            {/* 1. GÖSTERGE PANELİ */}
            {activeTab === 'dashboard' && (
                <div className="admin-card" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: '#34495e', marginBottom: '2rem' }}>Aylık Satışlar</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#95a5a6' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#95a5a6' }} tickFormatter={(val) => `₺${val}`} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Toplam Gelir']} />
                                <Line type="monotone" dataKey="satis" stroke="#2ecc71" strokeWidth={4} dot={{ r: 6, fill: '#2ecc71', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* 2. KİTAP YÖNETİMİ */}
            {activeTab === 'books' && (
                <>
                    <div className="admin-card" style={{ marginBottom: '30px' }}>
                        <h3>{isEditing ? '📘 Kitabı Düzenle' : '➕ Yeni Kitap Ekle'}</h3>
                        <form onSubmit={handleBookSubmit} className="admin-form">
                            {/* Kitap form inputları aynı kalıyor */}
                            <input type="text" placeholder="Kitap Başlığı" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            <input type="text" placeholder="Yazar Adı" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} required />
                            <input type="number" placeholder="Fiyat (₺)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required step="0.01" />
                            <input type="number" placeholder="Stok Miktarı" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                            <input type="text" placeholder="ISBN" value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} required />
                            <input type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} accept="image/*" />
                            <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2' }}>
                                <button type="submit" className="btn-save" style={{ flex: 1 }}>{isEditing ? 'Bilgileri Güncelle' : 'Kitabı Kaydet'}</button>
                                {isEditing && <button type="button" onClick={resetBookForm} className="btn-cancel" style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#bdc3c7', color: 'white', cursor: 'pointer' }}>Vazgeç</button>}
                            </div>
                        </form>
                    </div>

                    <div className="admin-card">
                        <h3>Mevcut Envanter ({books.length} Kitap)</h3>
                        <table className="admin-table">
                            <thead><tr><th>Kitap Bilgisi</th><th>Fiyat</th><th>Stok Durumu</th><th>İşlemler</th></tr></thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id}>
                                        <td><div style={{ fontWeight: 'bold' }}>{book.title}</div><div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{book.author}</div></td>
                                        <td style={{ fontWeight: '800', color: '#e67e22' }}>₺{Number(book.price).toFixed(2)}</td>
                                        <td><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: book.stock < 10 ? '#fff3cd' : '#d4edda', color: book.stock < 10 ? '#856404' : '#155724' }}>{book.stock} Adet</span></td>
                                        <td>
                                            <button onClick={() => handleEditBookClick(book)} className="btn-edit">Düzenle</button>
                                            <button onClick={() => handleDeleteBook(book.id)} className="btn-delete">Sil</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* 3. YENİ: KULLANICI YÖNETİMİ */}
            {activeTab === 'users' && (
                <>
                    {/* Kullanıcı Ekleme / Düzenleme Formu */}
                    <div className="admin-card" style={{ marginBottom: '30px' }}>
                        <h3>{isEditingUser ? '👤 Kullanıcıyı Düzenle' : '➕ Yeni Kullanıcı Ekle'}</h3>
                        <form onSubmit={handleUserSubmit} className="admin-form">
                            <input type="text" placeholder="Ad" value={userFormData.firstName} onChange={e => setUserFormData({ ...userFormData, firstName: e.target.value })} required />
                            <input type="text" placeholder="Soyad" value={userFormData.lastName} onChange={e => setUserFormData({ ...userFormData, lastName: e.target.value })} required />
                            <input type="email" placeholder="E-posta Adresi" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} required />

                            {/* Düzenleme yaparken şifre zorunlu değildir */}
                            <input
                                type="password"
                                placeholder={isEditingUser ? "Şifre (Değiştirmek istemiyorsanız boş bırakın)" : "Şifre"}
                                value={userFormData.password}
                                onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                                required={!isEditingUser}
                            />

                            <select
                                value={userFormData.role}
                                onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="CUSTOMER">Müşteri (CUSTOMER)</option>
                                <option value="ADMIN">Yönetici (ADMIN)</option>
                            </select>

                            <div style={{ display: 'flex', gap: '10px', gridColumn: 'span 2' }}>
                                <button type="submit" className="btn-save" style={{ flex: 1, backgroundColor: '#3498db' }}>
                                    {isEditingUser ? 'Kullanıcıyı Güncelle' : 'Kullanıcıyı Kaydet'}
                                </button>
                                {isEditingUser && (
                                    <button type="button" onClick={resetUserForm} className="btn-cancel" style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#bdc3c7', color: 'white', cursor: 'pointer' }}>
                                        Vazgeç
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Kullanıcı Listesi Tablosu */}
                    <div className="admin-card">
                        <h3>Kayıtlı Kullanıcılar ({users.length} Kişi)</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>E-posta</th>
                                    <th>Rol</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 'bold' }}>{u.firstName} {u.lastName}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                                backgroundColor: u.role === 'SUPERADMIN' ? '#cce5ff' : u.role === 'ADMIN' ? '#d4edda' : '#f8d7da',
                                                color: u.role === 'SUPERADMIN' ? '#004085' : u.role === 'ADMIN' ? '#155724' : '#721c24'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Superadmin rolü değiştirilemesin/silinemesin diye ufak bir koruma */}
                                            {u.role !== 'SUPERADMIN' && (
                                                <>
                                                    <button onClick={() => handleEditUserClick(u)} className="btn-edit" style={{ backgroundColor: '#f39c12' }}>Düzenle</button>
                                                    <button onClick={() => handleDeleteUser(u.id)} className="btn-delete">Sil</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

        </div>
    );
};

export default AdminDashboard;