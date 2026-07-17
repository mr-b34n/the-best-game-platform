import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from '../helpers/theme/useTheme';
import { Header } from '../components/header/Header';
import { LeftBar } from '../components/sidebars/LeftBar';
import { FeedList } from '../components/feed/FeedList';
import { RightBar } from '../components/sidebars/RightBar';

const Home = () => {
	useTheme("Home");

	return (
		<div className="flex flex-col relative w-full h-screen overflow-hidden bg-bg text-text">

			{/* ── Decorative background layer ── */}
			<div className="absolute inset-0 pointer-events-none select-none">
				{/* Dot grid */}
				<div className="absolute inset-0
                    bg-[radial-gradient(circle,#c7c2dc_1px,transparent_1px)]
                    dark:bg-[radial-gradient(circle,#2a2440_1px,transparent_1px)]
                    bg-size-[1.75rem_1.75rem]
                    opacity-50 dark:opacity-60"
				/>
				{/* Ambient purple glow — top-left */}
				<div className="absolute -top-32 -left-32 w-125 h-125
                    bg-primary/10 dark:bg-primary/15
                    rounded-full blur-[100px]"
				/>
				{/* Ambient orange glow — bottom-right */}
				<div className="absolute -bottom-32 -right-32 w-125 h-125
                    bg-accent-500/8 dark:bg-accent-500/12
                    rounded-full blur-[100px]"
				/>
			</div>

			{/* ── Header ── */}
			<Header />

			{/* ── Main 3-column content ── */}
			<div className="relative flex-1 overflow-y-auto overflow-x-hidden w-full z-10">
				<div className="w-full max-w-350 mx-auto
                    flex flex-row items-start gap-4
                    px-4 py-3 pb-12">

					{/* Left sidebar — sticky */}
					<aside className="hidden lg:block shrink-0 w-60 sticky top-3">
						<LeftBar />
					</aside>

					{/* Center feed */}
					<main className="flex-1 min-w-0">
						<FeedList />
					</main>

					{/* Right sidebar — sticky */}
					<aside className="hidden xl:block shrink-0 w-72 sticky top-3">
						<RightBar />
					</aside>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/')(
	{ component: Home }
)