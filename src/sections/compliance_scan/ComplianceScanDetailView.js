'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardContent, CardHeader, Divider, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_compliance_scans_details, get_user_detail, get_user_tiers, update_user } from 'src/components/api/api';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function ComplianceScanDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);

    const getData = async () => {
        var res = await get_compliance_scans_details({ id: id });
        if (res.status) {
            setData({
                ...res.data[0],
                results: JSON.parse(res.data[0].results)
            });
            // console.log(res.data[0])

        }
    };


    useEffect(() => {
        getData();
    }, []);

    if (!data) return null;

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="Scan Detail" />
                <CardContent>
                    <Stack direction="column" gap={2}>
                        {data.results && (
                            <div className="min-h-screen bg-slate-50 px-4 py-16">
                                <div className="max-w-2xl mx-auto">

                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Your Compliance Results</h1>
                                        <p className="text-slate-500 text-sm">Name: {data.company_name}</p>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-5xl font-extrabold text-slate-900">
                                                    score:       {data.results.totalScore}
                                                    <span className="text-xl text-slate-400 font-normal ml-1">out of 100 points</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold `}>Risk Level: {data.results.riskLevel}</p>
                                            </div>
                                        </div>


                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Primary Risk:</span>
                                            <span className="text-sm font-semibold text-slate-700">{data.results.primaryRisk}</span>
                                        </div>

                                        {data.results.length > 0 && (
                                            <div className={` border rounded-xl p-4 mb-4`}>
                                                <ul className="space-y-1">
                                                    {data.results?.alerts?.map((alert) => (
                                                        <li key={alert} className="text-sm font-medium text-slate-700">⚠ {alert}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {data.results?.answers?.map((r, index) => (
                                            <div>
                                                <h5>{r.question}</h5>
                                                <p>{r.selected}</p>
                                            </div>
                                        ))}


                                    </div>




                                </div>
                            </div>

                        )}


                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}

