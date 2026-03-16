export const courierGuideCategoryCards = [
  {
    id: "legal_card",
    sectionId: "legal",
    title: "Yasal Şartlar",
    description: "Başlangıç için temel yasal gereklilikler",
    order: 1,
  },
  {
    id: "license_card",
    sectionId: "license",
    title: "Ehliyet ve Belgeler",
    description: "Ehliyet sınıfı ve temel evraklar",
    order: 2,
  },
  {
    id: "vehicle_card",
    sectionId: "vehicle",
    title: "Araç ve Ekipman",
    description: "Motosiklet ve gerekli ekipmanlar",
    order: 3,
  },
  {
    id: "work_card",
    sectionId: "work",
    title: "Çalışma Düzeni",
    description: "Temel çalışma yapısı ve ödeme akışı",
    order: 4,
  },
];

export const courierGuideFaqSections = [
  {
    sectionId: "legal",
    sectionTitle: "Yasal Şartlar",
    order: 1,
    items: [
      {
        id: "legal-1",
        order: 1,
        question: "Moto kurye olmak için yasal olarak ne gerekir?",
        answer:
          "Genel olarak sürücü belgesi, uygun araç evrakları ve çalışma modeline göre gerekli resmi kayıtlar gerekir. Güncel mevzuat ve platform koşulları esas alınmalıdır.",
      },
      {
        id: "legal-2",
        order: 2,
        question: "Bireysel mi şirket üzerinden mi çalışılabilir?",
        answer:
          "Bu, çalışılacak platformun modeline göre değişir. Bazı modellerde şahıs şirketi veya fatura kesme zorunluluğu bulunabilir.",
      },
    ],
  },
  {
    sectionId: "license",
    sectionTitle: "Ehliyet ve Belgeler",
    order: 2,
    items: [
      {
        id: "license-1",
        order: 1,
        question: "Hangi ehliyet sınıfı gerekir?",
        answer:
          "Motosiklet kullanımı için uygun sınıf sürücü belgesi gerekir. Araç tipi ve motor hacmine göre sınıf koşulları değişebilir.",
      },
      {
        id: "license-2",
        order: 2,
        question: "Temel evraklar nelerdir?",
        answer:
          "Kimlik, ehliyet, ruhsat, trafik sigortası ve gerekiyorsa çalışma modeline uygun vergi/fatura belgeleri istenebilir.",
      },
    ],
  },
  {
    sectionId: "vehicle",
    sectionTitle: "Araç ve Ekipman",
    order: 3,
    items: [
      {
        id: "vehicle-1",
        order: 1,
        question: "Güvenli çalışma için hangi ekipmanlar önerilir?",
        answer:
          "Onaylı kask, korumalı mont, eldiven, görünürlük ekipmanları ve hava koşullarına uygun ek korumalar güvenlik için kritik önemdedir.",
        relatedAction: {
          title: "Güvenlik ekipmanlarına göz at",
          description: "Pazaryerinde ekipman kategorisindeki ilanları inceleyebilirsin.",
          ctaLabel: "Ekipman ilanlarını aç",
          entryPointKey: "equipment",
        },
      },
      {
        id: "vehicle-2",
        order: 2,
        question: "Kurye çantası seçiminde nelere dikkat edilmeli?",
        answer:
          "Hacim, su geçirmezlik, denge, sabitleme kalitesi ve gece görünürlüğü dikkat edilmesi gereken başlıca kriterlerdir.",
        relatedAction: {
          title: "Kurye çantası ilanları",
          description: "Uygun hacimde ve dayanıklı çantaları listeleyebilirsin.",
          ctaLabel: "Çantaları gör",
          entryPointKey: "courier_bags",
        },
      },
    ],
  },
  {
    sectionId: "work",
    sectionTitle: "Çalışma Düzeni",
    order: 4,
    items: [
      {
        id: "work-1",
        order: 1,
        question: "Kazanç takibi nasıl daha düzenli tutulur?",
        answer:
          "Günlük gelir, gider, teslimat adedi ve saat bazlı performansın düzenli girilmesi; haftalık ve aylık analizlerde daha doğru sonuç verir.",
      },
      {
        id: "work-2",
        order: 2,
        question: "Verimi artırmak için temel ipuçları nelerdir?",
        answer:
          "Pik saatleri izlemek, rota planlaması yapmak, mola ve yakıt yönetimini düzenli tutmak verimliliği artırmaya yardımcı olur.",
      },
    ],
  },
];

export const marketplaceEntryPoints = {
  equipment: {
    enabled: true,
    routeName: "/listings",
    params: { parentCategory: "Ekipman" },
  },
  phones: {
    enabled: true,
    routeName: "/listings",
    params: { q: "telefon" },
  },
  courier_bags: {
    enabled: true,
    routeName: "/listings",
    params: { q: "kurye çantası" },
  },
  helmets: {
    enabled: true,
    routeName: "/listings",
    params: { category: "Kask" },
  },
  motorcycle_listings: {
    enabled: false,
    routeName: "/listings",
    params: { parentCategory: "Taşıtlar" },
  },
};
