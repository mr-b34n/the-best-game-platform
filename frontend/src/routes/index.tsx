import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useThemeStore } from '../stores/useThemeStore';
import { useTheme } from '../helpers/theme/useTheme';
import { Search } from '../components/search/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faUserCircle,
	faPlusSquare,
	faBell,
	faSun,
} from "@fortawesome/free-regular-svg-icons";
import { LeftBar } from '../components/sidebars/LeftBar';
import { FeedList } from '../components/feed/FeedList';
import { RightBar } from '../components/sidebars/RightBar';

const Home = () => {
	useTheme("Home");
	const toggleTheme = useThemeStore((state) => state.toggleTheme);
	const navigate = useNavigate();

	return (
		<div className="flex flex-col relative w-screen h-screen overflow-hidden bg-white dark:bg-slate-950">
			<div
				className="absolute inset-0 
                    bg-[linear-gradient(to_right,#e3e4e6_1px,transparent_1px),linear-gradient(to_bottom,#e3e4e6_1px,transparent_1px)] 
                    dark:bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] 
                    bg-size-[1.5rem_1.5rem]
                    mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]
                    opacity-60 dark:opacity-80 
                    pointer-events-none"
			/>

			{/* Header */}
			<div className="w-full h-fit top-0 flex flex-row justify-between items-center px-2 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 sticky">
				<div className="z-10 w-fit h-fit self-start text-black dark:text-white p-2 text-3xl font-extrabold">
					<p>IndieG</p>
				</div>

				<Search />

				<div className="w-fit h-fit p-1.5 flex flex-row items-center gap-3 rounded-lg text-xl text-black dark:text-white">
					<button
						onClick={toggleTheme}
						className="w-8 aspect-square flex items-center justify-center rounded-full bg-transparent hover:bg-blue-200 hover:dark:bg-slate-800 cursor-pointer"
					>
						<FontAwesomeIcon icon={faSun} className="block" />
					</button>
					<button className="w-8 aspect-square flex items-center justify-center rounded-full bg-transparent hover:bg-blue-200 hover:dark:bg-slate-800 cursor-pointer">
						<FontAwesomeIcon
							icon={faPlusSquare}
							className="block"
						/>
					</button>
					<button className="w-8 aspect-square flex items-center justify-center rounded-full bg-transparent hover:bg-blue-200  hover:dark:bg-slate-800 cursor-pointer">
						<FontAwesomeIcon icon={faBell} />
					</button>
					<button
						onClick={() =>
							navigate({
								to: "/auth",
							})
						}
						className="w-10 aspect-square flex items-center justify-center rounded-full bg-transparent hover:bg-blue-200 hover:dark:bg-slate-800 cursor-pointer"
					>
						<FontAwesomeIcon icon={faUserCircle} />
						{/* <img src={logo} alt="" className="w-7 h-7 rounded-full"/> */}
					</button>
				</div>
			</div>

			{/* Body */}
			<div className="relative overflow-y-auto w-full h-screen bg-transparent">
				<LeftBar />

				<FeedList />

				<RightBar />
			</div>
		</div>
	);
}

export const Route = createFileRoute('/')({
	component: Home,
})


