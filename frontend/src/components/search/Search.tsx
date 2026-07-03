import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const Search = () => {

    return (
        <div
            className="group flex flex-row items-center gap-2 p-2
                w-full max-w-150 h-fit 
                bg-white dark:bg-gray-900 rounded-full 
                border-2 border-transparent transition-all 
                focus-within:border-blue-600 dark:focus-within:border-gray-700 group-focus-within:border-2
        ">

            <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="text-zinc-400 dark:text-zinc-300 group-focus-within:text-blue-400 transition-colors text-md "
            />

            <input
                type="text"
                placeholder="Search"
                className="w-full h-full focus:outline-none bg-transparent text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-300"
            />
        </div>
    )
}