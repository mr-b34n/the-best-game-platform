import { createFileRoute } from '@tanstack/react-router'

const Profile = () => {

    return (
        <div>Profile</div>
    )
}

export const Route = createFileRoute('/_authenticated/profile/$userId')({
    component: Profile,
})


