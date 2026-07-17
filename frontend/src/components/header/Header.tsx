import { useNavigate } from '@tanstack/react-router'
import { useThemeStore } from '../../stores/useThemeStore';
import { Search } from '../search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faBell,
    faSun,
    faMoon,
} from "@fortawesome/free-regular-svg-icons";

const isLoggedIn = true; // TODO: thay bằng state auth thật

// ─── Floating card base ────────────────────────────────────────────────────────
const floatCard = `
    bg-surface/90 backdrop-blur-md
    border border-border
    shadow-[0_4px_16px_rgba(0,0,0,0.07)]
    dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
    transition-all duration-200 ease-out
`;

export const Header = () => {
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const navigate = useNavigate();

    return (
        // Header wrapper — full-width row, no background itself
        <header className="w-full sticky top-0 z-20 flex flex-row items-center gap-3 px-4 py-3">

            {/* ── Part 1: Logo ──────────────────────────────────────── */}
            <div
                className={`shrink-0 ${floatCard} rounded-2xl px-4 py-2
                    cursor-pointer hover:-translate-y-0.5
                    hover:shadow-[0_6px_24px_rgba(124,77,255,0.18)]`}
                onClick={() => navigate({ to: '/' })}
            >
                <p className="text-xl font-extrabold tracking-tight text-primary select-none">
                    IndieG
                </p>
            </div>

            {/* ── Part 2: Search ────────────────────────────────────── */}
            <div className="flex-1 flex justify-center">
                <Search />
            </div>

            {/* ── Part 3: Action icons ──────────────────────────────── */}
            <div className={`shrink-0 ${floatCard} rounded-full px-2 py-2
                flex flex-row items-center gap-1`}>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === "light" ? "Switch to dark" : "Switch to light"}
                    className="w-9 h-9 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer"
                >
                    <FontAwesomeIcon icon={theme === "light" ? faSun : faMoon} />
                </button>

                {/* Notification bell */}
                <button
                    title="Notifications"
                    className="relative w-9 h-9 flex items-center justify-center rounded-full
                        text-text-muted
                        hover:bg-primary-soft hover:text-primary
                        transition-colors duration-150 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faBell} />
                    {/* Unread dot */}
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-like
                        ring-2 ring-surface" />
                </button>

                {/* Profile / Login */}
                {!isLoggedIn && (
                    <button
                        onClick={() => navigate({ to: "/auth" })}
                        title="Sign in"
                        className="w-9 h-9 flex items-center justify-center rounded-full
                            text-text-muted
                            hover:bg-primary-soft hover:text-primary
                            transition-colors duration-150 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faUserCircle} />
                    </button>
                )}
            </div>
        </header>
    )
}