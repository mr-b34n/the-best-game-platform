import { } from "@fortawesome/free-regular-svg-icons"
import { faUsers, faHouse, faBookmark, faGamepad, faAngleDown } from "@fortawesome/free-solid-svg-icons"
import { faHubspot } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

import cs2Logo from "../../assets/logos/cs2-logo.webp";
import rdr2Logo from "../../assets/logos/rdr2-logo.png";
import raftLogo from "../../assets/logos/raft-logo.png";

export const LeftBar = () => {
    const [gamesDrop, setGamesDrop] = useState<boolean>(false);

    return (
        <div className="fixed top-20 left-10 w-fit h-fit p-2 bg-gray-100/90 dark:bg-slate-900/90 rounded-3xl dark:text-white">
            <button className="w-fit h-fit py-2 px-3 flex flex-row items-center gap-2 bg-transparent hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-full text-2xl font-medium cursor-pointer">
                <FontAwesomeIcon icon={faHouse} />
                <p>Home</p>
            </button>

            <button className="w-fit h-fit py-2 px-3 flex flex-row items-center gap-2 bg-transparent hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-full text-2xl font-medium cursor-pointer">
                <FontAwesomeIcon icon={faUsers} />
                <p>Community</p>
            </button>

            <div

                className={`w-fit h-fit py-2 px-3 flex flex-col gap-1 transition-all duration-200
                    bg-transparent  
                    ${gamesDrop ? 'rounded-3xl' :
                        ' hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-4xl cursor-pointer'}
                    text-2xl font-medium  border-2 border-gray-200 dark:border-slate-800 `}
            >
                <div
                    onClick={() => setGamesDrop(!gamesDrop)}
                    className="flex flex-row items-center gap-2 border-b-2 border-gray-200 dark:border-slate-800 select-none cursor-pointer">
                    <FontAwesomeIcon icon={faGamepad} />
                    <p>My Games</p>
                    <FontAwesomeIcon icon={faAngleDown} className={`text-[20px] transition-all duration-100 ${gamesDrop ? 'rotate-180' : 'rotate-0'}`} />
                </div>

                {
                    gamesDrop && (
                        <div className="w-full h-fit flex flex-col gap-1 text-lg select-none">
                            <div className="w-full h-fit flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-200 hover:dark:bg-slate-800">
                                <img src={raftLogo} alt="" className="w-6 h-6" />
                                <p>Raft</p>
                            </div>
                            <div className="w-full h-fit flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-200 hover:dark:bg-slate-800">
                                <img src={rdr2Logo} alt="" className="w-6 h-6" />
                                <p>RDR 2</p>
                            </div>
                            <div className="w-full h-fit flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-200 hover:dark:bg-slate-800">
                                <img src={cs2Logo} alt="" className="w-6 h-6" />
                                <p>CS 2</p>
                            </div>
                        </div>
                    )
                }
            </div>

            <button className="w-fit h-fit py-2 px-3 flex flex-row items-center gap-2 bg-transparent hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-full text-2xl font-medium cursor-pointer">
                <FontAwesomeIcon icon={faBookmark} />
                <p>Bookmarks</p>
            </button>

            <button className="w-fit h-fit py-2 px-3 flex flex-row items-center gap-2 bg-transparent hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-full text-2xl font-medium cursor-pointer">
                <FontAwesomeIcon icon={faHubspot} />
                <p>My squad</p>
            </button>

            <button className="w-fit h-fit py-2 px-3 flex flex-row items-center gap-2 bg-transparent hover:bg-zinc-200 hover:dark:bg-slate-800 rounded-full text-2xl font-medium cursor-pointer">
                <FontAwesomeIcon icon={faBookmark} />
                <p>Bookmarks</p>
            </button>
        </div>
    )
}