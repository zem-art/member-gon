import { useState } from 'react';
import { useOrderStore } from '../../stores/useOrderStore';

export default function TrackingPage() {
    const [trackId, setTrackId] = useState('');
    const { trackingResult, trackOrder, isLoading } = useOrderStore();
    const [searched, setSearched] = useState(false);

    const handleTrack = async () => {
        if (!trackId.trim()) return;
        await trackOrder(trackId);
        setSearched(true);
    };

    return (
        <section className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border dark:border-gray-800 transition-colors">
                <h2 className="text-2xl font-bold mb-6">Track Order</h2>
                <div className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={trackId}
                        onChange={(e) => setTrackId(e.target.value)}
                        placeholder="Enter Order ID (e.g. INV-12345)"
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    />
                    <button
                        onClick={handleTrack}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Search'}
                    </button>
                </div>

                {searched && !isLoading && !trackingResult && (
                    <p className="text-red-500 text-center font-bold">Order not found.</p>
                )}

                {trackingResult && (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 mb-6 text-center">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Current Status</p>
                            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">{trackingResult.status}</h3>
                        </div>

                        <div className="space-y-6 relative ml-4 border-l-2 border-dashed border-gray-200 dark:border-gray-700 pl-8">
                            {trackingResult.steps.map((step, i) => (
                                <div key={i} className={`relative ${!step.completed ? 'opacity-30' : ''}`}>
                                    <div className={`absolute -left-[37px] top-0 w-4 h-4 rounded-full ${step.completed
                                            ? 'bg-green-500 shadow-[0_0_0_4px_white,0_0_0_6px_rgba(34,197,94,0.2)] dark:shadow-[0_0_0_4px_rgb(17,24,39),0_0_0_6px_rgba(34,197,94,0.2)]'
                                            : 'bg-gray-400'
                                        }`} />
                                    <p className="font-bold text-sm">{step.label}</p>
                                    {step.date && <p className="text-xs text-gray-500 dark:text-gray-400">{step.date}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
