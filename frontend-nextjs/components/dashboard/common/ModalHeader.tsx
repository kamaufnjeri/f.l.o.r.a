import { FaTimes } from "react-icons/fa";

export default function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="
        sticky top-0 z-20
        flex items-start justify-between
        gap-4
        px-6 py-5
        bg-white/80 backdrop-blur-md
        border-b border-gray-100
      "
    >
      {/* Left content */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-gray-500 leading-relaxed max-w-md">
            {description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close modal"
        className="
          group
          flex items-center justify-center
          h-9 w-9
          rounded-full
          border border-gray-200
          bg-white
          text-gray-500
          hover:bg-gray-50
          hover:text-gray-700
          hover:border-gray-300
          transition
          cursor-pointer
          active:scale-95
        "
      >
        <FaTimes className="text-sm group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
}