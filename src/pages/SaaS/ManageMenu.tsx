import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ManageMenu() {
  const { id } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', price: '', image: '' });
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    const { data } = await axios.get(`/api/menu/${id}`);
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/menu', { ...formData, restaurantId: id });
      toast.success('تم إضافة الصنف بنجاح');
      setFormData({ name: '', price: '', image: '' });
      fetchItems();
    } catch (err) {
      toast.error('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link to="/" className="flex items-center gap-1 text-orange-600 mb-6 hover:underline font-bold">
        <ArrowRight className="w-4 h-4" /> العودة للوحة التحكم
      </Link>

      <h1 className="text-3xl font-bold mb-8">إدارة أصناف المنيو</h1>

      {/* Add Item Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-orange-600" /> إضافة صنف جديد
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="اسم الصنف (مثلاً: بيتزا مارجريتا)"
              className="p-3 border rounded-xl"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input
              required
              type="number"
              placeholder="السعر"
              className="p-3 border rounded-xl"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="relative">
            <ImageIcon className="absolute right-3 top-3 text-gray-400" />
            <input
              placeholder="رابط الصورة (اختياري)"
              className="p-3 pr-10 border rounded-xl w-full"
              value={formData.image}
              onChange={e => setFormData({...formData, image: e.target.value})}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'إضافة إلى المنيو'}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 pt-8 border-t">لا توجد أصناف مضافة بعد لهذا المطعم.</p>
        ) : (
          items.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              {item.image ? (
                <img src={item.image} className="w-16 h-16 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                  <ImageIcon className="text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-orange-600 font-bold">{item.price} ج.م</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
