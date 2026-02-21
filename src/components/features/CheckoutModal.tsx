import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useUIStore } from '../../stores/useUIStore';
import { fetchProvinces, fetchCities, fetchDistricts, fetchSubDistricts, fetchAreaGroup } from '../../services/api';
import type { Province, City, District, SubDistrict, CustomerInfo, AreaGroup } from '../../types';

export default function CheckoutModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { cart, getTotal, clearCart, toggleCart, isCartOpen } = useCartStore();
    const createOrder = useOrderStore((s) => s.createOrder);
    const showToast = useUIStore((s) => s.showToast);

    // Geographic state
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubDistrict, setSelectedSubDistrict] = useState('');

    const [areaGroup, setAreaGroup] = useState<AreaGroup | null>(null);
    const [loadingGeo, setLoadingGeo] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingGeo(true);
        fetchProvinces().then(data => {
            setProvinces(data);
            setLoadingGeo(false);
        });
    }, [isOpen]);

    useEffect(() => {
        if (!selectedProvince) {
            setCities([]);
            setSelectedCity('');
            return;
        }
        setLoadingGeo(true);
        fetchCities(selectedProvince).then(data => {
            setCities(data);
            setLoadingGeo(false);
        });
    }, [selectedProvince]);

    useEffect(() => {
        if (!selectedCity) {
            setDistricts([]);
            setSelectedDistrict('');
            return;
        }
        setLoadingGeo(true);
        fetchDistricts(selectedProvince, selectedCity).then((data: District[]) => {
            setDistricts(data);
            setLoadingGeo(false);
        });
    }, [selectedCity, selectedProvince]);

    useEffect(() => {
        if (!selectedDistrict) {
            setSubDistricts([]);
            setSelectedSubDistrict('');
            return;
        }
        setLoadingGeo(true);
        fetchSubDistricts(selectedProvince, selectedCity, selectedDistrict).then((data: SubDistrict[]) => {
            setSubDistricts(data);
            setLoadingGeo(false);
        });
    }, [selectedDistrict, selectedProvince, selectedCity]);

    useEffect(() => {
        if (!selectedProvince || !selectedCity || !selectedDistrict || !selectedSubDistrict) {
            setAreaGroup(null);
            return;
        }

        setLoadingGeo(true);
        fetchAreaGroup(selectedProvince, selectedCity, selectedDistrict).then(data => {
            setAreaGroup(data);
            setLoadingGeo(false);
        });
    }, [selectedProvince, selectedCity, selectedDistrict, selectedSubDistrict]);

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
        const provinceName = provinces.find(p => p.province_id === selectedProvince)?.province_name || '';
        const cityName = cities.find(c => c.city_id === selectedCity)?.city_name || '';
        const districtName = selectedDistrict;
        const subDistrictName = subDistricts.find(s => s.subdistrict_id === selectedSubDistrict)?.subdistrict_name || '';

        const customer: CustomerInfo = {
            code_member: formData.get('code_member') as string,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            province_id: selectedProvince,
            province_name: provinceName,
            city_id: selectedCity,
            city_name: cityName,
            district_name: districtName,
            subdistrict_id: selectedSubDistrict,
            subdistrict_name: subDistrictName,
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
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold">Shipping Details</h3>
                        {loadingGeo && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Province</label>
                            <select
                                required
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Province</option>
                                {provinces.map((p: any) => (
                                    <option key={p.province_id} value={p.province_id}>{p?.province_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">City / Regency</label>
                            <select
                                required
                                disabled={!selectedProvince}
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {cities.map(c => (
                                    <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">District (Kecamatan)</label>
                            <select
                                required
                                disabled={!selectedCity}
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            >
                                <option value="">Select District</option>
                                {districts.map((d, index) => (
                                    <option key={index} value={d.district_name}>{d.district_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Sub District (Kelurahan)</label>
                            <select
                                required
                                disabled={!selectedDistrict}
                                value={selectedSubDistrict}
                                onChange={(e) => setSelectedSubDistrict(e.target.value)}
                                className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            >
                                <option value="">Select Sub District</option>
                                {subDistricts.map(s => (
                                    <option key={s.subdistrict_id} value={s.subdistrict_id}>{s.subdistrict_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {areaGroup && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Area Group</span>
                            <span className="text-sm font-bold">{areaGroup.group_name}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Detailed Address</label>
                        <textarea name="address" placeholder="Street name, Building/House Number, etc." required className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-3 rounded-xl h-20 focus:ring-2 focus:ring-blue-500 outline-none" />
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
