import ComplianceScanDetailView from 'src/sections/compliance_scan/ComplianceScanDetailView';
import ComplianceScanListView from 'src/sections/compliance_scan/ComplianceScanListView';

export const metadata = { title: 'Dashboard: Compliance Scans' };

export default function Page({params}) {
    return <ComplianceScanDetailView id={params.id} />;
}
