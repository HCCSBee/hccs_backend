'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { create_prize, get_prize, insert_prize_image, uploadImage } from 'src/components/api/api';

// ----------------------------------------------------------------------

export default function PrizeDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);

    const getData = async () => {
        var res = await get_prize(id);
        if (res.status) {
            setData(res.data);
        }
    };

    const handleChangeFile = async (e) => {
        if (e.target.files.length) {
            var res = await uploadImage(e.target.files[0]);
            if (res.status) {
                console.log(res);
                var res2 = await insert_prize_image({
                    id: id,
                    image: res.data.fullPath
                });
                if (res2.status) {
                    getData();
                }
            }
        }
    };


    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            {data != null && (
                <Card>
                    <CardHeader title="Prize Info"

                    ></CardHeader>

                    <CardContent>
                        <table>
                            <tr>
                                <th>Name</th>
                                <td>{data.name}</td>
                            </tr>
                            <tr>
                                <th>Price</th>
                                <td>{data.price}</td>
                            </tr>
                            <tr>
                                <th>Lots</th>
                                <td>{data.lots}</td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{data.description}</td>
                            </tr>
                        </table>

                        <Divider></Divider>
                        <br />
                        <Typography variant='h4'>Image</Typography>
                        <br />
                        <TextField type="file" onChange={handleChangeFile} fullWidth />
                        <Stack direction={"row"}>
                            {data.gift_image.map(r => (
                                <div style={{ position: "relative" }} id={r.id}>
                                    <img src={process.env.NEXT_PUBLIC_STORAGE_URL + r.image} style={{
                                        width: "100px"
                                    }} />
                                </div>
                            ))}

                        </Stack>
                        <Divider ></Divider>
                        <br />
                        <Typography variant='h4'>Lots</Typography>
                        <br />
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Lot</TableCell>
                                    <TableCell>User</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.gift_lots.map(r => (
                                    <TableRow id={r.id}>
                                        <TableCell>{r.lot_number}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                </Card>

            )}



        </Container>
    );
}
