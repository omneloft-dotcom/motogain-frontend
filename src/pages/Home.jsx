// src/pages/Home.jsx

import { Link } from "react-router-dom";
import HomeNewsPreview from "../components/home/HomeNewsPreview";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-10 shadow-md mb-10">
        <h1 className="text-3xl font-bold mb-3">
          Cordy — Moto Kurye Pazaryeri
        </h1>
        <p className="text-slate-300 max-w-xl">
          Moto kurye ilanlarını oluştur, yönet ve hızlıca iş bul. Yüksek
          kaliteli modern bir marketplace platformuna hoş geldin.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            to="/listings/create"
            className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition"
          >
            İlan Ver
          </Link>

          <Link
            to="/dashboard"
            className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
          >
            Panelime Git
          </Link>
        </div>
      </div>

      {/* Öne çıkan yönlendirmeler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/listings/create"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-2">İlan Oluştur</h2>
          <p className="text-sm text-slate-600">
            Moto kuryeler için hızlıca ilan oluşturabilirsin.
          </p>
        </Link>

        <Link
          to="/my-listings"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-2">İlanlarım</h2>
          <p className="text-sm text-slate-600">
            Yayında olan veya bekleyen ilanlarını yönet.
          </p>
        </Link>

        <Link
          to="/dashboard"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-2">Kullanıcı Paneli</h2>
          <p className="text-sm text-slate-600">
            Hesap bilgilerini, ilanlarını ve bildirimlerini kontrol et.
          </p>
        </Link>
      </div>

      <HomeNewsPreview />
    </div>
  );
}
