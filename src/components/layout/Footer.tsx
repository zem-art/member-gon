import { useNavigate } from 'react-router-dom';
import { IconRenderer } from '../icons/IconRenderer';

export default function Footer() {
    const navigate = useNavigate();
    const year = new Date().getFullYear();

    return (
        <footer className="hidden md:block bg-white dark:bg-gray-900 border-t dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div
                            className="flex items-center gap-2 cursor-pointer mb-4"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                B
                            </div>
                            <span className="text-lg font-bold tracking-tight">BeliKilat</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Fast and trusted online shopping platform. Find quality products from various brands at the best prices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', path: '/' },
                                { label: 'Track Order', path: '/tracking' },
                                { label: 'Order History', path: '/history' },
                                { label: 'Payment', path: '/payment' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                            Customer Service
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="mailto:support@belikilat.id" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2">
                                    <IconRenderer name="LuMail" className="w-4 h-4" />
                                    support@belikilat.id
                                </a>
                            </li>
                            <li>
                                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-2">
                                    <IconRenderer name="LuPhone" className="w-4 h-4" />
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                            Payment Methods
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {['Mandiri', 'BCA', 'BNI', 'BRI'].map((bank) => (
                                <span
                                    key={bank}
                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 border dark:border-gray-700"
                                >
                                    {bank}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                            All payments via Virtual Account
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        &copy; {year} BeliKilat. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
