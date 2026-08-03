import { Music } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/manus-storage/radio-logo_600eb984.png"
            alt="Radio App Brasil"
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              Radio
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-sans">Brasil</p>
          </div>
        </div>

        {/* Navigation (placeholder for future features) */}
        <nav className="hidden md:flex gap-8">
          <a href="#" className="text-gray-600 hover:text-primary font-sans text-sm transition-colors">
            Favoritos
          </a>
          <a href="#" className="text-gray-600 hover:text-primary font-sans text-sm transition-colors">
            Histórico
          </a>
        </nav>

        {/* Placeholder for settings/theme toggle */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Configurações"
          >
            <Music className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
