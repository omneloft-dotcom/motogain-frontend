import { Link } from "react-router-dom";
import { isSoftLaunch } from "../../utils/isSoftLaunch";

export default function LegalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 text-xs text-slate-600 py-3 px-4 mb-14 md:mb-0">
      <div className="max-w-6xl mx-auto space-y-2">
        {isSoftLaunch && (
          <div className="text-center text-amber-800">
            Cordy şu anda beta (soft launch) aşamasındadır.
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {year} Cordy</span>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              to="/privacy"
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              Gizlilik
            </Link>
            <Link
              to="/kvkk"
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              KVKK
            </Link>
            <Link
              to="/terms"
              className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}




