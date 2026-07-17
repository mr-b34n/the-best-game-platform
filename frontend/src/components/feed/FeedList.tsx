import { Post, type PostData } from "./Post"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFire, faUsers, faStar, faImage, faPaperclip } from "@fortawesome/free-solid-svg-icons"

import avatarGame from "../../assets/logos/raft-logo.png";
import raftImg from "../../assets/logos/raft-logo.png";

import butterflyEmeraldImg from "../../assets/mock-data/butterfly-emarald.webp";
import dust2Img from "../../assets/mock-data/dust2_back_plat_s2.jpg";
import figuresImg from "../../assets/mock-data/figures.jpeg";

// ─── Feed tabs definition ──────────────────────────────────────────────────────
const TABS = [
    { id: "foryou",    label: "For You",  icon: faStar    },
    { id: "following", label: "Following", icon: faUsers   },
    { id: "hot",       label: "Hot 🔥",   icon: faFire    },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Mock data ─────────────────────────────────────────────────────────────────
export const ALL_POSTS: PostData[] = [
    {
        id: 1,
        author: "User123",
        authorAvatar: avatarGame,
        gameTag: "Raft",
        timeAgo: "2 giờ trước",
        title: "Setup base ngoài khơi cực chill sau 40 ngày sinh tồn",
        content:
            "Cuối cùng cũng build xong base 3 tầng, có cả khu trồng trọt và bẫy cá tự động. " +
            "Ai đang chơi Raft chia sẻ layout của mọi người xem nào!",
        images: [raftImg, dust2Img], // 2 images test
        tags: ["Raft", "Basebuilding", "Survival"],
        likes: 24,
        comments: 8,
        tab: "foryou",
    },
    {
        id: 2,
        author: "GhostRider",
        authorAvatar: avatarGame,
        gameTag: "RDR 2",
        timeAgo: "5 giờ trước",
        title: "Bản mod đồ hoạ 4K mới ra, chạy siêu mượt",
        content:
            "Vừa test bản mod textures mới cho RDR2, cải thiện chất lượng ánh sáng ban đêm " +
            "đáng kể mà FPS không giảm nhiều. Để link ở comment.",
        tags: ["RDR2", "Mods", "Graphics"],
        likes: 56,
        comments: 19,
        tab: "foryou",
    },
    {
        id: 3,
        author: "TacticalGamer",
        authorAvatar: avatarGame,
        gameTag: "CS 2",
        timeAgo: "1 ngày trước",
        title: "Tips aim training cho người mới lên Premier",
        content:
            "Chia sẻ routine warm-up 15 phút mỗi ngày giúp mình cải thiện aim rõ rệt sau 2 tuần. " +
            "Không cần app ngoài, chỉ cần deathmatch đúng cách.",
        images: [figuresImg, butterflyEmeraldImg, dust2Img], // 3 images test
        tags: ["CS2", "Tips", "Aim"],
        likes: 132,
        comments: 41,
        tab: "foryou",
    },
    {
        id: 4,
        author: "NightOwl",
        authorAvatar: avatarGame,
        gameTag: "Raft",
        timeAgo: "30 phút trước",
        title: "Base raft của squad mình sau 2 tuần chơi cùng nhau",
        content:
            "Cả squad 4 người cùng grind mỗi tối, giờ có base khổng lồ với đầy đủ tiện nghi. " +
            "Recommend mode coop cho mọi người!",
        images: [raftImg, raftImg, raftImg, raftImg, raftImg], // 5 images test
        tags: ["Raft", "Coop", "Squad"],
        likes: 89,
        comments: 27,
        tab: "following",
    },
    {
        id: 5,
        author: "ProSniper",
        authorAvatar: avatarGame,
        gameTag: "CS 2",
        timeAgo: "3 giờ trước",
        title: "AWP no-scope highlight reel — 20 kills in one match",
        content:
            "Vừa có một trận siêu đỉnh với AWP, chia sẻ clip highlight cho mọi người xem. " +
            "Tất cả đều là no-scope, không có cheat!",
        images: [butterflyEmeraldImg],
        tags: ["CS2", "Highlight", "AWP"],
        likes: 340,
        comments: 88,
        tab: "hot",
    },
    {
        id: 6,
        author: "MapMaker",
        authorAvatar: avatarGame,
        gameTag: "CS 2",
        timeAgo: "12 giờ trước",
        title: "Custom map mới: Ancient 2.0 — cải tiến toàn bộ layout",
        content:
            "Mất 3 tháng để build map này, thêm nhiều angle mới, rotate ngắn hơn và " +
            "smoke lineups cực đẹp. Workshop link trong comment.",
        images: [dust2Img],
        tags: ["CS2", "Custom", "Workshop"],
        likes: 512,
        comments: 143,
        tab: "hot",
    },
];

// ─── Create post box ───────────────────────────────────────────────────────────
const CreatePostBox = ({ onPost }: { onPost: (content: string) => void }) => {
    const [content, setContent] = useState("");

    const handlePost = () => {
        if (!content.trim()) return;
        onPost(content);
        setContent("");
    };

    return (
        <div className="
            w-full flex flex-col gap-3 p-4
            bg-surface/90 backdrop-blur-md
            border border-border rounded-2xl
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
        ">
            <div className="flex flex-row items-center gap-3">
                <img src={avatarGame} alt="User" className="w-10 h-10 rounded-full object-cover ring-1 ring-border shrink-0" />
                <input 
                    type="text" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePost()}
                    placeholder="What's on your mind?" 
                    className="w-full h-10 px-4 bg-surface-hover border border-border rounded-full text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint"
                />
            </div>
            <div className="flex flex-row items-center justify-between pl-[3.25rem] pr-1">
                <div className="flex flex-row items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-primary transition-colors">
                        <FontAwesomeIcon icon={faImage} className="text-[15px]" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-primary transition-colors">
                        <FontAwesomeIcon icon={faPaperclip} className="text-[15px]" />
                    </button>
                </div>
                <button 
                    onClick={handlePost}
                    disabled={!content.trim()}
                    className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        content.trim() 
                        ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(124,77,255,0.35)] hover:-translate-y-0.5" 
                        : "bg-surface-hover text-text-faint cursor-not-allowed"
                    }`}
                >
                    Post
                </button>
            </div>
        </div>
    );
};



// ─── FeedList ──────────────────────────────────────────────────────────────────
export const FeedList = () => {
    const [posts, setPosts] = useState<PostData[]>(ALL_POSTS);

    const handleCreatePost = (content: string) => {
        const newPost: PostData = {
            id: Date.now(),
            author: "You",
            authorAvatar: avatarGame,
            gameTag: "General",
            timeAgo: "Vừa xong",
            title: "New update",
            content: content,
            tags: [],
            likes: 0,
            comments: 0,
        };
        setPosts([newPost, ...posts]);
    };

    return (
        <div className="w-full flex flex-col gap-3">

            {/* Create Post */}
            <CreatePostBox onPost={handleCreatePost} />

            {/* Posts */}
            {posts.map((post) => <Post key={post.id} post={post} />)}
        </div>
    );
}