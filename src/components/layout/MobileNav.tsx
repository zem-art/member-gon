import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useThemeStore } from '../../stores/useThemeStore';

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
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
                onClick={() => navigate('/tracking')}
                className={`flex flex-col items-center gap-1 ${isActive('/tracking') ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-400'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-[10px] font-bold">Track</span>
            </button>

            <button
                onClick={toggleCart}
                className="flex flex-col items-center gap-1 text-gray-400 relative"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" /><path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" /><path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                )}
                <span className="text-[10px] font-bold">Theme</span>
            </button>

            <button
                onClick={() => navigate('/history')}
                className={`flex flex-col items-center gap-1 ${isActive('/history') ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-400'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="10" />
                </svg>
                <span className="text-[10px] font-bold">History</span>
            </button>
        </nav>
    );
}
