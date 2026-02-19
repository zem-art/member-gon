import { useEffect, useState } from 'react';
import type { Product } from '../../types';
import { fetchProducts } from '../../services/api';
import ProductCard from '../features/ProductCard';

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetchProducts().then(setProducts);
    }, []);

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

            {/* Product Grid */}
            <div id="product-list" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
