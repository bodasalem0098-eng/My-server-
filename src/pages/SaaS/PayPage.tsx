import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react';

export default function PayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/restaurants/${id}/extend`);
      setPaid(true);
      toast.success('تم تفعيل الاشتراك لمدة ٣٠ يوماً');
    } catch (err) {
      toast.error('فشل تفعيل الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-50 p-10 rounded-3xl max-w-sm">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم التفعيل بنجاح!</h1>
          <p className="text-gray-600 mb-8">يمكنك الآن العودة واستخدام المنيو كالمعتاد.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">تجديد الاشتراك</h1>
        <div className="bg-orange-50 p-4 rounded-2xl mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">باقة المطعم (SaaS)</span>
            <span className="font-bold text-orange-600 text-xl">150 ج.م / شهر</span>
          </div>
          <p className="text-xs text-orange-400 font-bold">تفعيل فوري لخدمة المنيو</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            {loading ? 'جاري المعالجة...' : (
              <>
                <CreditCard className="w-5 h-5" />
                تأكيد الدفع (Demo)
              </>
            )}
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full text-gray-500 font-bold py-2 flex items-center justify-center gap-1 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4" /> العودة للخلف
          </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-400 text-center uppercase tracking-widest">
          Secure Payment System
        </p>
      </div>
    </div>
  );
    }
    
