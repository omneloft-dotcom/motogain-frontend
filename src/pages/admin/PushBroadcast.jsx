import { useEffect, useRef, useState } from "react";
import adminNotificationsApi from "../../api/adminNotificationsApi";

const typeOptions = [
  { value: "admin_announcement", label: "Genel Duyuru" },
  { value: "security", label: "Guvenlik Bildirimi" },
  { value: "listing_status", label: "Ilan Durum Bildirimi" },
];

const typeLabelMap = typeOptions.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const channelLabelMap = {
  both: "Push + Uygulama Ici",
  push: "Sadece Push",
  in_app: "Sadece Uygulama Ici",
};

const audienceLabelMap = {
  all_users: "Tum Kullanicilar",
  selected_users: "Secili Kullanicilar",
};

const statusLabelMap = {
  sent: "Gonderildi",
  failed: "Basarisiz",
  draft: "Taslak",
};

const statusClassMap = {
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-700",
};

const emojiGroups = [
  { label: "Duyuru", items: ["📢", "📣"] },
  { label: "Kazanc", items: ["💸", "💰"] },
  { label: "Verimlilik", items: ["⚡", "🎯"] },
  { label: "Kampanya", items: ["🔥", "🎁"] },
  { label: "Dikkat / Uyari", items: ["🚨", "✅"] },
  { label: "Sans / Vurgu", items: ["🍀", "⭐"] },
  { label: "Kurye / Arac", items: ["🏍", "🛵"] },
];

const templatePresets = [
  {
    key: "earning_tip",
    label: "Kazanc Ipucu",
    title: "💸 Kazancini Arttir",
    body: "⚡ Kisa molalari optimize ederek saatlik verimini yukselt.",
    longBody:
      "🎯 Yogun saatleri oncele, teslimat rotani sade tut ve bekleme suresini azaltarak gunluk net kazancini yukseltebilirsin.",
    type: "admin_announcement",
    deeplink: "earnings",
  },
  {
    key: "campaign",
    label: "Kampanya",
    title: "🔥 Yeni Kampanya Basladi",
    body: "🎁 Bu hafta belirli gorevlerde ekstra odul firsati seni bekliyor.",
    longBody:
      "📣 Kampanya kosullarini kontrol et, uygun gorevleri sec ve bonuslardan maksimum fayda sagla.",
    type: "admin_announcement",
    deeplink: "announcements",
  },
  {
    key: "efficiency",
    label: "Verimlilik",
    title: "⚡ Verimlilik Hatirlatmasi",
    body: "🎯 Planli rota ve dogru zamanlama ile gunu daha guclu kapat.",
    longBody:
      "✅ Teslimat bolgelerini onceliklendirmek, yakit ve zaman maliyetini dusurerek performansini dengeler.",
    type: "admin_announcement",
    deeplink: "earnings",
  },
  {
    key: "system",
    label: "Sistem Duyurusu",
    title: "📢 Sistem Duyurusu",
    body: "✅ Hizmet kalitesi icin planli bir guncelleme uygulanacaktir.",
    longBody:
      "🚨 Kisa sureli etkiler gorulebilir. Islem tamamlandiginda uygulama ici duyuru ile bilgilendirme yapilacaktir.",
    type: "admin_announcement",
    deeplink: "announcements",
  },
];

const truncate = (text = "", limit = 120) => {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const safeDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
};

export default function PushBroadcast() {
  const [type, setType] = useState("admin_announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [longBody, setLongBody] = useState("");
  const [deeplink, setDeeplink] = useState("");
  const [channel, setChannel] = useState("both");
  const [audienceType, setAudienceType] = useState("all_users");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [activeField, setActiveField] = useState("body");

  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const longBodyRef = useRef(null);

  const summary = {
    total: history.length,
    success: history.filter((item) => item?.status === "sent").length,
    failed: history.filter((item) => item?.status === "failed").length,
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const list = await adminNotificationsApi.list();
      setHistory(list);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    adminNotificationsApi
      .detail(activeId)
      .then(setActiveDetail)
      .catch(() => setActiveDetail(null));
  }, [activeId]);

  const setFieldValue = (field, value) => {
    if (field === "title") setTitle(value);
    if (field === "body") setBody(value);
    if (field === "longBody") setLongBody(value);
  };

  const getFieldValue = (field) => {
    if (field === "title") return title;
    if (field === "longBody") return longBody;
    return body;
  };

  const getFieldRef = (field) => {
    if (field === "title") return titleRef;
    if (field === "longBody") return longBodyRef;
    return bodyRef;
  };

  const insertEmojiToField = (field, emoji) => {
    const ref = getFieldRef(field);
    const current = getFieldValue(field) || "";
    const el = ref.current;

    if (el && typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = `${current.slice(0, start)}${emoji}${current.slice(end)}`;
      setFieldValue(field, next);

      requestAnimationFrame(() => {
        try {
          el.focus();
          const cursor = start + emoji.length;
          el.setSelectionRange(cursor, cursor);
        } catch {
          // Fallback: keep value update only.
        }
      });
      return;
    }

    setFieldValue(field, `${current}${emoji}`);
  };

  const handleEmojiInsert = (emoji) => {
    insertEmojiToField(activeField || "body", emoji);
  };

  const applyTemplate = (preset) => {
    if (!preset) return;
    setType(preset.type || type);
    setTitle(preset.title || "");
    setBody(preset.body || "");
    setLongBody(preset.longBody || "");
    setDeeplink(preset.deeplink || "");
    setActiveField("body");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || !body.trim()) {
      setResult({ success: false, message: "Baslik ve kisa bildirim metni zorunludur." });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await adminNotificationsApi.send({
        type,
        title: title.trim(),
        body: body.trim(),
        longBody: longBody.trim() || undefined,
        deeplink: deeplink || undefined,
        channel,
        audienceType,
      });

      if (res?.success) {
        setResult({
          success: true,
          message: `Gonderim tamamlandi. Basarili: ${res?.data?.sentCount || 0}, Basarisiz: ${res?.data?.failCount || 0}`,
          payload: res?.data || null,
        });
        setTitle("");
        setBody("");
        setLongBody("");
        setDeeplink("");
        await loadHistory();
      } else {
        setResult({ success: false, message: res?.message || "Gonderim tamamlanamadi." });
      }
    } catch (err) {
      setResult({ success: false, message: err?.response?.data?.error?.message || "Beklenmeyen bir hata olustu." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Push Console</h1>
            <p className="text-sm text-slate-600 mt-1">Bildirim gonderimi, onizleme ve gecmis takibini tek panelden yonetin.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              <p className="text-xs text-slate-500">Toplam</p>
              <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
              <p className="text-xs text-emerald-700">Basarili</p>
              <p className="text-lg font-semibold text-emerald-700">{summary.success}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2">
              <p className="text-xs text-rose-700">Basarisiz</p>
              <p className="text-lg font-semibold text-rose-700">{summary.failed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSend} className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
          <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h2 className="text-sm font-semibold text-slate-900">1. Mesaj Turu</h2>
            <p className="text-xs text-slate-500 mt-1">Bildirim kategorisi metin etiketlerini ve beklentiyi belirler.</p>
            <div className="mt-3">
              <label className="block mb-2 text-sm font-medium text-slate-700">Bildirim Turu</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h2 className="text-sm font-semibold text-slate-900">2. Kanal ve Hedef</h2>
            <p className="text-xs text-slate-500 mt-1">Bildirim hangi kanallarda ve hangi kitleye gidecek secin.</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Gonderim Kanali</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="both">Push + Uygulama Ici</option>
                  <option value="push">Sadece Push</option>
                  <option value="in_app">Sadece Uygulama Ici</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Hedef Kitle</label>
                <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
                  <option value="all_users">Tum Kullanicilar</option>
                  <option value="selected_users">Secili Kullanicilar (hazirlik)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h2 className="text-sm font-semibold text-slate-900">3. Icerik</h2>
            <p className="text-xs text-slate-500 mt-1">Push ve uygulama ici metinleri bu bolumden yonetin.</p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-slate-700">Hazir Template:</p>
                {templatePresets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyTemplate(preset)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-slate-700">Aktif Alan:</p>
                <button
                  type="button"
                  onClick={() => setActiveField("title")}
                  className={`px-2.5 py-1 text-xs rounded-full border ${activeField === "title" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
                >
                  Baslik
                </button>
                <button
                  type="button"
                  onClick={() => setActiveField("body")}
                  className={`px-2.5 py-1 text-xs rounded-full border ${activeField === "body" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
                >
                  Kisa Metin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveField("longBody")}
                  className={`px-2.5 py-1 text-xs rounded-full border ${activeField === "longBody" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`}
                >
                  Uzun Icerik
                </button>
              </div>

              <div className="space-y-2">
                {emojiGroups.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 w-28">{group.label}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {group.items.map((emoji) => (
                        <button
                          key={`${group.label}-${emoji}`}
                          type="button"
                          onClick={() => handleEmojiInsert(emoji)}
                          className="h-8 min-w-8 px-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-base leading-none"
                          title={`${emoji} ekle`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Baslik</label>
                  <span className="text-xs text-slate-500">{title.length}/70</span>
                </div>
                <input
                  type="text"
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setActiveField("title")}
                  onClick={() => setActiveField("title")}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                  maxLength={70}
                  placeholder="Ornek: Yeni kampanya duyurusu"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Kisa Bildirim Metni</label>
                  <span className="text-xs text-slate-500">{body.length}/220</span>
                </div>
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onFocus={() => setActiveField("body")}
                  onClick={() => setActiveField("body")}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                  rows={3}
                  maxLength={220}
                  placeholder="Push bildirimi olarak gorunecek kisa metin"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Uygulama Ici Icerik</label>
                  <span className="text-xs text-slate-500">{longBody.length}/1000</span>
                </div>
                <textarea
                  ref={longBodyRef}
                  value={longBody}
                  onChange={(e) => setLongBody(e.target.value)}
                  onFocus={() => setActiveField("longBody")}
                  onClick={() => setActiveField("longBody")}
                  className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                  rows={4}
                  maxLength={1000}
                  placeholder="Detayli metin. Bos kalirsa kisa metin kullanilir."
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <h2 className="text-sm font-semibold text-slate-900">4. Yonlendirme</h2>
            <p className="text-xs text-slate-500 mt-1">Bildirim tiklandiginda acilacak hedef ekrani secin.</p>
            <div className="mt-3">
              <label className="block mb-2 text-sm font-medium text-slate-700">Deeplink</label>
              <select value={deeplink} onChange={(e) => setDeeplink(e.target.value)} className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
                <option value="">Ana Sayfa</option>
                <option value="announcements">Duyurular</option>
                <option value="news">Haberler</option>
                <option value="earnings">Kazanc</option>
              </select>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 bg-white">
            <h2 className="text-sm font-semibold text-slate-900">5. Gonderim Aksiyonu</h2>
            <p className="text-xs text-slate-500 mt-1">Alanlar dogruysa bildirimi hemen gonderebilirsiniz.</p>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 font-medium"
              >
                {loading ? "Gonderiliyor..." : "Bildirim Gonder"}
              </button>
              <span className="text-xs text-slate-500">Gonderim sirasinda buton kilitlenir, tekrar gonderim engellenir.</span>
            </div>

            {result && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${result.success ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {result.message}
              </div>
            )}
          </section>
        </form>

        <aside className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm border border-slate-700">
            <h2 className="text-sm uppercase tracking-wide text-slate-300">Canli Onizleme</h2>

            <div className="mt-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-xs text-slate-400">Mobil Push</p>
              <p className="font-semibold mt-1 break-words">{title || "Baslik"}</p>
              <p className="text-sm text-slate-300 mt-1 break-words">{body || "Kisa push metni"}</p>
            </div>

            <div className="mt-3 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">Uygulama Ici</p>
                <span className="px-2 py-1 rounded-full text-[11px] bg-slate-700 text-slate-200">
                  {typeLabelMap[type] || "Bildirim"}
                </span>
              </div>
              <p className="font-semibold mt-1 break-words">{title || "Baslik"}</p>
              <p className="text-sm text-slate-300 mt-1 break-words">{longBody || body || "Uygulama ici icerik"}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Sonuc Ozeti</h3>
            <div className="mt-3 text-sm text-slate-700 space-y-2">
              <div className="flex justify-between"><span>Kanal</span><span className="font-medium">{channelLabelMap[channel] || channel}</span></div>
              <div className="flex justify-between"><span>Hedef Kitle</span><span className="font-medium">{audienceLabelMap[audienceType] || audienceType}</span></div>
              <div className="flex justify-between"><span>Yonlendirme</span><span className="font-medium">{deeplink || "Ana Sayfa"}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 text-sm space-y-2">
              <p className="font-medium text-slate-800">Son Gonderim</p>
              {!result ? (
                <p className="text-slate-500 text-xs">Henuz gonderim sonucu yok.</p>
              ) : (
                <>
                  <p className={`${result.success ? "text-emerald-700" : "text-rose-700"}`}>{result.message}</p>
                  {result?.payload && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="rounded-lg bg-slate-50 p-2">Basarili: <span className="font-semibold text-emerald-700">{result.payload.sentCount ?? 0}</span></div>
                      <div className="rounded-lg bg-slate-50 p-2">Basarisiz: <span className="font-semibold text-rose-700">{result.payload.failCount ?? 0}</span></div>
                      <div className="rounded-lg bg-slate-50 p-2 col-span-2">Token: <span className="font-semibold">{result.payload.totalTokens ?? 0}</span></div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {activeDetail && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Secili Gecmis Kaydi</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p><span className="text-slate-500">Baslik:</span> {activeDetail?.title || "-"}</p>
                <p><span className="text-slate-500">Tur:</span> {typeLabelMap[activeDetail?.type] || activeDetail?.type || "-"}</p>
                <p><span className="text-slate-500">Kanal:</span> {channelLabelMap[activeDetail?.channel] || activeDetail?.channel || "-"}</p>
                <p><span className="text-slate-500">Hedef:</span> {activeDetail?.targetCount ?? 0}</p>
                <p><span className="text-slate-500">Basarili:</span> {activeDetail?.successCount ?? 0}</p>
                <p><span className="text-slate-500">Basarisiz:</span> {activeDetail?.failureCount ?? 0}</p>
                <p><span className="text-slate-500">Durum:</span> {statusLabelMap[activeDetail?.status] || activeDetail?.status || "-"}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Gonderim Gecmisi</h2>
        {historyLoading ? (
          <div className="text-slate-500">Yukleniyor...</div>
        ) : history.length === 0 ? (
          <div className="text-slate-500">Henuz gonderim yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2 pr-4">Tarih</th>
                  <th className="py-2 pr-4">Tip</th>
                  <th className="py-2 pr-4">Baslik</th>
                  <th className="py-2 pr-4">Hedef Kitle</th>
                  <th className="py-2 pr-4">Kanal</th>
                  <th className="py-2 pr-4">Hedef</th>
                  <th className="py-2 pr-4">Basari</th>
                  <th className="py-2 pr-4">Fail</th>
                  <th className="py-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${activeId === item._id ? "bg-slate-50" : ""}`} onClick={() => setActiveId(item._id)}>
                    <td className="py-2 pr-4 text-slate-600 whitespace-nowrap">{safeDate(item.createdAt)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{typeLabelMap[item.type] || item.type}</td>
                    <td className="py-2 pr-4 font-medium text-slate-800 max-w-[280px] truncate" title={item.title}>{item.title}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{audienceLabelMap[item.audienceType] || item.audienceType || "-"}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{channelLabelMap[item.channel] || item.channel}</td>
                    <td className="py-2 pr-4">{item.targetCount ?? 0}</td>
                    <td className="py-2 pr-4 text-emerald-700">{item.successCount ?? 0}</td>
                    <td className="py-2 pr-4 text-rose-700">{item.failureCount ?? 0}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusClassMap[item.status] || "bg-slate-100 text-slate-700"}`}>
                        {statusLabelMap[item.status] || item.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeDetail && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Secili kayit ozeti</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{activeDetail?.title || "-"}</p>
            <p className="text-sm text-slate-700 mt-1">{truncate(activeDetail?.longBody || activeDetail?.body || "") || "Icerik bulunamadi."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
