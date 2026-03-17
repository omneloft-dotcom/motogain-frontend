import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import { isSoftLaunch } from "../../utils/isSoftLaunch";
import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import Notice from "../../components/dashboard/Notice";
import WeatherBanner from "../../components/dashboard/WeatherBanner";
import PageShell from "../../components/layout/PageShell";
import TargetFavoriteIcon from "../../components/icons/TargetFavoriteIcon";

/**
 * Dashboard - Kullanıcı özet sayfası (FAZ 15)
 *
 * Features:
 * - Gerçek API verilerinden stat kartları
 * - Skeleton loading state
 * - Mobile responsive
 */

export default function Dashboard() {
  const { user, favorites, isAdmin } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // 🛡️ SAFE: Fallback for user.name
  const userName = user?.name || user?.firstName || user?.email?.split('@')[0] || 'Kullanıcı';

  useEffect(() => {
    if (user) {
      loadSummary();

      // Real-time updates from socket
      if (socket) {
        socket.on("inbox_update", loadSummary);
        return () => socket.off("inbox_update", loadSummary);
      }
    }
  }, [user, socket]);

  useEffect(() => {
    if (!isSoftLaunch) {
      setShowBetaNotice(false);
      return;
    }

    const dismissed = sessionStorage.getItem("softLaunchDashboardDismissed");
    if (dismissed !== "true") {
      setShowBetaNotice(true);
    }
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      logError("Dashboard - loadSummary", err);
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    // Show welcome notice on first login (when user has 0 listings)
    if (summary && summary.myListingsCount === 0) {
      const dismissed = localStorage.getItem("welcomeNoticeDismissed");
      if (dismissed !== "true") {
        setShowWelcome(true);
      }
    }
  }, [summary]);

  const dismissWelcome = () => {
    localStorage.setItem("welcomeNoticeDismissed", "true");
    setShowWelcome(false);
  };

  const dismissBetaNotice = () => {
    sessionStorage.setItem("softLaunchDashboardDismissed", "true");
    setShowBetaNotice(false);
  };

  if (!user) return null;

  // Loading state
  if (loading || !summary) {
    return (
      <PageShell
        title={`Hoş geldin, ${userName}!`}
        description="Dashboard yükleniyor..."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 animate-pulse"
            >
              <div className="h-4 bg-card-hover rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-card-hover rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  const stats = [
    {
      label: "Toplam İlanlarım",
      value: summary.totalListings,
      link: "/my-listings",
      icon: "📝",
    },
    {
      label: "Aktif İlanlarım",
      value: summary.activeListings,
      link: "/my-listings?status=approved",
      icon: "✅",
    },
    {
      label: "Okunmamış Mesajlar",
      value: summary.unreadMessagesCount,
      link: "/messages",
      icon: "💬",
      highlight: summary.unreadMessagesCount > 0,
    },
    {
      label: "Favorilerim",
      value: summary.favoriteCount,
      link: "/favorites",
      icon: <TargetFavoriteIcon isActive={true} size={24} />,
    },
    {
      label: "Kapatılan İlanlar",
      value: summary.closedListings,
      link: "/my-listings?status=closed",
      icon: "🔒",
    },
    {
      label: "Aktif Duyurular",
      value: summary.activeAnnouncements ?? 0,
      link: "/announcements",
      icon: "📢",
      highlight: summary.activeAnnouncements > 0,
    },
  ];

  return (
    <PageShell
      title={`Hoş geldin, ${userName}!`}
      description="Cordy dashboard'ına hoş geldin. Aşağıda özetlere göz atabilirsin."
    >

      {showBetaNotice && (
        <div className="mb-6">
          <Notice
            type="warning"
            message="Beta sürüm: Yeni özellikler kademeli olarak açılacaktır."
            onDismiss={dismissBetaNotice}
          />
        </div>
      )}

      {showWelcome && (
        <div className="mb-6">
          <Notice
            type="info"
            title="Hoş geldin"
            message="İlk ilanını ekleyerek başlayabilirsin. Sol menüden tüm özelliklere erişebilirsin."
            icon="👋"
            onDismiss={dismissWelcome}
          />
        </div>
      )}

      {/* Weather Banner */}
      <WeatherBanner />

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            link={stat.link}
            icon={stat.icon}
            highlight={stat.highlight}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <QuickActions />
      </div>

      {/* Admin Panel Link */}
      {isAdmin && (
        <Notice
          type="action"
          title="Admin Paneli"
          message="Platform yönetimi ve moderasyon araçları"
          action={
            <Link
              to="/admin/dashboard"
              className="bg-card text-text-primary px-6 py-3 rounded-lg hover:bg-card-hover transition-colors font-semibold whitespace-nowrap"
            >
              Panele Git →
            </Link>
          }
        />
      )}

      {/* Helpful Tip */}
      <div className="mt-8">
        <Notice
          type="info"
          title="Hızlı İpucu"
          message="Sol menüden tüm özelliklere erişebilirsin. İlan eklemek, favorilerini görüntülemek veya mesajlaşmak için ilgili bölümleri ziyaret et."
          icon="💡"
        />
      </div>
        </PageShell>
  );
}