import { Post, type PostData } from "./Post"
import { useState } from "react"
import { useAuthStore } from "../../stores/useAuthStore"
import { usePostsStore } from "../../stores/usePostsStore"
import { getCurrentAuthor } from "../../helpers/post/getCurrentAuthor"
import { faInbox } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AttachmentPicker } from "../post/AttachmentPicker"
import {
    prepareAttachmentsForSave,
    revokeAttachmentUrls,
    type EditableAttachment,
} from "../../helpers/post/postAttachments"

import avatarGame from "../../assets/logos/raft-logo.png";

interface CreatePostPayload {
    title: string;
    content: string;
    attachments: EditableAttachment[];
}

// ─── Create post box ───────────────────────────────────────────────────────────
const CreatePostBox = ({ onPost }: { onPost: (data: CreatePostPayload) => Promise<void> }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const canPost = content.trim().length > 0 && !isPosting;

    const handlePost = async () => {
        if (!canPost) return;

        setIsPosting(true);
        try {
            await onPost({ title: title.trim(), content: content.trim(), attachments });
            revokeAttachmentUrls(attachments);
            setTitle("");
            setContent("");
            setAttachments([]);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div id="create-post" className="
            w-full flex flex-col gap-3 p-4
            bg-surface/90 backdrop-blur-md
            border border-border rounded-2xl
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            dark:shadow-[0_2px_16px_rgba(0,0,0,0.30)]
        ">
            <div className="flex flex-row items-start gap-3">
                <img src={avatarGame} alt="User" className="w-10 h-10 rounded-full object-cover ring-1 ring-border shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2 w-full min-w-0">
                    {(expanded || title) && (
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            className="w-full h-10 px-4 bg-surface-hover border border-border rounded-full text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint"
                        />
                    )}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setExpanded(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
                        }}
                        placeholder="What's on your mind?"
                        rows={expanded || content || attachments.length > 0 ? 3 : 1}
                        className="w-full px-4 py-2.5 bg-surface-hover border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint resize-none"
                    />

                    <AttachmentPicker
                        attachments={attachments}
                        onChange={setAttachments}
                    />

                    <div className="flex flex-row justify-end">
                        <button
                            onClick={handlePost}
                            disabled={!canPost}
                            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${canPost
                                    ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(124,77,255,0.35)] hover:-translate-y-0.5"
                                    : "bg-surface-hover text-text-faint cursor-not-allowed"
                                }`}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── FeedList ──────────────────────────────────────────────────────────────────
export const FeedList = () => {
    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const currentAuthor = getCurrentAuthor();

    const handleCreatePost = async ({ title, content, attachments }: CreatePostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);

        const newPost: PostData = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: "General",
            timeAgo: "Vừa xong",
            title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
            content,
            images: images.length > 0 ? images : undefined,
            files: files.length > 0 ? files : undefined,
            tags: [],
            likes: 0,
            comments: 0,
        };
        addPost(newPost);
    };

    const handleEditPost = (
        id: string | number,
        data: { title: string; content: string; images?: string[]; files?: PostData["files"] }
    ) => {
        updatePost(id, {
            title: data.title || data.content.slice(0, 80) + (data.content.length > 80 ? "..." : ""),
            content: data.content,
            images: data.images,
            files: data.files,
        });
    };

    const handleUnfollowAuthor = (author: string) => {
        setHiddenAuthors((prev) => [...prev, author]);
    };

    const filteredPosts = posts.filter((p) => !hiddenAuthors.includes(p.author));

    return (
        <div className="w-full flex flex-col gap-3">

            {isLoggedIn && <CreatePostBox onPost={handleCreatePost} />}

            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        isOwner={post.author === currentAuthor}
                        onDelete={deletePost}
                        onEdit={handleEditPost}
                        onUnfollowAuthor={handleUnfollowAuthor}
                    />
                ))
            ) : (
                <div className="
                    w-full flex flex-col items-center justify-center gap-2 p-10
                    bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                    text-text-muted text-sm
                ">
                    <FontAwesomeIcon icon={faInbox} className="text-2xl text-text-faint mb-1" />
                    <p className="font-semibold text-text">No posts here yet</p>
                    <p className="text-text-faint text-center">Check back later or create a new post.</p>
                </div>
            )}
        </div>
    );
}
