import { useState, useRef } from 'react';
import ProductCard from '../features/ProductCard';
import ProductCardSkeleton from '../features/ProductCardSkeleton';
import { useInfiniteProducts } from '../../hooks/useInfiniteProducts';
import { IconRenderer } from '../icons/IconRenderer';


export default function HomePage() {
    const { products, loading, initialLoading, hasMore, error, search, retry, handleSearch, sentinelRef } =
        useInfiniteProducts();

    const [inputValue, setInputValue] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onSearchChange = (value: string) => {
        setInputValue(value);

        // Debounce 500ms — avoid hitting API on every keystroke
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            handleSearch(value.trim());
        }, 500);
    };

    const clearSearch = () => {
        setInputValue('');
        handleSearch('');
    };

    return (
        <section className="space-y-8">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Pay via VA, No Account Needed!
                    </h2>
                    <p className="text-blue-100 mb-6">
                        Pick your favorite products, checkout directly with your preferred Virtual Account. Fast and secure.
                    </p>
                    <button
                        onClick={() =>
                            document.getElementById('product-list')?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:shadow-lg transition"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div id="product-list" className="relative">
                <div className="relative">
                    <IconRenderer name="LuSearch" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search products by name..."
                        className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    {inputValue && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-500 dark:text-gray-400 text-xs"
                        >
                            <IconRenderer name="LuX" className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                {search && !initialLoading && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-1">
                        {products.length > 0
                            ? `Showing results for "${search}"`
                            : `No products found for "${search}"`}
                    </p>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {/* Initial skeleton loading */}
                {initialLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={`skeleton-init-${i}`} />
                    ))
                    : products.map((product, idx) => (
                        <ProductCard key={idx} product={product} />
                    ))}

                {/* Skeleton loaders for next page */}
                {loading &&
                    !initialLoading &&
                    Array.from({ length: 4 }).map((_, i) => (
                        <ProductCardSkeleton key={`skeleton-more-${i}`} />
                    ))}
            </div>

            {/* Sentinel element — triggers next page load */}
            {!error && <div ref={sentinelRef} className="h-1" />}

            {/* Error state with retry */}
            {error && (
                <div className="flex flex-col items-center gap-4 py-8">
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-sm w-full text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <IconRenderer name="LuCircleAlert" className="w-6 h-6 text-red-500" />
                        </div>
                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">
                            Failed to load products
                        </p>
                        <p className="text-red-400 dark:text-red-500 text-xs mb-4">
                            {error}
                        </p>
                        <button
                            onClick={retry}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition active:scale-95"
                        >
                            <IconRenderer name="LuRefreshCw" className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* Empty search result */}
            {!hasMore && !loading && products.length === 0 && search && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <IconRenderer name="LuSearch" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No products found</p>
                    <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Try a different keyword</p>
                </div>
            )}

            {/* End of list */}
            {!hasMore && !loading && products.length > 0 && (
                <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-600 text-sm">
                        <span className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                        All products have been displayed
                        <span className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
            )}
        </section>
    );
}
