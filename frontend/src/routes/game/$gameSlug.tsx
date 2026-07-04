import { createFileRoute } from '@tanstack/react-router'

const Game = () => {

	return (
		<div>Game</div>
	)
}
export const Route = createFileRoute('/game/$gameSlug')({
	component: Game,
})
