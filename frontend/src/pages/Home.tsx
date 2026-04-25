import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    coverImageUrl: string;
    stock: number;
}

const Home = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // YENİ: Arama çubuğuna yazılan metni tutacak State
    const [searchTerm, setSearchTerm] = useState('');

    const { addToCart } = useCart();

    const handleAddToCart = (book: Book) => {
        addToCart({
            bookId: book.id,
            title: book.title,
            price: Number(book.price),
            coverImageUrl: book.coverImageUrl,
            quantity: 1
        });
        alert(`"${book.title}" sepete eklendi! 🛒`);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Kitaplar yüklenirken hata oluştu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // YENİ: Kitapları arama terimine göre filtreleyen mantık
    // Hem kitap adında (title) hem de yazar adında (author) arama yapar
    const filteredBooks = books.filter((book) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return <div className="page-container" style={{ textAlign: 'center' }}>Kitaplar Yükleniyor... 📚</div>;
    }

    return (
        <div className="page-container">
            <h1 style={{ marginBottom: '1rem', textAlign: 'center', color: '#2c3e50' }}>Vitrindeki Kitaplar</h1>

            {/* YENİ: ARAMA ÇUBUĞU (SEARCH BAR) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Kitap adı veya yazar ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '12px 20px',
                        fontSize: '1rem',
                        borderRadius: '25px',
                        border: '2px solid #3498db',
                        outline: 'none',
                        boxShadow: '0 4px 6px rgba(52, 152, 219, 0.1)'
                    }}
                />
            </div>

            {/* Arama sonucunda kitap bulunamazsa gösterilecek mesaj */}
            {filteredBooks.length === 0 && (
                <div style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '2rem' }}>
                    <h3>"{searchTerm}" araması için sonuç bulunamadı.</h3>
                    <p>Lütfen farklı bir kelime ile tekrar deneyin.</p>
                </div>
            )}

            {/* Kitap Grid (Izgara) Yapısı */}
            <div className="book-grid">
                {/* YENİ: Sadece 'books' değil, filtrelenmiş 'filteredBooks' dizisini dönüyoruz */}
                {filteredBooks.map((book) => (
                    <div key={book.id} className="book-card">
                        <div className="book-image-container">
                            <img
                                src={`http://localhost:3000${book.coverImageUrl}`}
                                alt={book.title}
                                className="book-image"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x220?text=Kapak+Yok';
                                }}
                            />
                        </div>
                        <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                            <div className="book-footer">
                                <span className="book-price">₺{Number(book.price).toFixed(2)}</span>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleAddToCart(book)}
                                >
                                    Sepete Ekle
                                </button>
                            </div>
                            <p className="book-stock" style={{ color: book.stock < 10 ? '#e74c3c' : '#27ae60' }}>
                                {book.stock < 10 ? `Sadece ${book.stock} adet kaldı!` : 'Stokta var'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;