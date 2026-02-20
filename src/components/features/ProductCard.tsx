import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { IconRenderer } from '../icons/IconRenderer';

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const navigate = useNavigate();
    const isOutOfStock = product.stock <= 0;
    const showPriceRange = product.price_min !== product.price_max;

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition group border border-transparent dark:border-gray-800 cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={product.thumbnail}
                    alt={product.name_product}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm uppercase">
                    {product.brand}
                </span>
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="p-4 md:p-6">
                <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-1">
                    {product.name_product}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold mb-3 text-sm md:text-lg">
                    {showPriceRange
                        ? `Rp ${product.price_min.toLocaleString('id-ID')} - ${product.price_max.toLocaleString('id-ID')}`
                        : `Rp ${product.price_min.toLocaleString('id-ID')}`}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Stock: {product.stock}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                        View Details
                        <IconRenderer name="LuChevronRight" className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </div>
    );
}
