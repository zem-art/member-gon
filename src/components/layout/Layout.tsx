import { Outlet } from 'react-router-dom';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import Toast from './Toast';
import CartDrawer from '../features/CartDrawer';
import CheckoutModal from '../features/CheckoutModal';

export default function Layout() {
    return (
        <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen pb-20 md:pb-0 transition-colors duration-300">
            <DesktopNav />
            <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                <Outlet />
            </main>
            <MobileNav />
            <CartDrawer />
            <CheckoutModal />
            <Toast />
        </div>
    );
}
