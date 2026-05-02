import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Loader2, ExternalLink, CreditCard } from 'lucide-react';

export default function MenuPage() {
  const { subdomain } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGate = async () => {
      try {
        const { data } = await axios.get(`/api/check/${subdomain}`);
        setData(data);
        
        // If active, redirect automatically after 1 second
        if (data.isActive) {
          setTimeout(() => {
            window.location.href = data.menuUrl;
          }, 1000);
        }
      } catch (err) {
        setData({ isActive: false, message: 'خطأ في جلب البيانات' });
      } finally {
        setLoading(false);
      }
    };
    checkGate();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-gray-600 font-bold tracking-wide">جاري التحقق من أمان البوابة...</p>
      </div>
    );
  }

  if (data.isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-50 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-t-4 border-green-500 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="text-green-600 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم التحقق بنجاح ✅</h1>
          <p className="text-gray-500 mb-8">يتم الآن توجيهك إلى المنيو الحقيقي للحصول على أفضل تجربة...</p>
          
          <a 
            href={data.menuUrl}
            className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            اضغط هنا للانتقال فوراً
          </a>
        </div>
      </div>
    );
  }

  // Inactive / Not Found
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 p-8 rounded-3xl mb-6 max-w-lg">
        <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">الخدمة متوقفة حالياً</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          {data.message || "الاشتراك غير مفعل أو أن المطعم غير مسجل في النظام."}
        </p>
      </div>
      
      <div className="max-w-sm w-full space-y-4">
        {data.whatsapp && (
          <a 
            href={data.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg"
          >
            تواصل عبر واتساب للتفعيل
          </a>
        )}
        {data.phone && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">دعم الدفع الهاتفي</p>
            <p className="font-bold text-xl text-gray-800 tracking-widest">{data.phone}</p>
          </div>
        )}
        <button onClick={() => window.location.reload()} className="text-orange-600 text-sm font-bold hover:underline">إعادة المحاولة</button>
      </div>
    </div>
  );
}
