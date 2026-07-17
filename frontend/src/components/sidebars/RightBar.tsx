import { faArrowTrendUp, faCircle, faGamepad } from "@fortawesome/free-solid-svg-icons"
import { faLightbulb as faLightbulbOutline } from "@fortawesome/free-regular-svg-icons";
import { faLightbulb as faLightbulbSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useThemeStore } from "../../stores/useThemeStore";

import avatarGame from "../../assets/logos/raft-logo.png";
import raftLogo from "../../assets/logos/raft-logo.png";
import rdr2Logo from "../../assets/logos/rdr2-logo.png";
import cs2Logo from "../../assets/logos/cs2-logo.webp";

// ─── Tag colour palette ────────────────────────────────────────────────────────
const TAG_CLASSES = [
    "bg-tag-1/10 text-tag-1",
    "bg-tag-2/10 text-tag-2",
    "bg-tag-3/10 text-tag-3",
    "bg-tag-4/10 text-tag-4",
    "bg-tag-5/10 text-tag-5",
];

// ─── Squad online mock data ────────────────────────────────────────────────────
const SQUAD_MEMBERS = [
    { name: "GhostRider",    game: "RDR 2",   logo: rdr2Logo, status: "online"  },
    { name: "TacticalGamer", game: "CS 2",    logo: cs2Logo,  status: "online"  },
    { name: "NightOwl",      game: "Raft",    logo: raftLogo, status: "online"  },
    { name: "MapMaker",      game: "—",       logo: null,     status: "offline" },
] as const;

// ─── Shared floating panel ─────────────────────────────────────────────────────
const Panel = ({ children }: { children: React.ReactNode }) => (
    <div className="
        w-full flex flex-col overflow-hidden
        bg-surface/90 backdrop-blur-md
        border border-border
        rounded-2xl
        shadow-[0_4px_20px_rgba(0,0,0,0.07)]
        dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]
    ">
        {children}
    </div>
);

// ─── Panel header row ──────────────────────────────────────────────────────────
const PanelHeader = ({
    icon,
    iconBg,
    iconColor,
    title,
    badge,
}: {
    icon: typeof faArrowTrendUp;
    iconBg: string;
    iconColor: string;
    title: string;
    badge?: number;
}) => (
    <div className="flex flex-row items-center gap-2.5 px-4 py-3 border-b border-border">
        <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
            <FontAwesomeIcon icon={icon} className="text-sm" />
        </div>
        <p className="font-semibold text-sm text-text flex-1">{title}</p>
        {badge !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full
                bg-success-500/15 text-success-500">
                {badge} online
            </span>
        )}
    </div>
);

// ─── RightBar ─────────────────────────────────────────────────────────────────
export const RightBar = () => {
    const theme = useThemeStore((state) => state.theme);

    const onlineCount = SQUAD_MEMBERS.filter((m) => m.status === "online").length;

    return (
        <div className="w-full flex flex-col gap-3">

            {/* ── Squad Online panel ─────────────────────────────── */}
            <Panel>
                <PanelHeader
                    icon={faGamepad}
                    iconBg="bg-success-500/10"
                    iconColor="text-success-500"
                    title="Squad"
                    badge={onlineCount}
                />

                <div className="flex flex-col p-2 gap-0.5">
                    {SQUAD_MEMBERS.map((member) => {
                        const isOnline = member.status === "online";
                        return (
                            <div
                                key={member.name}
                                className="flex flex-row items-center gap-3 px-2 py-2
                                    rounded-xl cursor-pointer
                                    hover:bg-surface-hover
                                    transition-colors duration-150"
                            >
                                {/* Avatar with online dot */}
                                <div className="relative shrink-0">
                                    <img
                                        src={avatarGame}
                                        alt={member.name}
                                        className={`w-8 h-8 rounded-full object-cover ring-1
                                            ${isOnline ? "ring-success-500/40" : "ring-border opacity-50"}`}
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5
                                        w-2.5 h-2.5 rounded-full ring-2 ring-surface
                                        ${isOnline ? "bg-success-500" : "bg-neutral-400"}`}
                                    />
                                </div>

                                {/* Name + game */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <p className={`text-sm font-medium truncate
                                        ${isOnline ? "text-text" : "text-text-faint"}`}>
                                        {member.name}
                                    </p>
                                    {isOnline && member.logo && (
                                        <div className="flex flex-row items-center gap-1.5 mt-0.5">
                                            <img
                                                src={member.logo}
                                                alt={member.game}
                                                className="w-3 h-3 rounded object-cover"
                                            />
                                            <p className="text-[11px] text-text-faint truncate">
                                                {member.game}
                                            </p>
                                        </div>
                                    )}
                                    {!isOnline && (
                                        <p className="text-[11px] text-text-faint">Offline</p>
                                    )}
                                </div>

                                {/* Online pulse or offline indicator */}
                                {isOnline && (
                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        className="text-[6px] text-success-500 shrink-0 animate-pulse"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </Panel>

            {/* ── Trending panel ─────────────────────────────────── */}
            <Panel>
                <PanelHeader
                    icon={faArrowTrendUp}
                    iconBg="bg-accent-500/10"
                    iconColor="text-accent-500"
                    title="Trending"
                />

                <div className="flex flex-col p-2 gap-0.5">
                    {[1, 2, 3].map((rank) => (
                        <div
                            key={rank}
                            className="flex flex-row items-center gap-3 px-2 py-2
                                rounded-xl cursor-pointer
                                hover:bg-surface-hover
                                transition-colors duration-150"
                        >
                            <p className={`w-4 text-center text-xs font-bold shrink-0
                                ${rank === 1 ? "text-accent-500" : "text-text-faint"}`}>
                                {rank}
                            </p>
                            <img
                                src={avatarGame}
                                alt=""
                                className="w-9 h-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
                            />
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <p className="font-medium text-sm text-text truncate">
                                    Game Discussion Title {rank}
                                </p>
                                <div className="flex flex-row flex-wrap gap-1">
                                    {[1, 2, 3].map((t, idx) => (
                                        <span
                                            key={t}
                                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                                                ${TAG_CLASSES[idx % TAG_CLASSES.length]}`}
                                        >
                                            #Tag{t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            {/* ── Recommended panel ──────────────────────────────── */}
            <Panel>
                <PanelHeader
                    icon={theme === "light" ? faLightbulbSolid : faLightbulbOutline}
                    iconBg="bg-primary-soft"
                    iconColor="text-primary"
                    title="Recommended"
                />

                <div className="flex flex-col p-2 gap-0.5">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex flex-row items-center gap-3 px-2 py-2
                                rounded-xl cursor-pointer
                                hover:bg-surface-hover
                                transition-colors duration-150"
                        >
                            <img
                                src={avatarGame}
                                alt=""
                                className="w-9 h-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
                            />
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <p className="font-medium text-sm text-text truncate">
                                    Game Discussion Title {item}
                                </p>
                                <div className="flex flex-row items-center gap-1.5 text-xs">
                                    <span className="text-text-faint">by</span>
                                    <span className="
                                        px-1.5 py-0.5 rounded-full
                                        bg-tag-4/10 text-tag-4
                                        font-semibold text-[10px]
                                        hover:bg-tag-4/20 transition-colors cursor-pointer
                                    ">
                                        User123
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    )
}