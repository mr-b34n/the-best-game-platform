import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Post } from '../../components/feed/Post';
import { CommentSection } from '../../components/feed/CommentSection';

// Layout components
import { Header } from '../../components/header/Header';
import { LeftBar } from '../../components/sidebars/LeftBar';
import { RightBar } from '../../components/sidebars/RightBar';

// Import ALL_POSTS to get actual mock data
import { ALL_POSTS } from '../../components/feed/FeedList';
import { useTheme } from '../../helpers/theme/useTheme';

export const Route = createFileRoute('/post/$postId')({
    component: PostDetail,
})

function PostDetail() {
    // Keep theme consistent
    useTheme("Home");
    
    const { postId } = Route.useParams();
    const navigate = useNavigate();

    // Fetch the correct post from our mock feed based on ID
    const post = ALL_POSTS.find((p) => p.id.toString() === postId.toString());

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-bg text-text">
                <p>Post not found</p>
                <button onClick={() => navigate({ to: '/' })} className="mt-4 text-primary underline">Go back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col relative w-full h-screen overflow-hidden bg-bg text-text">

            {/* ── Decorative background layer ── */}
            <div className="absolute inset-0 pointer-events-none select-none">
                <div className="absolute inset-0
                    bg-[radial-gradient(circle,#c7c2dc_1px,transparent_1px)]
                    dark:bg-[radial-gradient(circle,#2a2440_1px,transparent_1px)]
                    bg-size-[1.75rem_1.75rem]
                    opacity-50 dark:opacity-60"
                />
                <div className="absolute -top-32 -left-32 w-125 h-125
                    bg-primary/10 dark:bg-primary/15
                    rounded-full blur-[100px]"
                />
                <div className="absolute -bottom-32 -right-32 w-125 h-125
                    bg-accent-500/8 dark:bg-accent-500/12
                    rounded-full blur-[100px]"
                />
            </div>

            {/* ── Header ── */}
            <Header />

            {/* ── Main 3-column content ── */}
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden w-full z-10">
                <div className="w-full max-w-[87.5rem] mx-auto
                    flex flex-row items-start gap-4
                    px-4 py-3 pb-12">

                    {/* Left sidebar */}
                    <aside className="hidden lg:block shrink-0 w-60 sticky top-3">
                        <LeftBar />
                    </aside>

                    {/* Center Post Detail */}
                    <main className="flex-1 min-w-0">
                        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pb-12 animate-fade-in">
                            
                            {/* Back button & header */}
                            <div className="w-full flex flex-row items-center gap-3 mb-2 px-1">
                                <button 
                                    onClick={() => navigate({ to: '/' })}
                                    className="
                                    w-10 h-10 flex items-center justify-center rounded-full
                                    bg-surface/50 backdrop-blur-sm border border-border/50
                                    text-text-muted hover:bg-surface hover:text-text hover:border-border
                                    shadow-sm
                                    transition-all duration-200
                                ">
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                                <span className="text-sm font-bold text-text-muted tracking-wide uppercase">Post</span>
                            </div>

                            {/* Main post */}
                            <div className="w-full">
                                <Post post={post} />
                            </div>

                            {/* Comment section */}
                            <CommentSection postId={postId} />
                        </div>
                    </main>

                    {/* Right sidebar */}
                    <aside className="hidden xl:block shrink-0 w-72 sticky top-3">
                        <RightBar />
                    </aside>
                </div>
            </div>
        </div>
    )
}
