import { Home, Moon, Music, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  favoritesActive?: boolean;
  onFavoritesClick?: () => void;
  onHomeClick?: () => void;
}

export default function Header({
  favoritesActive = false,
  onFavoritesClick,
  onHomeClick,
}: HeaderProps) {
  const { theme, toggleTheme, switchable } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/wavefm-logo.png"
            alt="WaveFM"
            className="w-10 h-10 md:w-12 md:h-12"
          />
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-brand">
              WaveFM
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-sans">Sintonize o que você gosta!</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8">
          <button
            onClick={onFavoritesClick}
            className={`font-sans text-sm transition-colors ${
              favoritesActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Favoritos
          </button>
          <a href="#" className="text-muted-foreground hover:text-primary font-sans text-sm transition-colors">
            Histórico
          </a>
        </nav>

        {/* Day/Night theme toggle + navigation + settings placeholder */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHomeClick}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Voltar ao início"
            title="Início"
          >
            <Home className="w-5 h-5 text-muted-foreground" />
          </button>
          {switchable && toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label={
                theme === "dark"
                  ? "Ativar tema claro (dia)"
                  : "Ativar tema escuro (noite)"
              }
              title={theme === "dark" ? "Modo dia" : "Modo noite"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}
          <button
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Configurações"
          >
            <Music className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
