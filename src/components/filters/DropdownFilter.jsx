export default function DropdownFilter({ options, onSelect, onClose }) {
  return (
    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-[9999] p-2">
      <ul className="flex flex-col gap-1">
        {options.map((opt, i) => {
          const normalized = Array.isArray(opt)
            ? { label: opt[0], value: opt[1], disabled: false }
            : typeof opt === "object"
            ? opt
            : { label: opt, value: opt, disabled: false };

          return (
            <li
              key={i}
              onClick={() => {
                if (normalized.disabled) return;
                onSelect(normalized.value);
                onClose();
              }}
              className={`px-3 py-2 rounded-lg text-sm ${
                normalized.disabled
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "cursor-pointer hover:bg-gray-100"
              }`}
            >
              <span>{normalized.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
