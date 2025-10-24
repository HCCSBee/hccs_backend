import OneView from 'src/sections/one/view';
import UserDetailView from 'src/sections/users/UserDetailView';
import UserListView from 'src/sections/users/UserListView';

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Dashboard: User',
};

export default function Page({ params }) {
    const { id } = params;
    return <UserDetailView id={params.id} />;
}
