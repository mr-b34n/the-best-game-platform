import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import avatarGame from "../../assets/logos/raft-logo.png";
import { faLightbulb as faLightbulbDark } from "@fortawesome/free-regular-svg-icons";
import { faLightbulb as faLightbulbLight } from "@fortawesome/free-solid-svg-icons";
import { useThemeStore } from "../../stores/useThemeStore";

export const RightBar = () => {

    const theme = useThemeStore((state) => state.theme);

    return (
        <div className="fixed w-fit h-fit flex flex-col gap-3 top-20 right-10 bg-transparent p-2 dark:text-white">
            <div className="flex flex-col gap-2 w-full min-w-70 h-fit bg-gray-100 dark:bg-slate-900 rounded-xl p-2">
                <div className="w-full h-fit flex flex-row items-center gap-2 border-b border-black p-1 dark:border-gray-700">
                    <FontAwesomeIcon icon={faArrowTrendUp} />
                    <p className="font-semibold">Trending</p>
                </div>

                <div className="w-full h-fit flex flex-col gap-1">
                    {
                        [1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex flex-row items-center w-full h-fit gap-3 cursor-pointer hover:bg-gray-200 hover:dark:bg-slate-800">
                                <img
                                    src={avatarGame}
                                    className="w-10 h-10 shrink"
                                    alt=""
                                />
                                <div className="flex flex-col flex-1 justify-center gap-1 w-full h-fit">
                                    <p className="font-semibold">Game Discussion Title 1</p>
                                    <div className="flex flex-row gap-2">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="px-1 py-0.5 w-fit h-fit rounded-full bg-gray-300 dark:bg-slate-700">
                                                <p className="text-xs">#Tag {item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full min-w-70 h-fit bg-gray-100 dark:bg-slate-900 rounded-xl p-2">
                <div className="w-full h-fit flex flex-row items-center gap-2 border-b border-black p-1 dark:border-gray-700">
                    <FontAwesomeIcon icon={theme === "light" ? faLightbulbLight : faLightbulbDark} />
                    <p className="font-semibold">Recommended</p>
                </div>

                <div className="w-full h-fit flex flex-col gap-1">
                    {
                        [1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="flex flex-row items-center w-full h-fit gap-3 cursor-pointer hover:bg-gray-200 hover:dark:bg-slate-800">
                                <img
                                    src={avatarGame}
                                    className="w-10 h-10 shrink"
                                    alt=""
                                />
                                <div className="flex flex-col flex-1 justify-center gap-1 w-full h-fit">
                                    <p className="font-semibold">Game Discussion Title 1</p>
                                    <div className="flex flex-row gap-2 text-sm">
                                        <p>By</p>
                                        <p className="px-1.5 rounded-full bg-yellow-400 text-md font-semibold cursor-pointer">User123</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}