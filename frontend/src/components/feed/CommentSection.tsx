import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { faHeart as faHeartSolid, faPaperPlane, faReply } from "@fortawesome/free-solid-svg-icons";

import avatarUser from "../../assets/logos/raft-logo.png"; // mock avatar

// ─── Comment mock data types ───────────────────────────────────────────────────
export interface CommentData {
    id: string | number;
    author: string;
    authorAvatar: string;
    content: string;
    timeAgo: string;
    likes: number;
}

// ─── Individual Comment Component ──────────────────────────────────────────────
const CommentItem = ({ comment }: { comment: CommentData }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    return (
        <div className="flex flex-row items-start gap-3 w-full animate-fade-in group">
            {/* Avatar */}
            <img
                src={comment.authorAvatar}
                alt={comment.author}
                className="w-10 h-10 rounded-full object-cover shrink-0"
            />
            
            {/* Content box */}
            <div className="flex flex-col flex-1 gap-1 pb-4 border-b border-border/50 group-last:border-0">
                <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-2">
                        <p className="font-bold text-[15px] text-text hover:underline cursor-pointer">{comment.author}</p>
                        <span className="text-sm text-text-faint">· {comment.timeAgo}</span>
                    </div>
                    <p className="text-[15px] text-text mt-0.5 leading-snug">
                        {comment.content}
                    </p>
                </div>

                {/* Comment actions */}
                <div className="flex flex-row items-center gap-6 mt-1 text-[13px] font-medium text-text-faint">
                    <button 
                        onClick={toggleLike} 
                        className={`flex flex-row items-center gap-1.5 hover:text-like transition-colors ${liked ? "text-like" : ""}`}
                    >
                        <FontAwesomeIcon icon={liked ? faHeartSolid : faHeartOutline} className="text-sm" />
                        <span>{likeCount > 0 ? likeCount : ""}</span>
                    </button>
                    <button className="flex flex-row items-center gap-1.5 hover:text-text transition-colors">
                        <FontAwesomeIcon icon={faReply} className="text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Comment Section Component ─────────────────────────────────────────────────
export const CommentSection = ({ postId }: { postId: string }) => {
    // Mock comments state
    const [comments, setComments] = useState<CommentData[]>([
        {
            id: 1,
            author: "ProGamer99",
            authorAvatar: avatarUser,
            content: "Wow, layout đẹp quá bạn ơi! Có chia sẻ preset không?",
            timeAgo: "2 giờ trước",
            likes: 5,
        },
        {
            id: 2,
            author: "ChillVibes",
            authorAvatar: avatarUser,
            content: "Nhìn cái này muốn tải game lại chơi luôn quá :D",
            timeAgo: "1 giờ trước",
            likes: 2,
        },
    ]);

    const [inputValue, setInputValue] = useState("");

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newComment: CommentData = {
            id: Date.now(),
            author: "You", // Mock current user
            authorAvatar: avatarUser,
            content: inputValue,
            timeAgo: "Vừa xong",
            likes: 0,
        };

        setComments([...comments, newComment]);
        setInputValue("");
    };

    return (
        <div className="w-full flex flex-col pt-4 mt-2 border-t border-border">
            
            {/* Header */}
            <h3 className="font-bold text-lg text-text px-4 mb-4">
                Comments <span className="text-text-muted font-normal text-base ml-1">{comments.length}</span>
            </h3>

            {/* Comment Box */}
            <div className="flex flex-row items-start gap-3 px-4 mb-6">
                <img
                    src={avatarUser}
                    alt="You"
                    className="w-10 h-10 rounded-full object-cover shrink-0 mt-1"
                />
                <form 
                    onSubmit={handleCommentSubmit}
                    className="flex-1 flex flex-col gap-2 relative"
                >
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Phản hồi của bạn..."
                        className="
                            w-full bg-transparent border-none focus:outline-none focus:ring-0
                            text-lg text-text placeholder:text-text-faint
                            resize-none min-h-[44px] max-h-[200px] py-2
                        "
                        rows={1}
                        onInput={(e) => {
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                    />
                    <div className="flex flex-row items-center justify-between pt-2 border-t border-border/50">
                        <div className="text-xs text-text-faint">Bất kỳ ai cũng có thể trả lời</div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className={`
                                px-4 py-1.5 rounded-full text-sm font-bold
                                transition-all duration-200
                                ${inputValue.trim() 
                                    ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(124,77,255,0.35)]" 
                                    : "bg-surface-hover text-text-faint cursor-not-allowed opacity-70"}
                            `}
                        >
                            Reply
                        </button>
                    </div>
                </form>
            </div>

            {/* List of comments */}
            <div className="flex flex-col gap-4 px-4 pb-4">
                {comments.map((cmt) => (
                    <CommentItem key={cmt.id} comment={cmt} />
                ))}
            </div>
        </div>
    );
};
