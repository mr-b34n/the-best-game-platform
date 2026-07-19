import {
    faUsers, faHouse, faBookmark, faGamepad,
    faAngleDown, faGear, faPlus, faCircle,
} from "@fortawesome/free-solid-svg-icons"
import { faHubspot } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

import cs2Logo from "../../assets/logos/cs2-logo.webp";
import rdr2Logo from "../../assets/logos/rdr2-logo.png";
import raftLogo from "../../assets/logos/raft-logo.png";
import userAvatar from "../../assets/logos/raft-logo.png";

// ─── Style tokens ─────────────────────────────────────────────────────────────
const navItem = `
    w-full flex flex-row items-center gap-3 px-3 py-2.5
    rounded-xl text-sm font-medium text-text-muted
    bg-transparent hover:bg-surface-hover hover:text-text
    transition-colors duration-150 cursor-pointer select-none
`;
const navItemActive = `
    w-full flex flex-row items-center gap-3 px-3 py-2.5
    rounded-xl text-sm font-semibold
    bg-primary-soft text-primary cursor-pointer select-none
`;
const sectionLabel = `
    px-3 pt-4 pb-1.5
    text-[10px] font-bold uppercase tracking-widest text-text-faint
`;

// ─── Mock: currently playing ────────────────────────────────────────────────
const CURRENT_GAME = {
    name: "Raft",
    logo: raftLogo,
    duration: "2h 14m",
    sessionLabel: "Current session",
};

export const LeftBar = () => {
    const [gamesDrop, setGamesDrop] = useState<boolean>(true);
    const [activePage, setActivePage] = useState<string>("home");

    return (
        <div className="
            w-full h-fit flex flex-col overflow-hidden
            bg-surface/90 backdrop-blur-md
            border border-border
            rounded-2xl
        ">

            {/* ── Profile card ──────────────────────────────────── */}
            <div className="flex flex-row items-center gap-3 px-4 py-3
                border-b border-border
                cursor-pointer hover:bg-surface-hover transition-colors duration-150"
            >
                <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-full ring-2 ring-primary/30 shrink-0 object-cover"
                />
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                    <p className="font-semibold text-sm text-text truncate">User123</p>
                    <p className="text-xs text-text-faint">View profile</p>
                </div>
            </div>

            {/* ── Game Activity widget ───────────────────────────── */}
            <div className="px-3 pt-3">
                <div className="
                    flex flex-row items-center gap-3 px-3 py-2.5
                    rounded-xl
                    bg-success-500/8 dark:bg-success-500/10
                    border border-success-500/20
                ">
                    {/* Game logo */}
                    <div className="relative shrink-0">
                        <img
                            src={CURRENT_GAME.logo}
                            alt={CURRENT_GAME.name}
                            className="w-9 h-9 rounded-lg object-cover"
                        />
                        {/* Live indicator */}
                        <span className="absolute -top-1 -right-1
                            w-3 h-3 rounded-full bg-success-500
                            ring-2 ring-surface animate-pulse"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-row items-center gap-1.5">
                            <FontAwesomeIcon
                                icon={faCircle}
                                className="text-[6px] text-success-500"
                            />
                            <p className="text-[10px] font-bold uppercase tracking-wide
                                text-success-500">
                                Playing now
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-text truncate">
                            {CURRENT_GAME.name}
                        </p>
                        <p className="text-[11px] text-text-faint">
                            {CURRENT_GAME.sessionLabel} · {CURRENT_GAME.duration}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Create post ───────────────────────────────────── */}
            <div className="px-3 pt-2.5 pb-1">
                <button
                    onClick={() => document.getElementById("create-post")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className="
                    w-full flex flex-row items-center justify-center gap-2
                    px-3 py-2 rounded-xl
                    bg-primary hover:bg-primary-hover
                    text-white text-sm font-semibold
                    shadow-[0_2px_10px_rgba(124,77,255,0.35)]
                    hover:shadow-[0_4px_16px_rgba(124,77,255,0.45)]
                    hover:-translate-y-0.5
                    transition-all duration-150 cursor-pointer
                ">
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    <span>Create post</span>
                </button>
            </div>

            {/* ── Menu section ──────────────────────────────────── */}
            <p className={sectionLabel}>Menu</p>
            <div className="flex flex-col gap-1 px-2 pb-1">
                <button
                    onClick={() => setActivePage("home")}
                    className={activePage === "home" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faHouse} className="w-4 shrink-0" />
                    <span>Home</span>
                </button>

                <button
                    onClick={() => setActivePage("community")}
                    className={activePage === "community" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faUsers} className="w-4 shrink-0" />
                    <span>Community</span>
                </button>

                <button
                    onClick={() => setActivePage("bookmarks")}
                    className={activePage === "bookmarks" ? navItemActive : navItem}
                >
                    <FontAwesomeIcon icon={faBookmark} className="w-4 shrink-0" />
                    <span>Bookmarks</span>
                </button>

                {/* Squad — with notification badge */}
                <button
                    onClick={() => setActivePage("squad")}
                    className={`${activePage === "squad" ? navItemActive : navItem} justify-between`}
                >
                    <div className="flex flex-row items-center gap-3">
                        <FontAwesomeIcon icon={faHubspot} className="w-4 shrink-0" />
                        <span>My squad</span>
                    </div>
                    <span className="text-[10px] font-bold bg-accent-500 text-white
                        rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                        3
                    </span>
                </button>
            </div>

            {/* ── Library section ───────────────────────────────── */}
            <p className={sectionLabel}>Library</p>
            <div className="flex flex-col gap-1 px-2 pb-2">

                {/* My Games toggle */}
                <div
                    onClick={() => setGamesDrop(!gamesDrop)}
                    className={`${navItem} justify-between ${gamesDrop ? "bg-surface-hover text-text" : ""}`}
                >
                    <div className="flex flex-row items-center gap-3">
                        <FontAwesomeIcon icon={faGamepad} className="w-4 shrink-0" />
                        <span>My Games</span>
                    </div>
                    <FontAwesomeIcon
                        icon={faAngleDown}
                        className={`text-xs text-text-faint transition-transform duration-200
                            ${gamesDrop ? "rotate-180" : "rotate-0"}`}
                    />
                </div>

                {/* Games dropdown list */}
                {gamesDrop && (
                    <div className="flex flex-col gap-0.5 pl-10 pr-2 pb-1">
                        {[
                            { logo: raftLogo,  label: "Raft",  active: true  },
                            { logo: rdr2Logo,  label: "RDR 2", active: false },
                            { logo: cs2Logo,   label: "CS 2",  active: false },
                        ].map(({ logo, label, active }) => (
                            <div
                                key={label}
                                className={`flex flex-row items-center gap-2.5 px-2 py-1.5
                                    rounded-lg text-sm
                                    hover:bg-surface-hover
                                    transition-colors duration-150 cursor-pointer
                                    ${active ? "text-text font-medium" : "text-text-muted"}`}
                            >
                                <div className="relative shrink-0">
                                    <img src={logo} alt={label}
                                        className="w-4 h-4 rounded object-cover" />
                                    {/* Green dot for currently-playing game */}
                                    {active && (
                                        <span className="absolute -top-0.5 -right-0.5
                                            w-1.5 h-1.5 rounded-full bg-success-500
                                            ring-1 ring-surface" />
                                    )}
                                </div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Footer ────────────────────────────────────────── */}
            <div className="border-t border-border px-2 py-2">
                <button className={navItem}>
                    <FontAwesomeIcon icon={faGear} className="w-4 shrink-0" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    )
}