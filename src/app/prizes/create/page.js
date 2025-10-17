import PrizeCreateView from 'src/sections/prizes/PrizeCreateView';
import PrizeListView from 'src/sections/prizes/PrizeListView';

// ----------------------------------------------------------------------

export const metadata = {
    title: 'Dashboard: One',
};

export default function Page() {
    return <PrizeCreateView />;
}
