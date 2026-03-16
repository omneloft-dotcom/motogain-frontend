import PageShell from "../components/layout/PageShell";

export default function Offers() {
  return (
    <PageShell
      title="Tekliflerim"
      description="Gönderdiğiniz ve aldığınız teklifleri buradan takip edebilirsiniz."
      intent="content"
    >
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-text-muted">
        Henüz teklif özeti yok. Yakında burada listelenecek.
      </div>
    </PageShell>
  );
}



