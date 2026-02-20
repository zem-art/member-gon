import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { IconRenderer } from '../icons/IconRenderer';

export default function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const toggleCart = useCartStore((s) => s.toggleCart);
    const cart = useCartStore((s) => s.cart);
    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const { theme, toggleTheme } = useThemeStore();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex justify-around items-center py-3 px-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
            <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-400'
                    }`}
            >
                <IconRenderer name="LuHome" className="w-[22px] h-[22px]" />
                <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
                onClick={() => navigate('/tracking')}
                className={`flex flex-col items-center gap-1 ${isActive('/tracking') ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-400'
                    }`}
            >
                <IconRenderer name="LuSearch" className="w-[22px] h-[22px]" />
                <span className="text-[10px] font-bold">Track</span>
            </button>

            <button
                onClick={toggleCart}
                className="flex flex-col items-center gap-1 text-gray-400 relative"
            >
                <IconRenderer name="LuShoppingCart" className="w-[22px] h-[22px]" />
                <span className="absolute -top-3 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                    {cartCount}
                </span>
                <span className="text-[10px] font-bold">Cart</span>
            </button>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="flex flex-col items-center gap-1 text-gray-400"
            >
                {theme === 'dark' ? (
                    <IconRenderer name="LuSun" className="w-[22px] h-[22px]" />
                ) : (
                    <IconRenderer name="LuMoon" className="w-[22px] h-[22px]" />
                )}
                <span className="text-[10px] font-bold">Theme</span>
            </button>

            <button
                onClick={() => navigate('/history')}
                className={`flex flex-col items-center gap-1 ${isActive('/history') ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-400'
                    }`}
            >
                <IconRenderer name="LuClock" className="w-[22px] h-[22px]" />
                <span className="text-[10px] font-bold">History</span>
            </button>
        </nav>
    );
}
