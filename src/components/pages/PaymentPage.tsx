import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../stores/useOrderStore';
import { useUIStore } from '../../stores/useUIStore';
import { IconRenderer } from '../icons/IconRenderer';

export default function PaymentPage() {
    const navigate = useNavigate();
    const activePayment = useOrderStore((s) => s.activePayment);
    const showToast = useUIStore((s) => s.showToast);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast('VA number copied!');
        }).catch(() => {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('VA number copied!');
        });
    };

    if (!activePayment) {
        return (
            <section className="max-w-xl mx-auto text-center py-20">
                <p className="text-gray-400">No payment data available.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-600 dark:text-blue-400 font-bold underline">
                    Back to Home
                </button>
            </section>
        );
    }

    return (
        <section className="max-w-xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border dark:border-gray-800 text-center transition-colors">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconRenderer name="LuCreditCard" className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    Please transfer to the Virtual Account number below before the deadline expires.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 mb-6">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Bank Transfer (VA)</p>
                    <h3 className="text-lg font-bold mb-4 italic text-blue-900 dark:text-blue-300">
                        {activePayment.bank.toUpperCase()} VIRTUAL ACCOUNT
                    </h3>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl p-4">
                        <span className="text-xl font-mono font-bold tracking-wider">{activePayment.va}</span>
                        <button onClick={() => copyToClipboard(activePayment.va)} className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">
                            COPY
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center px-4 mb-8">
                    <div className="text-left">
                        <p className="text-xs text-gray-400">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            Rp {activePayment.total.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className="text-sm font-bold text-red-500">23:59:59</p>
                    </div>
                </div>

                <button onClick={() => navigate('/history')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition">
                    Check Payment Status
                </button>
                <button onClick={() => navigate('/')} className="w-full mt-4 text-gray-400 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-200 transition">
                    Maybe Later
                </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl p-6 transition-colors">
                <h4 className="font-bold text-sm mb-3">How to Pay:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 text-left list-disc pl-4">
                    <li>Open your Mobile Banking app or visit the nearest ATM.</li>
                    <li>Select Transfer / Payment &gt; Virtual Account.</li>
                    <li>Enter the Virtual Account number shown above.</li>
                    <li>Make sure the amount matches the total bill.</li>
                    <li>Save your transaction receipt.</li>
                </ul>
            </div>
        </section>
    );
}
