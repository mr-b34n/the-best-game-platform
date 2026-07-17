import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faHeart as faHeartOutline,
    faComment,
    faBookmark as faBookmarkOutline,
} from "@fortawesome/free-regular-svg-icons"
import {
    faHeart as faHeartSolid,
    faBookmark as faBookmarkSolid,
    faShare,
    faEllipsis,
    faEyeSlash,
    faUserMinus,
    faFlag,
    faLink,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { faTwitter, faFacebook } from "@fortawesome/free-brands-svg-icons"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Lightbox } from "../ui/Lightbox"
import { faFire, faUsers, faStar } from "@fortawesome/free-solid-svg-icons"

// Rotating tag colour palette
const TAG_CLASSES = [
    "bg-tag-1/10 text-tag-1",
    "bg-tag-2/10 text-tag-2",
    "bg-tag-3/10 text-tag-3",
    "bg-tag-4/10 text-tag-4",
    "bg-tag-5/10 text-tag-5",
];

export interface PostData {
    id: string | number;
    author: string;
    authorAvatar: string;
    gameTag: string;
    timeAgo: string;
    title: string;
    content: string;
    images?: string[];
    tags: string[];
    likes: number;
    comments: number;
    tab?: "foryou" | "following" | "hot";
}

interface PostProps {
    post: PostData;
}

// ─── Image Gallery component ───────────────────────────────────────────────────
const ImageGallery = ({ images, onImageClick }: { images: string[], onImageClick: (index: number) => void }) => {
    if (!images || images.length === 0) return null;

    const count = images.length;

    // Single image
    if (count === 1) {
        return (
            <img
                src={images[0]}
                alt=""
                className="w-full max-h-80 object-cover rounded-xl border border-border cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onImageClick(0); }}
            />
        );
    }

    // Two images
    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-1 aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-border">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
        );
    }

    // Three images
    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-1 aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-border">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="flex flex-col gap-1 h-full min-h-0">
                    <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                    <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                </div>
            </div>
        );
    }

    // Four or more images
    return (
        <div className="grid grid-cols-2 gap-1 aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden border border-border">
            <div className="flex flex-col gap-1 h-full min-h-0">
                <img src={images[0]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(0); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <img src={images[1]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(1); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
            </div>
            <div className="flex flex-col gap-1 h-full min-h-0">
                <img src={images[2]} alt="" onClick={(e) => { e.stopPropagation(); onImageClick(2); }} className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity" />
                <div className="relative w-full flex-1 min-h-0 cursor-pointer hover:opacity-95 transition-opacity" onClick={(e) => { e.stopPropagation(); onImageClick(3); }}>
                    <img src={images[3]} alt="" className="w-full h-full object-cover" />
                    {count > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">+{count - 4}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Post = ({ post }: PostProps) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [bookmarked, setBookmarked] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const navigate = useNavigate();

    const toggleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleNavigate = () => {
        navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
    };

    const BADGE_MAP = {
        foryou: { icon: faStar, label: "Recommended", classes: "text-amber-500 bg-amber-500/10 border border-amber-500/20" },
        following: { icon: faUsers, label: "Following", classes: "text-blue-500 bg-blue-500/10 border border-blue-500/20" },
        hot: { icon: faFire, label: "Trending", classes: "text-rose-500 bg-rose-500/10 border border-rose-500/20" },
    };

    const badge = post.tab ? BADGE_MAP[post.tab] : null;

    return (
        <article 
            onClick={handleNavigate}
            className="
            w-full overflow-hidden cursor-pointer
            bg-surface/90 backdrop-blur-sm
            border border-border
            rounded-2xl
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
            transition-all duration-200 ease-out
        ">

            {/* ── Post header ─────────────────────────────────────── */}
            <div className="flex flex-row items-center gap-3 px-4 pt-4 pb-3">
                <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0"
                />

                <div className="flex flex-col flex-1 leading-tight min-w-0">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[15px] text-text hover:underline">{post.author}</p>
                        
                        {badge && (
                            <span className={`flex flex-row items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${badge.classes}`}>
                                <FontAwesomeIcon icon={badge.icon} />
                                {badge.label}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-row items-center gap-1.5 text-xs text-text-faint mt-1">
                        <span>{post.timeAgo}</span>
                        <span>•</span>
                        <span>{post.gameTag}</span>
                    </div>
                </div>

                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowActionMenu(prev => !prev); setShowShareMenu(false); }}
                        className="
                        w-8 h-8 flex items-center justify-center rounded-full
                        text-text-faint hover:text-text hover:bg-surface-hover
                        transition-colors duration-150
                    ">
                        <FontAwesomeIcon icon={faEllipsis} />
                    </button>

                    {showActionMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in py-1">
                                {post.author === "You" ? (
                                    <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-surface-hover transition-colors text-left font-medium">
                                        <FontAwesomeIcon icon={faTrash} className="w-4" />
                                        Delete Post
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faEyeSlash} className="w-4" />
                                            Not interested
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                            <FontAwesomeIcon icon={faUserMinus} className="w-4" />
                                            Unfollow @{post.author}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-surface-hover transition-colors text-left mt-1 border-t border-border/50">
                                            <FontAwesomeIcon icon={faFlag} className="w-4" />
                                            Report post
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Body: title + text ──────────────────────────────── */}
            <div className="px-4 pb-3 flex flex-col gap-2">
                <p className="font-semibold text-base text-text leading-snug">
                    {post.title}
                </p>
                <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                    {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-row gap-1.5 flex-wrap pt-0.5">
                        {post.tags.map((tag, idx) => (
                            <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium
                                    hover:opacity-75 transition-opacity
                                    ${TAG_CLASSES[idx % TAG_CLASSES.length]}`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Image Gallery ───────────────────────────────────── */}
            {post.images && post.images.length > 0 && (
                <div className="px-4 pb-3">
                    <ImageGallery images={post.images} onImageClick={setLightboxIndex} />
                </div>
            )}

            {/* ── Action bar ──────────────────────────────────────── */}
            <div className="flex flex-row items-center gap-0.5 px-3 py-2.5 border-t border-border">

                {/* Like */}
                <button
                    onClick={toggleLike}
                    className={`flex flex-row items-center gap-1.5 px-3 py-1.5
                        rounded-full text-sm font-medium transition-colors duration-150
                        ${liked
                            ? "text-like bg-like/10"
                            : "text-text-muted hover:bg-surface-hover hover:text-text"}`}
                >
                    <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartOutline} className="text-xs" />
                    <span>{likeCount}</span>
                </button>

                {/* Comment */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
                    className="
                    flex flex-row items-center gap-1.5 px-3 py-1.5
                    rounded-full text-sm font-medium
                    text-text-muted hover:bg-surface-hover hover:text-text
                    transition-colors duration-150
                ">
                    <FontAwesomeIcon icon={faComment} className="text-xs" />
                    <span>{post.comments}</span>
                </button>

                {/* Share */}
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowShareMenu(prev => !prev); setShowActionMenu(false); }}
                        className="
                        flex flex-row items-center gap-1.5 px-3 py-1.5
                        rounded-full text-sm font-medium
                        text-text-muted hover:bg-surface-hover hover:text-text
                        transition-colors duration-150
                    ">
                        <FontAwesomeIcon icon={faShare} className="text-xs" />
                        <span>Share</span>
                    </button>

                    {showShareMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} />
                            <div className="absolute left-0 bottom-full mb-1 w-44 bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-fade-in py-1">
                                <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faLink} className="w-4" />
                                    Copy Link
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faTwitter} className="w-4 text-[#1DA1F2]" />
                                    Share to X
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
                                    <FontAwesomeIcon icon={faFacebook} className="w-4 text-[#1877F2]" />
                                    Share to Facebook
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Bookmark — pushed to right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setBookmarked((prev) => !prev);
                    }}
                    className={`ml-auto w-8 h-8 flex items-center justify-center
                        rounded-full transition-colors duration-150
                        ${bookmarked
                            ? "text-primary bg-primary-soft"
                            : "text-text-faint hover:text-text hover:bg-surface-hover"}`}
                >
                    <FontAwesomeIcon icon={bookmarked ? faBookmarkSolid : faBookmarkOutline} className="text-xs" />
                </button>
            </div>

            {/* ── Lightbox Portal ────────────────────────────────────── */}
            {lightboxIndex !== null && post.images && (
                <Lightbox 
                    images={post.images} 
                    initialIndex={lightboxIndex} 
                    onClose={() => setLightboxIndex(null)} 
                />
            )}
        </article>
    )
}