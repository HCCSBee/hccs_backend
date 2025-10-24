'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, MenuItem, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { create_prize, create_prize_content, create_user_transaction, get_background, get_prize, get_prize_content, get_prize_tiers, get_transaction_types, get_user_detail, get_user_draw, insert_prize_image, update_prize_content, uploadImage } from 'src/components/api/api';
import { get, set } from 'lodash';
import Iconify from 'src/components/iconify';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function UserDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);
    const [wallet, setWallet] = useState([]);
    const [transactionTypes, setTransactionTypes] = useState([]);

    const getData = async () => {
        var res = await get_user_detail({ id: id });
        if (res.status) {
            setData(res.data);
            setWallet(res.wallet);
        }

        var resStatus = await get_transaction_types();
        if (resStatus.status) {
            setTransactionTypes(resStatus.data);
        }
    };

    const [userDraws, setUserDraws] = useState([]);

    const handleGetUserDraws = async () => {
        var res = await get_user_draw({ id: id });
        if (res.status) {
            setUserDraws(res.data);
        }
    };


    const [selectedTab, setSelectedTab] = useState('wallet');
    const [openContentDialog, setOpenContentDialog] = useState(false);
    const [contentDialogForm, setContentDialogForm] = useState({
        user_wallet_transaction_type_id: '',
        debit: 0,
        credit: 0,
        remarks: ""
    });

    const handleChangeContentDialog = (e) => {
        var f = { ...contentDialogForm };
        f[e.target.name] = e.target.value;
        setContentDialogForm(f);
    }
    const handleOpenContentDialog = (content = null) => {
        if (content != null) {
            setContentDialogForm(content);
        } else {
            setContentDialogForm({});
        }
        setOpenContentDialog(true);
    }
    const handleCloseContentDialog = () => {
        setOpenContentDialog(false);
    }
    const handleSubmitContentDialog = async () => {
        // submit
        var res = await create_user_transaction({
            ...contentDialogForm,
            id: id
        });
        if (res.status) {

            getData();
            setOpenContentDialog(false);
        }

    }


    useEffect(() => {
        getData();
        handleGetUserDraws();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            {data != null && (
                <Card>
                    <CardHeader title="User Info"

                    ></CardHeader>

                    <CardContent>
                        <table>
                            <tr>
                                <td style={{
                                    fontWeight: 'bold'
                                }}>Email</td>
                                <td>{data.email}</td>
                            </tr>
                            <tr>
                                <td style={{
                                    fontWeight: 'bold'
                                }}>Register Date</td>
                                <td>{moment(data.created_at).format("YYYY-MM-DD")}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: "bold" }}>Referral Code</td>
                                <td>
                                    {data.referral_code}
                                </td>
                            </tr>
                        </table>

                        <Divider></Divider>
                        <br />
                        <Tabs
                            value={selectedTab}
                            onChange={(e, v) => {
                                setSelectedTab(v);
                            }}
                        >
                            <Tab label="Wallet" value="wallet"></Tab>
                            <Tab label="Draws" value="draws"></Tab>
                        </Tabs>
                        {selectedTab == 'wallet' && (
                            <>
                                <div style={{
                                    flexGrow: 1,
                                    width: "100%",
                                    marginBottom: "10px",
                                    display: "flex",
                                    height: "100%",
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    alignItems: "flex-end"
                                }}>
                                    <Button variant="contained"
                                        onClick={() => {
                                            handleOpenContentDialog();
                                        }}
                                    >Create</Button>
                                </div>
                                <Stack direction={"row"} gap={1}>
                                    <TextField
                                        style={{
                                            width: "30%"
                                        }}
                                        size={"small"}
                                        label="Search"></TextField>
                                    <TextField
                                        style={{
                                            width: "30%"
                                        }}
                                        size={"small"}
                                        label="Type" select>
                                        <MenuItem value="all">All</MenuItem>
                                        {transactionTypes.map((type) => (
                                            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                        ))
                                        }

                                    </TextField>


                                </Stack>
                                <br />
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Remarks</TableCell>
                                            <TableCell>Debit</TableCell>
                                            <TableCell>Credit</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {wallet.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell>{moment(r.created_at).format("YYYY-MM-DD")}</TableCell>
                                                <TableCell>{r.remarks}</TableCell>
                                                <TableCell>{r.debit}</TableCell>
                                                <TableCell>{r.credit}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </>
                        )}
                        {selectedTab == 'draws' && (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Draw #</TableCell>
                                        <TableCell>Prize</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Item Won</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userDraws.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell>#{r.id}</TableCell>
                                            <TableCell>{r.prize_content?.prize?.name}</TableCell>
                                            <TableCell>{r.prize_content?.price?.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <img src={process.env.NEXT_PUBLIC_STORAGE_URL + r.prize_content.thumbnail}
                                                    style={{
                                                        width: "40px"
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>{r.user_prize_status?.name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <br />

                    </CardContent>

                </Card>

            )
            }

            <Dialog
                open={openContentDialog}
                onClose={handleCloseContentDialog}
            >
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogContent>
                    <Stack direction={"column"} gap={2} style={{ minWidth: "400px", marginTop: "10px" }}>
                        <TextField name="user_wallet_transaction_type_id" select
                            value={contentDialogForm.user_wallet_transaction_type_id} onChange={handleChangeContentDialog}
                            label="Transaction Type">
                            {transactionTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="Remarks" name="remarks" value={contentDialogForm.remarks} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Debit" name="debit" value={contentDialogForm.debit} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Credit" name="credit" value={contentDialogForm.credit} onChange={handleChangeContentDialog}></TextField>

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseContentDialog}>Cancel</Button>
                    <Button variant="contained"
                        onClick={handleSubmitContentDialog}
                    >Submit</Button>
                </DialogActions>

            </Dialog>

        </Container >
    );
}
