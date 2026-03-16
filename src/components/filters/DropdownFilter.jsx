export default function DropdownFilter({ options, onSelect, onClose }) {
  return (
    <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-[9999] p-2">
      <ul className="flex flex-col gap-1">
        {options.map((opt, i) => {
          const value = Array.isArray(opt) ? opt[1] : opt;
          const label = Array.isArray(opt) ? opt[0] : opt;

          return (
            <li
              key={i}
              onClick={() => {
                onSelect(value);
                onClose();
              }}
              className="px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm"
            >
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
