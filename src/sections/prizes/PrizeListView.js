'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { create_prize, get_prizes, toggle_prize_active } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------

export default function PrizeListView() {
    const settings = useSettingsContext();
    const [prizes, setPrizes] = useState([]);
    const router = useRouter();
    const [prizeDialogForm, setPrizeDialogForm] = useState({
        name: "",
        price: 0
    });
    const [openPrizeDialog, setOpenPrizeDialog] = useState(false);


    const handleChangePrizeForm = (e) => {
        const { name, value } = e.target;
        setPrizeDialogForm({
            ...prizeDialogForm,
            [name]: value
        });
    }

    const getData = async () => {
        var res = await get_prizes();
        if (res.status) {
            setPrizes(res.data);
        }
    };

    const openPrize = (r) => {
        router.push(paths.prizes.details(r.id))
    }

    const [selectedPrize, setSelectedPrize] = useState(null);
    const handleOpenPrizeDialog = (row = null) => {
        if (row) {
            setSelectedPrize(row);
        }
        setOpenPrizeDialog(true);

    };

    const handleSubmitPrize = async () => {
        var { data, error } = await create_prize(prizeDialogForm);
        if (!error) {
            setOpenPrizeDialog(false);
            setPrizeDialogForm({
                name: "",
                price: 0
            });
            getData();
            alert("Created");
        } else {
            alert("Error creating prize");
        }
    };

    const handleToggle = async (row, checked) => {
        // alert(checked);
        var res = await toggle_prize_active({
            id: row.id,
            active: checked ? 1 : 0
        });
        var _items = [...prizes];
        row.active = checked;
        setPrizes(_items);
    }
    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="Prizes"
                    action={

                        <Button
                            onClick={() => {
                                handleOpenPrizeDialog();
                            }}
                            variant='contained'
                        >Create</Button>

                    }
                ></CardHeader>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Prize</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                prizes.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.name}</TableCell>
                                        <TableCell>{r.price}</TableCell>
                                        <TableCell style={{
                                            justifyContent: "flex-end",
                                            alignItems: "flex-end",
                                            display: "flex"
                                        }}>
                                            <Switch checked={r.active}

                                                onChange={(e) => {
                                                    handleToggle(r, e.target.checked)
                                                }}></Switch>
                                            <IconButton onClick={() => {
                                                handleOpenPrizeDialog(r)

                                            }}>
                                                <Iconify icon="mingcute:edit-line" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    openPrize(r);
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


            <Dialog open={openPrizeDialog} onClose={() => setOpenPrizeDialog(false)}>
                <DialogTitle>Create Prize</DialogTitle>
                <DialogContent style={{ minWidth: 500 }}>
                    <Stack direction={"column"} gap={2} marginTop={2}>

                        <TextField label="Name" name="name" value={prizeDialogForm.name} onChange={handleChangePrizeForm}></TextField>
                        <TextField label="Price" name="price" value={prizeDialogForm.price} onChange={handleChangePrizeForm}></TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained"
                        onClick={handleSubmitPrize}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
