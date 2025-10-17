
// ----------------------------------------------------------------------

import PrizeDetailView from "src/sections/prizes/PrizeDetailView";

export const metadata = {
    title: 'Dashboard: One',
};

export default function Page({ params }) {
    const { id } = params;


    return <PrizeDetailView id={id} />;
}
