import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Store, Power, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', ownerName: '', email: '', subdomain: '', menuUrl: '' });
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    const { data } = await axios.get('/api/restaurants');
    setRestaurants(data);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/restaurants', formData);
      toast.success('تم إضافة المطعم بنجاح');
      setFormData({ name: '', ownerName: '', email: '', subdomain: '', menuUrl: '' });
      fetchRestaurants();
    } catch (err) {
      toast.error('حدث خطأ في الإضافة');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await axios.put(`/api/restaurants/${id}/toggle`);
      toast.success('تم تحديث الحالة');
      fetchRestaurants();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const extendSubscription = async (id: string) => {
    try {
      await axios.put(`/api/restaurants/${id}/extend`);
      toast.success('تم تمديد الاشتراك 30 يوم بنجاح');
      fetchRestaurants();
    } catch (err) {
      toast.error('حدث خطأ في التمديد');
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المطعم؟')) return;
    try {
      await axios.delete(`/api/restaurants/${id}`);
      toast.success('تم حذف المطعم');
      fetchRestaurants();
    } catch (err) {
      toast.error('حدث خطأ في الحذف');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Layout className="text-orange-600" />
        SaaS Menu Gate Control
      </h1>

      {/* Add Restaurant Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> إضافة مطعم (SaaS)
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            required
            placeholder="اسم المطعم"
            className="p-3 border rounded-xl"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input
            required
            placeholder="الدومين (مثلاً: mcdonalds)"
            className="p-3 border rounded-xl"
            value={formData.subdomain}
            onChange={e => setFormData({...formData, subdomain: e.target.value})}
          />
          <input
            required
            placeholder="رابط المنيو (Vercel/External)"
            className="p-3 border rounded-xl"
            value={formData.menuUrl}
            onChange={e => setFormData({...formData, menuUrl: e.target.value})}
          />
          <input
            required
            placeholder="اسم المالك"
            className="p-3 border rounded-xl"
            value={formData.ownerName}
            onChange={e => setFormData({...formData, ownerName: e.target.value})}
          />
          <button
            disabled={loading}
            className="bg-orange-600 text-white font-bold rounded-xl py-3 hover:bg-orange-700 transition-colors col-span-full md:col-span-1"
          >
            {loading ? 'جاري الإضافة...' : 'إضافة المطعم'}
          </button>
        </form>
      </div>

      {/* Restaurants List */}
      <div className="grid gap-4">
        {restaurants.map(res => (
          <div key={res._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${res.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <Store />
              </div>
              <div>
                <h3 className="font-bold text-xl">{res.name}</h3>
                <p className="text-gray-500 text-sm">@{res.subdomain} | تنتهي في: {new Date(res.expiresAt).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/menu/${res.subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100"
              >
                رابط البوابة
              </a>
              <button
                onClick={() => extendSubscription(res._id)}
                className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-100 flex items-center gap-1"
              >
                تجديد 30 يوم
              </button>
              <button
                onClick={() => toggleStatus(res._id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
                  res.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                <Power className="w-4 h-4" />
                {res.isActive ? 'إيقاف' : 'تفعيل'}
              </button>
              <button
                onClick={() => deleteRestaurant(res._id)}
                className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
