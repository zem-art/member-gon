import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useThemeStore } from '../../stores/useThemeStore';

export default function DesktopNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const toggleCart = useCartStore((s) => s.toggleCart);
    const cart = useCartStore((s) => s.cart);
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const { theme, toggleTheme } = useThemeStore();

    return (
        <nav className="hidden md:flex sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 z-40 px-6 py-4 justify-between items-center transition-colors duration-300">
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    B
                </div>
                <h1 className="text-xl font-bold tracking-tight">BeliKilat</h1>
            </div>
            <div className="flex items-center gap-8">
                <button
                    onClick={() => navigate('/')}
                    className={`hover:text-blue-600 transition ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    Home
                </button>
                <button
                    onClick={() => navigate('/tracking')}
                    className={`hover:text-blue-600 transition ${location.pathname === '/tracking' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    Track Order
                </button>
                <button
                    onClick={() => navigate('/history')}
                    className={`hover:text-blue-600 transition ${location.pathname === '/history' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    History
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" /><path d="M12 20v2" />
                            <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                            <path d="M2 12h2" /><path d="M20 12h2" />
                            <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    )}
                </button>

                {/* Cart */}
                <button
                    onClick={toggleCart}
                    className="relative p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {cartCount}
                    </span>
                </button>
            </div>
        </nav>
    );
}
