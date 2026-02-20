import { useCartStore } from '../../stores/useCartStore';

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, updateQty, getTotal } = useCartStore();

    const openCheckout = () => {
        window.dispatchEvent(new CustomEvent('open-checkout'));
    };

    return (
        <div
            className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={(e) => {
                if (e.target === e.currentTarget) toggleCart();
            }}
        >
            <div
                className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Your Cart</h3>
                    <button onClick={toggleCart} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.variant_sku} className="flex gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl border dark:border-gray-700">
                                <img src={item.thumbnail} className="w-16 h-16 rounded-xl object-cover" alt={item.name_product} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm leading-tight truncate">{item.name_product}</h4>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                        {item.color} · {item.size}
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-1">
                                        Rp {item.price.toLocaleString('id-ID')}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <button
                                            onClick={() => updateQty(item.variant_sku, -1)}
                                            className="w-6 h-6 border dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xs"
                                        >
                                            −
                                        </button>
                                        <span className="text-xs font-bold">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.variant_sku, 1)}
                                            className="w-6 h-6 border dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xs"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-600 dark:text-gray-400">Total Payment</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            Rp {getTotal().toLocaleString('id-ID')}
                        </span>
                    </div>
                    <button
                        disabled={cart.length === 0}
                        onClick={openCheckout}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
