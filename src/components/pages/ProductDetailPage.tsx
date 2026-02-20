import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../services/api';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePageMeta } from '../../hooks/usePageMeta';
import type { ProductDetail, ProductVariant, CartItem } from '../../types';

// ─── Color mapping for visual chips ─────────────────────────────
const COLOR_MAP: Record<string, string> = {
    Black: '#1a1a1a',
    White: '#f5f5f5',
    Navy: '#1e3a5f',
    Maroon: '#800020',
    Olive: '#6b7c3f',
    'Dusty Pink': '#d4a0a0',
    Cream: '#f5e6c8',
    Grey: '#8a8a8a',
};

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const addToCart = useCartStore((s) => s.addToCart);
    const showToast = useUIStore((s) => s.showToast);

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    // Fetch product detail
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        fetchProductById(id)
            .then((data) => {
                if (data) {
                    setProduct(data);
                    // Auto-select first available color
                    const colors = [...new Set(data.variants.map((v) => v.color))];
                    if (colors.length > 0) setSelectedColor(colors[0]);
                } else {
                    setError('Produk tidak ditemukan');
                }
            })
            .catch(() => setError('Gagal memuat produk'))
            .finally(() => setLoading(false));
    }, [id]);

    // Derived data
    const availableColors = useMemo(() => {
        if (!product) return [];
        return [...new Set(product.variants.map((v) => v.color))];
    }, [product]);

    const availableSizes = useMemo(() => {
        if (!product || !selectedColor) return [];
        return product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size);
    }, [product, selectedColor]);

    const selectedVariant: ProductVariant | null = useMemo(() => {
        if (!product || !selectedColor || !selectedSize) return null;
        return (
            product.variants.find(
                (v) => v.color === selectedColor && v.size === selectedSize,
            ) || null
        );
    }, [product, selectedColor, selectedSize]);

    // When color changes, auto-select first available size
    useEffect(() => {
        if (availableSizes.length > 0) {
            setSelectedSize(availableSizes[0]);
        } else {
            setSelectedSize(null);
        }
        setQty(1);
    }, [selectedColor, availableSizes.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddToCart = () => {
        if (!product || !selectedVariant) return;
        const cartItem: CartItem = {
            product_id: product._id,
            variant_sku: selectedVariant.sku,
            name_product: product.name_product,
            thumbnail: product.thumbnail,
            color: selectedVariant.color,
            size: selectedVariant.size,
            price: selectedVariant.price,
            qty,
        };
        addToCart(cartItem);
        showToast(
            `${product.name_product} (${selectedVariant.color}/${selectedVariant.size}) x${qty} ditambahkan ke keranjang!`,
        );
    };

    const handleShare = async () => {
        if (!product) return;
        const url = window.location.href;
        const text = `${product.name_product} — Rp ${product.price_min.toLocaleString('id-ID')}${product.price_min !== product.price_max ? ` - ${product.price_max.toLocaleString('id-ID')}` : ''}`;

        // Try native Web Share API (mobile + some desktops)
        if (navigator.share) {
            try {
                await navigator.share({ title: product.name_product, text, url });
                return;
            } catch {
                // User cancelled or API failed — fall through to clipboard
            }
        }

        // Fallback: copy link to clipboard
        try {
            await navigator.clipboard.writeText(url);
            showToast('Link produk berhasil disalin! 📋');
        } catch {
            showToast('Gagal menyalin link');
        }
    };

    const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;
    const maxQty = selectedVariant ? selectedVariant.stock : 1;

    // Dynamic SEO
    usePageMeta({
        title: product?.name_product,
        description: product?.description,
    });

    // ─── Loading state ──────────────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="space-y-4">
                        <div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-8 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-6 w-1/3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-24 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        <div className="h-12 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error / not found ──────────────────────────────────────
    if (error || !product) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">{error || 'Produk tidak ditemukan'}</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                >
                    ← Kembali ke beranda
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition font-medium"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
            </button>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* ─── Image Gallery ──────────────────────────────── */}
                <div className="space-y-4">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                        <img
                            src={product.images[activeImage]}
                            alt={product.name_product}
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${activeImage === i
                                        ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── Product Info ───────────────────────────────── */}
                <div className="space-y-6">
                    {/* Brand & Name + Share */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    {product.brand}
                                </span>
                                <h1 className="text-2xl md:text-3xl font-bold mt-1 leading-tight">
                                    {product.name_product}
                                </h1>
                            </div>
                            <button
                                onClick={handleShare}
                                title="Bagikan produk"
                                className="p-2.5 rounded-xl border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 ml-4"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedVariant
                            ? `Rp ${selectedVariant.price.toLocaleString('id-ID')}`
                            : `Rp ${product.price_min.toLocaleString('id-ID')} - ${product.price_max.toLocaleString('id-ID')}`}
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {product.description}
                    </p>

                    <hr className="dark:border-gray-800" />

                    {/* ─── Color Selector ─────────────────────────── */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Warna: <span className="text-gray-400 font-normal">{selectedColor}</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map((color) => {
                                const hex = COLOR_MAP[color] || '#888';
                                const isActive = selectedColor === color;
                                return (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        title={color}
                                        className={`w-10 h-10 rounded-full border-2 transition-all relative ${isActive
                                            ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/50 scale-110'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                        style={{ backgroundColor: hex }}
                                    >
                                        {isActive && (
                                            <svg
                                                className="absolute inset-0 m-auto w-5 h-5"
                                                fill="none"
                                                stroke={color === 'White' || color === 'Cream' ? '#333' : '#fff'}
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Size Selector ──────────────────────────── */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Ukuran
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map((size) => {
                                const variant = product.variants.find(
                                    (v) => v.color === selectedColor && v.size === size,
                                );
                                const outOfStock = !variant || variant.stock <= 0;
                                const isActive = selectedSize === size;
                                return (
                                    <button
                                        key={size}
                                        onClick={() => !outOfStock && setSelectedSize(size)}
                                        disabled={outOfStock}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${isActive
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                                            : outOfStock
                                                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed line-through'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stock info */}
                    {selectedVariant && (
                        <p className={`text-xs font-medium ${selectedVariant.stock > 5
                            ? 'text-green-600 dark:text-green-400'
                            : selectedVariant.stock > 0
                                ? 'text-orange-500'
                                : 'text-red-500'
                            }`}>
                            {selectedVariant.stock > 5
                                ? `Stok tersedia: ${selectedVariant.stock}`
                                : selectedVariant.stock > 0
                                    ? `Sisa ${selectedVariant.stock} lagi!`
                                    : 'Stok habis'}
                        </p>
                    )}

                    <hr className="dark:border-gray-800" />

                    {/* ─── Quantity + Add to Cart ─────────────────── */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                disabled={qty <= 1}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                            >
                                −
                            </button>
                            <span className="w-10 h-10 flex items-center justify-center text-sm font-bold border-x dark:border-gray-700">
                                {qty}
                            </span>
                            <button
                                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                                disabled={qty >= maxQty}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || isOutOfStock}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            {!selectedVariant
                                ? 'Pilih Varian'
                                : isOutOfStock
                                    ? 'Stok Habis'
                                    : 'Tambah ke Keranjang'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
