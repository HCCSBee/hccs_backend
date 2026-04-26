'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from 'src/components/settings';
import {
    Alert,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { get_compliance_scans_details } from 'src/components/api/api';

// ----------------------------------------------------------------------

export default function ComplianceScanDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);

    const safeParseResults = (value) => {
        if (!value) return null;
        if (typeof value === 'object') return value;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    };

    const [report, setReport] = useState({});
    const [answers, setAnswers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [submittedAt, setSubmittedAt] = useState('-');
    const getData = async () => {
        const res = await get_compliance_scans_details({ id });
        if (res.status) {
            const row = Array.isArray(res.data) ? res.data[0] : res.data;
            if (!row) return;

            setData({
                ...row,
                results: safeParseResults(row.results),
            });
            setReport(safeParseResults(row.results) ?? {});
            setAnswers(Array.isArray(safeParseResults(row.results)?.answers) ? safeParseResults(row.results).answers : []);
            setAlerts(Array.isArray(safeParseResults(row.results)?.alerts) ? safeParseResults(row.results).alerts : []);
            setSubmittedAt(row.created_at ? new Date(row.created_at).toLocaleString() : '-');
        }
    };


    // const report = data.results ?? {};
    // const answers = Array.isArray(report.answers) ? report.answers : [];
    // const alerts = Array.isArray(report.alerts) ? report.alerts : [];
    // const submittedAt = data.created_at ? new Date(data.created_at).toLocaleString() : '-';

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
            <Card>
                {data && (
 <CardContent>
                    <Typography variant="h6">Submission Info</Typography>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                    <TableCell width={220}>Company</TableCell>
                                    <TableCell>{data.company_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Contact Name</TableCell>
                                    <TableCell>{data.contact_name || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Business Email</TableCell>
                                    <TableCell>{data.business_email || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Contact Number</TableCell>
                                    <TableCell>{data.contact_number || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Industry</TableCell>
                                    <TableCell>{data.industry || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Employees</TableCell>
                                    <TableCell>{data.employees || '-'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Has Foreign Workers</TableCell>
                                    <TableCell>{data.has_foreign_workers ? 'Yes' : 'No'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Submitted At</TableCell>
                                    <TableCell>{submittedAt}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <Divider />

                        <Typography variant="h6">Assessment Summary</Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            <Chip label={`Total Score: ${report.totalScore ?? '-'}`} color="primary" variant="outlined" />
                            <Chip label={`Risk Level: ${report.riskLevel ?? '-'}`} color="error" variant="outlined" />
                            <Chip label={`Primary Risk: ${report.primaryRisk ?? '-'}`} variant="outlined" />
                            <Chip
                                label={`Critical Override: ${report.hasCriticalOverride ? 'Yes' : 'No'}`}
                                color={report.hasCriticalOverride ? 'warning' : 'default'}
                                variant="outlined"
                            />
                        </Stack>

                        {alerts.length > 0 && (
                            <Stack direction="column" gap={1}>
                                <Typography variant="subtitle1">Alerts</Typography>
                                {alerts.map((item, idx) => (
                                    <Alert severity="warning" key={`${idx}-${item.slice(0, 20)}`}>
                                        {item}
                                    </Alert>
                                ))}
                            </Stack>
                        )}

                        <Divider />

                        <Typography variant="h6">Question-by-Question Report</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell width={70}>#</TableCell>
                                    <TableCell width={160}>Category</TableCell>
                                    <TableCell>Question</TableCell>
                                    <TableCell width={220}>Selected Answer</TableCell>
                                    <TableCell width={80}>Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {answers.map((a, idx) => (
                                    <TableRow key={`${a.question_number ?? idx}-${idx}`}>
                                        <TableCell>{a.question_number ?? idx + 1}</TableCell>
                                        <TableCell>{a.category || '-'}</TableCell>
                                        <TableCell>{a.question || '-'}</TableCell>
                                        <TableCell>{a.selected || '-'}</TableCell>
                                        <TableCell>{a.score ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {answers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Typography variant="body2" color="text.secondary">
                                                No answer details found in this report.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                </CardContent>
                )}
               
            </Card>
        </Container>
    );
}

