import OneView from 'src/sections/one/view';
import UserListView from 'src/sections/users/UserListView';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Dashboard: One',
};

export default function Page() {
  return <UserListView />;
}
