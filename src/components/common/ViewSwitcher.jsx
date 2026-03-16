export default function ViewSwitcher({ view, setView }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className={`px-3 py-1 rounded ${
          view === "grid"
            ? "bg-slate-800 text-white"
            : "bg-slate-200 text-slate-700"
        }`}
        onClick={() => setView("grid")}
      >
        Grid
      </button>

      <button
        className={`px-3 py-1 rounded ${
          view === "list"
            ? "bg-slate-800 text-white"
            : "bg-slate-200 text-slate-700"
        }`}
        onClick={() => setView("list")}
      >
        Liste
      </button>
    </div>
  );
}
