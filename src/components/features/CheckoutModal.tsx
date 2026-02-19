import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useUIStore } from '../../stores/useUIStore';

export default function CheckoutModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { cart, getTotal, clearCart, toggleCart, isCartOpen } = useCartStore();
    const createOrder = useOrderStore((s) => s.createOrder);
    const showToast = useUIStore((s) => s.showToast);

    useEffect(() => {
        const handler = () => setIsOpen(true);
        window.addEventListener('open-checkout', handler);
        return () => window.removeEventListener('open-checkout', handler);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const customer = {
            code_member: formData.get('code_member') as string,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            courier: formData.get('courier') as string,
            bank: formData.get('bank') as string,
        };

        try {
            await createOrder(customer, cart, getTotal());
            clearCart();
            setIsOpen(false);
            if (isCartOpen) toggleCart();
            navigate('/payment');
            showToast('Order Created!');
        } catch {
            showToast('Failed to create order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Shipping Details</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Member Code</label>
                        <input type="text" name="code_member" required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" name="name" required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" placeholder="you@mail.com" required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">WhatsApp Number</label>
                        <input type="tel" name="phone" placeholder="08xxxx" required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Address</label>
                        <textarea name="address" required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Shipping Courier</label>
                        <select name="courier" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="JNE">JNE Regular</option>
                            <option value="J&T">J&T Express</option>
                            <option value="SiCepat">SiCepat Express</option>
                            <option value="AnterAja">AnterAja</option>
                            <option value="POS">POS Indonesia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Payment Method (VA)</label>
                        <select name="bank" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="Mandiri">Mandiri Virtual Account</option>
                            <option value="BCA">BCA Virtual Account</option>
                            <option value="BNI">BNI Virtual Account</option>
                            <option value="BRI">BRI Virtual Account</option>
                        </select>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Processing...' : 'Place Order Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
