import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useOrderStore } from '../../stores/useOrderStore';
import { useUIStore } from '../../stores/useUIStore';
import { fetchProvinces, fetchCities, fetchDistricts, fetchSubDistricts, fetchAreaGroup, fetchPaymentMethodsData, fetchShippingRates } from '../../services/api';
import { IconRenderer } from '../icons/IconRenderer';
import type { Province, City, District, SubDistrict, CustomerInfo, AreaGroup, PaymentMethodsResponse, ShippingRatesResponse } from '../../types';

export default function CheckoutModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { cart, getTotal, clearCart, toggleCart, isCartOpen } = useCartStore();
    const createOrder = useOrderStore((s) => s.createOrder);
    const showToast = useUIStore((s) => s.showToast);
    const formRef = useRef<HTMLFormElement>(null);

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
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
    const [shippingRates, setShippingRates] = useState<ShippingRatesResponse | null>(null);
    const [selectedCourierRateId, setSelectedCourierRateId] = useState('');
    const [loadingGeo, setLoadingGeo] = useState(false);
    const [loadingShipping, setLoadingShipping] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingGeo(true);
        Promise.all([
            fetchProvinces(),
            fetchPaymentMethodsData()
        ]).then(([provData, payData]) => {
            setProvinces(provData);
            setPaymentMethods(payData);
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
        if (!isOpen) {
            setSelectedProvince('');
            setSelectedCity('');
            setSelectedDistrict('');
            setSelectedSubDistrict('');
            setShippingRates(null);
            setSelectedCourierRateId('');
            setAreaGroup(null);
            formRef.current?.reset();
        }
    }, [isOpen]);

    const totalWeight = cart.reduce((acc, item) => acc + (item.weight || 200) * item.qty, 0);

    const handleSubDistrictChange = (subId: string) => {
        setSelectedSubDistrict(subId);
    };

    useEffect(() => {
        if (!selectedSubDistrict || totalWeight <= 0) {
            setShippingRates(null);
            return;
        }

        const sub = subDistricts.find(s => s.subdistrict_name === selectedSubDistrict);
        if (sub) {
            const destination = {
                id_tujuan: {
                    jne: sub.kode_origin_jnt,
                    sicepat: sub.kode_sicepat,
                    nama_destination_jnt: sub.kode_destination_jne,
                    ninja_l1: sub.kode_ninja_lt1,
                    ninja_l2: sub.kode_ninja_lt2,
                    lion_parcel: sub.destination_lion_parcel_code,
                    sapx_destination: sub.destination_sapx_code,
                    wahana_destination_code: sub.wahana_destination_code,
                    destination_raja_ongkir: sub.destination_raja_ongkir,
                    postal_code: sub.postal_code,
                    subdistrict_name: sub.subdistrict_name
                },
                berat: totalWeight
            };
            setLoadingShipping(true);
            fetchShippingRates(destination.id_tujuan, totalWeight).then(res => {
                setShippingRates(res);
                setLoadingShipping(false);
            }).catch(() => setLoadingShipping(false));
        }
    }, [selectedSubDistrict, totalWeight, subDistricts]);

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
        const selectedSub = subDistricts.find(s => s.subdistrict_name === selectedSubDistrict);
        const provinceName = provinces.find(p => p.province_id === selectedProvince)?.province_name || '';
        const cityName = cities.find(c => c.city_id === selectedCity)?.city_name || '';

        // Find selected shipping rate details
        let selectedRateInfo: any = { courier: formData.get('courier') as string };
        if (shippingRates) {
            for (const providerRates of Object.values(shippingRates.items)) {
                const found = providerRates.find(r => r.rate_id === selectedCourierRateId);
                if (found) {
                    selectedRateInfo = {
                        courier: found.rate_id,
                        ...found
                    };
                    break;
                }
            }
        }

        // Find selected payment method details
        const bankCode = formData.get('bank') as string;
        let selectedPayInfo: any = { bank: bankCode };
        if (paymentMethods) {
            const allMethods = [
                ...(paymentMethods.VA || []),
                ...(paymentMethods.WA || []),
                ...(paymentMethods.SB || [])
            ];
            const foundPay = allMethods.find(m => m.bank_code === bankCode);
            if (foundPay) {
                selectedPayInfo = {
                    bank: foundPay.bank_code,
                    ...foundPay
                };
            }
        }

        const customer: CustomerInfo = {
            code_member: formData.get('code_member') as string,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            area: {
                province_id: selectedProvince,
                province_name: provinceName,
                city_id: selectedCity,
                city_name: cityName,
                district_name: selectedDistrict,
                subdistrict_id: selectedSubDistrict,
                subdistrict_name: selectedSub?.subdistrict_name || '',
                area_id: selectedSub?.area_id || '',
                ...selectedSub
            },
            courir: selectedRateInfo,
            payment: selectedPayInfo,
        };

        try {
            const order = await createOrder(customer, cart, getTotal());
            clearCart();
            setIsOpen(false);
            if (isCartOpen) toggleCart();

            if (order.link_url) {
                window.location.href = order.link_url;
            } else {
                navigate('/payment');
            }
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
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[2.5rem] p-8 md:p-12 max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                            <IconRenderer name="LuShoppingBag" size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight">Checkout</h3>
                            <p className="text-gray-500 text-sm font-medium">Complete your shipping details</p>
                        </div>
                        {loadingGeo && (
                            <div className="ml-2 w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>
                    <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <IconRenderer name="LuX" size={24} />
                    </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Personal Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            <h4 className="text-lg font-bold uppercase tracking-wider text-gray-400 text-xs">Personal Information</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Member Code</label>
                                <input type="text" name="code_member" required placeholder="Enter member code" className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Full Name</label>
                                <input type="text" name="name" required placeholder="Enter your full name" className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Email Address</label>
                                <input type="email" name="email" required placeholder="you@example.com" className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">WhatsApp Number</label>
                                <input type="tel" name="phone" required placeholder="08xxxxxxxxx" className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Shipping Address */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            <h4 className="text-lg font-bold uppercase tracking-wider text-gray-400 text-xs">Shipping Address</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Province</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={selectedProvince}
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">Select Province</option>
                                        {provinces
                                            .slice() // Membuat copy array agar tidak mengubah data asli (best practice)
                                            .sort((a, b) => a.province_name.localeCompare(b.province_name)) // Urutkan A-Z
                                            .map((p: any) => (
                                                <option key={p.province_id} value={p.province_id}>
                                                    {p?.province_name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <IconRenderer name="LuChevronDown" size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">City / Regency</label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={!selectedProvince}
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">Select City</option>
                                        {cities
                                            .slice() // Membuat copy array agar tidak mengubah data asli (best practice)
                                            .sort((a, b) => a.city_name.localeCompare(b.city_name)) // Urutkan A-Z
                                            .map(c => (
                                                <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                                            ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <IconRenderer name="LuChevronDown" size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">District (Kecamatan)</label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={!selectedCity}
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">Select District</option>
                                        {districts
                                            .slice() // Membuat copy array agar tidak mengubah data asli (best practice)
                                            .sort((a, b) => a.district_name.localeCompare(b.district_name)) // Urutkan A-Z
                                            .map((d, index) => (
                                                <option key={index} value={d.district_name}>{d.district_name}</option>
                                            ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <IconRenderer name="LuChevronDown" size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Sub District (Kelurahan)</label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={!selectedDistrict}
                                        value={selectedSubDistrict}
                                        onChange={(e) => handleSubDistrictChange(e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="">Select Sub District</option>
                                        {subDistricts
                                            .slice()
                                            .sort((a, b) => a.subdistrict_name.localeCompare(b.subdistrict_name))
                                            .map(s => (
                                                <option key={s.subdistrict_id} value={s.subdistrict_id}>{s.subdistrict_name}</option>
                                            ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <IconRenderer name="LuChevronDown" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {areaGroup && (
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                        <IconRenderer name="LuMapPin" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Shipping Zone Detected</p>
                                        <h5 className="text-xl font-black">{areaGroup.group_name}</h5>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs opacity-80 mb-1">Standard Delivery</p>
                                    <p className="font-bold underline cursor-help">Rate calculated at next step</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Detailed Address</label>
                            <textarea name="address" placeholder="Street name, Building/House Number, Floor, etc." required className="w-full border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl h-32 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none" />
                        </div>
                    </div>

                    {/* Section 3: Shipping & Payment */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            <h4 className="text-lg font-bold uppercase tracking-wider text-gray-400 text-xs">Method & Payment</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">
                                    Shipping Courier {loadingShipping && <span className="ml-2 inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                                </label>
                                <div className="relative">
                                    <select
                                        name="courier"
                                        required
                                        value={selectedCourierRateId}
                                        onChange={(e) => setSelectedCourierRateId(e.target.value)}
                                        className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer"
                                    >
                                        <option value="">Select Courier</option>
                                        {shippingRates?.items && Object.entries(shippingRates.items).map(([key, rates]) => {
                                            const validRates = (rates || []).filter(r => r.finalRate > 0);
                                            return validRates.length > 0 && (
                                                <optgroup key={key} label={key.toUpperCase()}>
                                                    {validRates.map((r, i) => (
                                                        <option key={`${key}-${i}`} value={r.rate_id}>
                                                            {r.provider} - Rp {r.finalRate.toLocaleString()} ({r.etd})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            );
                                        })}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold ml-1 text-gray-600 dark:text-gray-400">Payment Method</label>
                                <div className="relative">
                                    <select name="bank" required className="w-full appearance-none border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium cursor-pointer">
                                        <option value="">Select Payment Method</option>
                                        {paymentMethods?.VA && paymentMethods.VA.length > 0 && (
                                            <optgroup label="Virtual Account">
                                                {paymentMethods.VA.map(m => (
                                                    <option key={m.bank_code} value={m.bank_code}>{m.bank_name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                        {paymentMethods?.WA && paymentMethods.WA.length > 0 && (
                                            <optgroup label="Wallet / QRIS">
                                                {paymentMethods.WA.map(m => (
                                                    <option key={m.bank_code} value={m.bank_code}>{m.bank_name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <IconRenderer name="LuChevronDown" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Processing Address...</span>
                                </>
                            ) : (
                                <>
                                    <span>Place Order Now</span>
                                    <IconRenderer name="LuArrowRight" size={24} />
                                </>
                            )}
                        </button>
                        <p className="text-center text-gray-400 text-xs mt-4 font-bold uppercase tracking-widest">Secure 128-bit SSL Encrypted Payment</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
