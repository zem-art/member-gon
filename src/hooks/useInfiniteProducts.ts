import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types';
import { fetchProductsPaginated } from '../services/api';

const LIMIT = 8;
const MAX_AUTO_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

export function useInfiniteProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [search, setSearch] = useState('');

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadingRef = useRef(false);
    const retryCountRef = useRef(0);
    const currentSearchRef = useRef('');

    const loadMore = useCallback(async (currentPage: number, searchQuery: string, isRetry = false) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        if (!isRetry || retryCountRef.current === 0) {
            setError(null);
        }

        try {
            const res = await fetchProductsPaginated(currentPage, LIMIT, searchQuery);

            // Guard: ignore stale responses if search changed while fetching
            if (currentSearchRef.current !== searchQuery) {
                loadingRef.current = false;
                return;
            }

            setProducts((prev) => currentPage === 1 ? res.data : [...prev, ...res.data]);
            setHasMore(res.hasMore);
            setPage(currentPage + 1);
            setError(null);
            retryCountRef.current = 0;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat produk';

            if (retryCountRef.current < MAX_AUTO_RETRIES) {
                retryCountRef.current += 1;
                loadingRef.current = false;
                setLoading(false);
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
                return loadMore(currentPage, searchQuery, true);
            }

            setError(message);
            retryCountRef.current = 0;
        } finally {
            setLoading(false);
            setInitialLoading(false);
            loadingRef.current = false;
        }
    }, []);

    // Manual retry
    const retry = useCallback(() => {
        setError(null);
        retryCountRef.current = 0;
        loadMore(page, search);
    }, [page, search, loadMore]);

    // Search handler — resets products and fetches page 1 with new search query
    const handleSearch = useCallback((query: string) => {
        setSearch(query);
        currentSearchRef.current = query;
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setInitialLoading(true);
        setError(null);
        loadingRef.current = false;
        retryCountRef.current = 0;
        loadMore(1, query);
    }, [loadMore]);

    // Initial load
    useEffect(() => {
        currentSearchRef.current = '';
        loadMore(1, '');
    }, [loadMore]);

    // IntersectionObserver
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !loadingRef.current && !error) {
                    loadMore(page, currentSearchRef.current);
                }
            },
            { rootMargin: '200px' },
        );

        const sentinel = sentinelRef.current;
        if (sentinel) {
            observerRef.current.observe(sentinel);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [hasMore, page, loadMore, error]);

    return { products, loading, initialLoading, hasMore, error, search, retry, handleSearch, sentinelRef };
}
