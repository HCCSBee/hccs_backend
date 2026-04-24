'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardContent, CardHeader, Divider, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_user_detail, get_user_tiers, update_user } from 'src/components/api/api';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function UserDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [selectedTierId, setSelectedTierId] = useState('');
    const [saving, setSaving] = useState(false);

    const getData = async () => {
        const [resUser, resTiers] = await Promise.all([
            get_user_detail({ id }),
            get_user_tiers(),
        ]);
        if (resUser.status) {
            setData(resUser.data);
            setSelectedTierId(resUser.data.user_tier_id ?? '');
        }
        if (resTiers.status) {
            setTiers(resTiers.data);
        }
    };

    const handleSaveTier = async () => {
        setSaving(true);
        const res = await update_user({ id, user_tier_id: selectedTierId || null });
        if (res.status) {
            await getData();
        } else {
            alert(res.message || 'Failed to update tier.');
        }
        setSaving(false);
    };

    useEffect(() => {
        getData();
    }, []);

    if (!data) return null;

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="User Detail" />
                <CardContent>
                    <Stack direction="column" gap={2}>
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 'bold', paddingRight: '16px', paddingBottom: '8px' }}>Email</td>
                                    <td>{data.email}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold', paddingRight: '16px', paddingBottom: '8px' }}>Register Date</td>
                                    <td>{moment(data.created_at).format('YYYY-MM-DD')}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold', paddingRight: '16px', paddingBottom: '8px' }}>Current Tier</td>
                                    <td>{data.user_tier?.name ?? '—'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <Divider />

                        <Typography variant="subtitle1">Assign Tier</Typography>
                        <Stack direction="row" gap={2} alignItems="center">
                            <TextField
                                label="Tier"
                                select
                                size="small"
                                value={selectedTierId}
                                onChange={(e) => setSelectedTierId(e.target.value)}
                                style={{ minWidth: 200 }}
                            >
                                <MenuItem value="">— None —</MenuItem>
                                {tiers.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </TextField>
                            <Button variant="contained" onClick={handleSaveTier} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}

