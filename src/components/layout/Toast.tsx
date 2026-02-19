import { useEffect } from 'react';
import { useUIStore } from '../../stores/useUIStore';

export default function Toast() {
    const { toast } = useUIStore();

    useEffect(() => {
        // Toast auto-dismisses via the store's showToast timeout
    }, [toast]);

    return (
        <div
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-[100] transition-all duration-300 transform ${toast.visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0 pointer-events-none'
                }`}
        >
            {toast.message}
        </div>
    );
}
