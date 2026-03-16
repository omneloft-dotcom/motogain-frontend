import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/layout/PageShell";
import {
  courierGuideCategoryCards,
  courierGuideFaqSections,
  marketplaceEntryPoints,
} from "./courierGuideData";

const funnelShortlist = ["equipment", "phones", "courier_bags", "helmets"];

const funnelContent = {
  equipment: {
    title: "Kurye ekipmanları",
    description: "Reflektif yelek, ekipman ve diğer ihtiyaçlara göz at",
  },
  phones: {
    title: "Telefon ilanları",
    description: "Kurye kullanımına uygun cihazları incele",
  },
  courier_bags: {
    title: "Kurye çantaları",
    description: "Taşıma için uygun çanta ilanlarını gör",
  },
  helmets: {
    title: "Kask ilanları",
    description: "Koruyucu ekipman ve kask ilanlarını incele",
  },
};

export default function CourierGuidePage() {
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const [openMap, setOpenMap] = useState({});

  const categoryCards = useMemo(
    () => [...(Array.isArray(courierGuideCategoryCards) ? courierGuideCategoryCards : [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    []
  );

  const faqSections = useMemo(
    () => [...(Array.isArray(courierGuideFaqSections) ? courierGuideFaqSections : [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    []
  );

  const funnelItems = useMemo(
    () =>
      funnelShortlist
        .map((key) => ({ key, entryPoint: marketplaceEntryPoints[key], ...funnelContent[key] }))
        .filter((item) => Boolean(item.entryPoint?.enabled)),
    []
  );

  const toggleFaq = (key) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = (sectionId) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFunnelNavigate = (entryPoint) => {
    if (!entryPoint?.routeName) return;
    const params = new URLSearchParams(entryPoint.params || {}).toString();
    navigate(params ? `${entryPoint.routeName}?${params}` : entryPoint.routeName);
  };

  return (
    <PageShell
      title="Kurye Rehberi"
      description="Moto kurye olmak için gereken temel bilgi ve şartlar"
      intent="content"
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm leading-6 text-text-secondary">
            Bu bölüm, moto kurye olarak çalışmak isteyen kişiler için temel yasal ve pratik gereklilikleri açıklar. Bilgiler genel bilgilendirme amaçlıdır.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Kategoriler</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryCards.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToSection(category.sectionId)}
                className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:bg-card-hover"
              >
                <p className="text-sm font-semibold text-text-primary">{category.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{category.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          {faqSections.map((section) => (
            <div
              key={section.sectionId}
              ref={(el) => {
                sectionRefs.current[section.sectionId] = el;
              }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <h3 className="mb-3 text-base font-semibold text-text-primary">{section.sectionTitle}</h3>
              <div className="space-y-2">
                {[...(Array.isArray(section.items) ? section.items : [])]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => {
                    const itemKey = `${section.sectionId}-${item.id}`;
                    const isOpen = Boolean(openMap[itemKey]);
                    const relatedAction = item.relatedAction || null;
                    const relatedEntryPoint = relatedAction
                      ? marketplaceEntryPoints[relatedAction.entryPointKey]
                      : null;
                    const showRelatedAction =
                      isOpen &&
                      Boolean(relatedAction) &&
                      Boolean(relatedEntryPoint?.enabled);

                    return (
                      <div key={itemKey} className="rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => toggleFaq(itemKey)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium text-text-primary">{item.question}</span>
                          <span className="text-text-muted">{isOpen ? "−" : "+"}</span>
                        </button>
                        {isOpen ? (
                          <div className="border-t border-border px-4 py-3 text-sm leading-6 text-text-secondary">
                            {item.answer}
                          </div>
                        ) : null}
                        {showRelatedAction ? (
                          <div className="border-t border-border px-4 py-3">
                            <div className="rounded-lg border border-border/60 bg-background p-3">
                              <p className="text-sm font-semibold text-text-primary">{relatedAction.title}</p>
                              <p className="mt-1 text-xs leading-5 text-text-secondary">{relatedAction.description}</p>
                              <button
                                type="button"
                                onClick={() => handleFunnelNavigate(relatedEntryPoint)}
                                className="mt-2 text-xs font-semibold text-primary hover:underline"
                              >
                                {relatedAction.ctaLabel}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-warning bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Önemli Bilgilendirme</h3>
          <p className="text-sm leading-6 text-text-secondary">
            Bu içerik genel bilgilendirme amacı taşır. Güncel yasal yükümlülükler, çalışma modeli ve belge gereklilikleri başvuru yapılacak yapı ve resmi mevzuata göre değişebilir.
          </p>
        </section>

        {funnelItems.length > 0 ? (
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <h3 className="text-sm font-semibold text-text-primary">Kurye için Gerekenler</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Cordy'de kurye ekipmanları ve ilgili ilanlara göz atabilirsin.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {funnelItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleFunnelNavigate(item.entryPoint)}
                  className="rounded-lg border border-border bg-background p-3 text-left transition-all hover:bg-card-hover"
                >
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">{item.description}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
