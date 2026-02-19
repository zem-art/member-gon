import type { Product } from '../../types';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const addToCart = useCartStore((s) => s.addToCart);
    const showToast = useUIStore((s) => s.showToast);

    const handleAdd = () => {
        addToCart(product);
        showToast(`${product.name} added to cart!`);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition group border border-transparent dark:border-gray-800">
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                    {product.category}
                </span>
            </div>
            <div className="p-4 md:p-6">
                <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold mb-4 text-sm md:text-lg">
                    Rp {product.price.toLocaleString('id-ID')}
                </p>
                <button
                    onClick={handleAdd}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-gray-700 py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition flex items-center justify-center gap-2"
                >
                    Buy
                </button>
            </div>
        </div>
    );
}
