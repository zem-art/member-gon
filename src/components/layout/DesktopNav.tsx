import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { IconRenderer } from '../icons/IconRenderer';

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
                    className={`hover:text-blue-600 cursor-pointer transition ${location.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    Home
                </button>
                <button
                    onClick={() => navigate('/tracking')}
                    className={`hover:text-blue-600 cursor-pointer transition ${location.pathname === '/tracking' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    Track Order
                </button>
                <button
                    onClick={() => navigate('/history')}
                    className={`hover:text-blue-600 cursor-pointer transition ${location.pathname === '/history' ? 'text-blue-600 font-semibold' : ''}`}
                >
                    History
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 bg-gray-100 cursor-pointer dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <IconRenderer name="LuSun" className="w-5 h-5" />
                    ) : (
                        <IconRenderer name="LuMoon" className="w-5 h-5" />
                    )}
                </button>

                {/* Cart */}
                <button
                    onClick={toggleCart}
                    className="relative p-2 bg-gray-100 cursor-pointer dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <IconRenderer name="LuShoppingCart" className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {cartCount}
                    </span>
                </button>
            </div>
        </nav>
    );
}
