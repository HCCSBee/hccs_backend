'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardContent, CardHeader, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { get_prizes } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------

export default function PrizeListView() {
    const settings = useSettingsContext();
    const [prizes, setPrizes] = useState([]);
    const router = useRouter();

    const getData = async () => {
        var res = await get_prizes();
        if (res.status) {
            setPrizes(res.data);
        }
    };

    const openPrize = (r) => {
        router.push(paths.prizes.details(r.id))
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="Prizes"
                    action={
                        <Link href={paths.prizes.create}>
                            <Button
                                variant='contained'
                            >Create</Button>
                        </Link>
                    }
                ></CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Prize</TableCell>
                                <TableCell>Lots</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                prizes.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.name}</TableCell>
                                        <TableCell>{r.lots}</TableCell>
                                        <TableCell>{r.price}</TableCell>
                                        <TableCell>{r.gift_category?.name}</TableCell>
                                        <TableCell style={{
                                            justifyContent: "flex-end",
                                            alignItems: "flex-end",
                                            display: "flex"
                                        }}>
                                            <IconButton
                                                onClick={() => {
                                                    openPrize(r)
                                                }}
                                            >
                                                <Iconify icon="solar:alt-arrow-right-line-duotone" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }

                        </TableBody>
                    </Table>
                </CardContent>
            </Card>



        </Container>
    );
}
