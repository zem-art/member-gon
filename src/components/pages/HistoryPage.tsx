import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../stores/useOrderStore';

export default function HistoryPage() {
    const navigate = useNavigate();
    const { orderHistory, loadHistory, showOrderPayment, isLoading } = useOrderStore();

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleTrack = (id: string) => {
        navigate('/tracking');
        setTimeout(() => {
            useOrderStore.getState().trackOrder(id);
        }, 100);
    };

    const handleShowPayment = async (id: string) => {
        await showOrderPayment(id);
        navigate('/payment');
    };

    return (
        <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Order History</h2>

            {isLoading && (
                <div className="text-center py-10 text-gray-400">Loading...</div>
            )}

            <div className="space-y-4">
                {!isLoading && orderHistory.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl text-center opacity-40">
                        No orders yet.
                    </div>
                ) : (
                    orderHistory.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 shadow-sm transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs text-gray-400">{order.date}</span>
                                    <h4 className="font-bold text-blue-600 dark:text-blue-400">{order.id}</h4>
                                </div>
                                <span
                                    className={`px-3 py-1 text-[10px] font-bold rounded-full ${order.status === 'Completed'
                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="space-y-1 mb-4">
                                {order.items.slice(0, 2).map((item) => (
                                    <p key={item.variant_sku} className="text-xs text-gray-600 dark:text-gray-400">
                                        • {item.name_product} ({item.color}/{item.size}) x{item.qty}
                                    </p>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-800">
                                <span className="font-bold">
                                    Rp {order.total.toLocaleString('id-ID')}
                                </span>
                                <div className="flex gap-4">
                                    {order.status !== 'Completed' && (
                                        <button
                                            onClick={() => handleShowPayment(order.id)}
                                            className="text-blue-600 dark:text-blue-400 text-xs font-bold underline"
                                        >
                                            VA Details
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleTrack(order.id)}
                                        className="text-blue-600 dark:text-blue-400 text-xs font-bold"
                                    >
                                        Track
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
