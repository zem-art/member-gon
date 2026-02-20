import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../services/api';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePageMeta } from '../../hooks/usePageMeta';
import { IconRenderer } from '../icons/IconRenderer';
import type { ProductDetail, ProductVariant, CartItem } from '../../types';

// ─── Color mapping for visual chips ─────────────────────────────
const COLOR_MAP: Record<string, string> = {
    // Mock colors
    Black: '#1a1a1a',
    White: '#f5f5f5',
    Navy: '#1e3a5f',
    Maroon: '#800020',
    Olive: '#6b7c3f',
    'Dusty Pink': '#d4a0a0',
    Cream: '#f5e6c8',
    Grey: '#8a8a8a',
    // Real API colors
    AVOCADO: '#568203',
    CAVIAR: '#292929',
    SILVER: '#c0c0c0',
    'BLUE INDIGO': '#3f51b5',
    BLACK: '#1a1a1a',
    WHITE: '#f5f5f5',
    NAVY: '#1e3a5f',
    MAROON: '#800020',
    GREY: '#8a8a8a',
    CREAM: '#f5e6c8',
    OLIVE: '#6b7c3f',
    DUSTY: '#d4a0a0',
    PINK: '#e91e8c',
    RED: '#e53935',
    GREEN: '#43a047',
    BROWN: '#795548',
    BEIGE: '#d4be8d',
    ARMY: '#4b5320',
    MOCCA: '#7b5b3a',
    BURGUNDY: '#800020',
    MUSTARD: '#c99700',
    SAGE: '#9caf88',
    LILAC: '#c8a2c8',
    PEACH: '#ffb07c',
    CORAL: '#ff7f50',
    MINT: '#98ff98',
    CHARCOAL: '#36454f',
    TEAL: '#008080',
    CARAMEL: '#a0522d',
    DARK: '#2d2d2d',
};

/** Get hex color for a color name, with a deterministic fallback */
function getColorHex(name: string): string {
    // Direct match
    if (COLOR_MAP[name]) return COLOR_MAP[name];
    // Case-insensitive match
    const upper = name.toUpperCase();
    const found = Object.entries(COLOR_MAP).find(([k]) => k.toUpperCase() === upper);
    if (found) return found[1];
    // Deterministic hash fallback — generate a pastel-ish color
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 45%, 55%)`;
}

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
                    setError('Product not found');
                }
            })
            .catch(() => setError('Failed to load product'))
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
            `${product.name_product} (${selectedVariant.color}/${selectedVariant.size}) x${qty} added to cart!`,
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
            showToast('Product link copied! 📋');
        } catch {
            showToast('Failed to copy link');
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
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <IconRenderer name="LuCircleAlert" className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">{error || 'Product not found'}</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline"
                >
                    ← Back to home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto overflow-hidden">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium text-sm md:text-base"
            >
                <IconRenderer name="LuChevronLeft" className="w-4 h-4" />
                Back
            </button>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                {/* ─── Image Gallery ──────────────────────────────── */}
                <div className="space-y-3 min-w-0">
                    <div className="aspect-[4/5] md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 border dark:border-gray-700">
                        <img
                            src={product.images[activeImage]}
                            alt={product.name_product}
                            className="w-full h-full object-cover transition-all duration-300"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden border-2 transition shrink-0 ${activeImage === i
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
                                title="Share product"
                                className="p-2.5 rounded-xl border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 ml-4"
                            >
                                <IconRenderer name="LuShare2" className="w-5 h-5" />
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
                            Color: <span className="text-gray-400 font-normal">{selectedColor}</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableColors.map((color) => {
                                const hex = getColorHex(color);
                                const isActive = selectedColor === color;
                                const isLight = ['WHITE', 'CREAM', 'SILVER', 'BEIGE', 'MINT', 'PEACH'].includes(color.toUpperCase());
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
                                            <IconRenderer name="LuCheck" className={`absolute inset-0 m-auto w-5 h-5 ${isLight ? 'text-gray-800' : 'text-white'}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Size Selector ──────────────────────────── */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Size
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
                                ? `In stock: ${selectedVariant.stock}`
                                : selectedVariant.stock > 0
                                    ? `Only ${selectedVariant.stock} left!`
                                    : 'Out of stock'}
                        </p>
                    )}

                    <hr className="dark:border-gray-800" />

                    {/* ─── Quantity + Add to Cart ─────────────────── */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 border dark:border-gray-700">
                            <button
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                disabled={isOutOfStock || qty <= 1}
                                className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 text-gray-600 dark:text-gray-300"
                            >
                                <IconRenderer name="LuMinus" className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-4 text-center">{qty}</span>
                            <button
                                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                                disabled={isOutOfStock || qty >= maxQty}
                                className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 text-gray-600 dark:text-gray-300"
                            >
                                <IconRenderer name="LuPlus" className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || isOutOfStock}
                            className="cursor-pointer flex-1 bg-blue-600 capitalize text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <IconRenderer name="LuShoppingCart" className="w-5 h-5" />
                            {!selectedVariant
                                ? 'select variant'
                                : isOutOfStock
                                    ? 'out of stock'
                                    : 'add to cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
