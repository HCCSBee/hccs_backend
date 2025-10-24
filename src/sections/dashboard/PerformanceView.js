'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Card, CardContent, CardHeader, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_performance, get_wallet_total } from 'src/components/api/api';
import { supabase } from 'src/auth/context/supabase/lib';

// ----------------------------------------------------------------------

export default function PerformanceView() {
    const settings = useSettingsContext();
    const [items, setItems] = useState([]);
    const [totalWallet, setTotalWallet] = useState(0);

    const getData = async () => {
        var res = await get_performance();
        if (res.status) {
            setItems(res.data);
        }

        getWalletTotal();
    };
    const getWalletTotal = async () => {
        var res = await get_wallet_total();
        if (res.status) {
            setTotalWallet(res.data);
        }
    };
    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel('draw_changes') // name your channel anything
            .on(
                'postgres_changes',
                {
                    event: '*',          // 'INSERT', 'UPDATE', 'DELETE', or '*'
                    schema: 'public',    // Supabase uses 'public' by default
                    table: 'draw',
                },
                (payload) => {
                    getData();
                }
            )
            .subscribe()

        // Cleanup on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])
    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4"> Performance </Typography>
            <br />
            <Card>
                <CardHeader title="" />
                <CardContent>
                    <Stack direction={"row"}

                        justifyContent={"flex-end"}>
                        <Typography variant='body1'>Total Wallet Balance: RM {totalWallet.toFixed(2)}</Typography>
                    </Stack>
                    <br />
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2}>Prize</TableCell>
                                <TableCell>Draws</TableCell>
                                <TableCell>Total Collected</TableCell>
                                <TableCell>Total Won</TableCell>
                                <TableCell>P&L</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        {r.prize_content.length > 0 && (
                                            <img src={process.env.NEXT_PUBLIC_STORAGE_URL + r.prize_content[0].thumbnail} style={{
                                                width: "60px"
                                            }} />
                                        )}

                                    </TableCell>
                                    <TableCell>{r.name}</TableCell>
                                    <TableCell>{r.draws}</TableCell>
                                    <TableCell>RM {r.draws * r.price}</TableCell>

                                    <TableCell>RM {r.sum_won}</TableCell>
                                    <TableCell
                                        style={{
                                            color: ((r.draws * r.price) - r.sum_won) > 0 ? "black" : "red"
                                        }}
                                    >
                                        {(r.draws * r.price) - r.sum_won}
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Container>
    );
}
