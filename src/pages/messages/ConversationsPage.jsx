import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import messageApi from "../../api/messageApi";
import { useAuth } from "../../context/AuthProvider";

const ConversationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await messageApi.getConversations();
      setConversations(
        Array.isArray(res.conversations) ? res.conversations : []
      );
    } catch (err) {
      console.error("Konuşma listeleme hatası:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">{t("messages.title")}</h1>

      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {t("messages.noMessages")}
          </h2>
          <p className="text-slate-600 max-w-md">
            {t("messages.emptyStateDescription")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {conversations.map((c) => {
          const lastMessage =
            c.lastMessage?.content || c.lastMessage?.text || "";
          const otherUser =
            c.participants?.find((p) => p._id !== user?._id)?.name ||
            t("common.unknown");

          return (
            <Link
              key={c._id}
              to={`/messages/${c._id}`}
              className="block p-4 rounded-lg border bg-white hover:bg-gray-50 transition"
            >
              <div className="font-semibold text-gray-800">{otherUser}</div>

              <div className="text-gray-500 text-sm truncate mt-1">
                {lastMessage || t("messages.noMessages")}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsPage;
