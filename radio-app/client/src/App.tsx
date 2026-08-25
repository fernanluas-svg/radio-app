import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import RadioPlayer from "./components/RadioPlayer";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider, usePlayer } from "./contexts/PlayerContext";
import Home from "./pages/Home";
import History from "./pages/History";

// Player persistente entre rotas: continua tocando ao navegar.
function PlayerRoot() {
  const { currentStation, close } = usePlayer();
  return <RadioPlayer station={currentStation} onClose={close} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/historico"} component={History} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <PlayerRoot />
          </TooltipProvider>
        </PlayerProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
