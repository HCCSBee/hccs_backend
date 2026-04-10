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
import { create_mystery_gift, create_prize, create_prize_content, create_user_mystery_gift, create_user_transaction, delete_mystery_gift, get_background, get_mystery_gift_contents, get_prize, get_prize_content, get_prize_tiers, get_prizes, get_transaction_types, get_user_detail, get_user_draw, get_user_mystery_gifts, insert_prize_image, update_mystery_gift, update_prize_content, uploadImage } from 'src/components/api/api';
import { get, set } from 'lodash';
import Iconify from 'src/components/iconify';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function UserDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);
    const [wallet, setWallet] = useState([]);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [prizes, setPrizes] = useState([]);
    const [openPrizeContentDialog, setOpenPrizeContentDialog] = useState(false);
    const [mysteryGiftContents, setMysteryGiftContents] = useState([]);
    const [userMysteryGifts, setUserMysteryGifts] = useState([]);
    const [openAddMysteryGiftDialog, setOpenAddMysteryGiftDialog] = useState(false);
    const [selectedUserMysteryGift, setSelectedUserMysteryGift] = useState(null);
    const [addMysteryGiftForm, setAddMysteryGiftForm] = useState({
        mystery_gift_content_id: '',
        gift_price: '',
        unlock_price: '',
        obtain_at: '',
        is_active: 1,
    });

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

        var resPrizes = await get_prizes();
        if (resPrizes.status) {
            setPrizes(resPrizes.data);
        }

        var resMgc = await get_mystery_gift_contents();
        if (resMgc.status) {
            setMysteryGiftContents(resMgc.data);
        }
    };

    const handleGetUserMysteryGifts = async () => {
        var res = await get_user_mystery_gifts({ user_id: id });
        if (res.status) {
            setUserMysteryGifts(res.data);
        }
    };

    const handleOpenAddMysteryGiftDialog = (row = null) => {
        if (row && row.id) {
            setSelectedUserMysteryGift(row);
            setAddMysteryGiftForm({
                mystery_gift_content_id: row.mystery_gift_content_id || '',
                gift_price: row.gift_price || '',
                unlock_price: row.unlock_price || '',
                obtain_at: row.obtain_at || '',
                is_active: row.is_active ?? 1,
            });
        } else {
            setSelectedUserMysteryGift(null);
            setAddMysteryGiftForm({
                mystery_gift_content_id: '',
                gift_price: '',
                unlock_price: '',
                obtain_at: '',
                is_active: 1,
            });
        }
        setOpenAddMysteryGiftDialog(true);
    };

    const handleCloseAddMysteryGiftDialog = () => {
        setOpenAddMysteryGiftDialog(false);
        setSelectedUserMysteryGift(null);
    };

    const handleChangeAddMysteryGiftForm = (e) => {
        setAddMysteryGiftForm({ ...addMysteryGiftForm, [e.target.name]: e.target.value });
    };

    const handleSubmitAddMysteryGift = async () => {
        if (!addMysteryGiftForm.mystery_gift_content_id) {
            alert('Please select a mystery gift content.');
            return;
        }
        var res;
        if (selectedUserMysteryGift) {
            res = await update_mystery_gift({
                id: selectedUserMysteryGift.id,
                ...addMysteryGiftForm,
            });
        } else {
            res = await create_mystery_gift({
                user_id: id,
                ...addMysteryGiftForm,
            });
        }
        if (res.status) {
            handleCloseAddMysteryGiftDialog();
            handleGetUserMysteryGifts();
        } else {
            alert(res.message || 'Error adding mystery gift.');
        }
    };

    const handleDeleteUserMysteryGift = async (row) => {
        if (!window.confirm('Are you sure you want to remove this mystery gift?')) return;
        var res = await delete_mystery_gift({ id: row.id });
        if (res.status) {
            handleGetUserMysteryGifts();
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
    const [openMysteryGiftDialog, setOpenMysteryGiftDialog] = useState(false);
    const [mysteryGiftForm, setMysteryGiftForm] = useState({
        prize_id: '',
        quantity: 1
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

    const handleOpenMysteryGiftDialog = () => {
        setMysteryGiftForm({
            prize_id: '',
            quantity: 1
        });
        setOpenMysteryGiftDialog(true);
    };

    const handleCloseMysteryGiftDialog = () => {
        setOpenMysteryGiftDialog(false);
    };

    const handleChangeMysteryGiftDialog = (e) => {
        const f = { ...mysteryGiftForm };
        f[e.target.name] = e.target.value;
        setMysteryGiftForm(f);
    };

    const handleSubmitMysteryGiftDialog = async () => {
        if (!mysteryGiftForm.prize_id) {
            alert('Please select a prize.');
            return;
        }

        const quantity = Number(mysteryGiftForm.quantity || 1);
        if (Number.isNaN(quantity) || quantity < 1) {
            alert('Quantity must be at least 1.');
            return;
        }

        const res = await create_user_mystery_gift({
            user_id: id,
            prize_id: mysteryGiftForm.prize_id,
            quantity
        });

        if (res.status) {
            handleGetUserDraws();
            getData();
            setOpenMysteryGiftDialog(false);
        } else {
            alert(res.message || 'Unable to create mystery gift draw.');
        }
    };


    useEffect(() => {
        getData();
        handleGetUserDraws();
        handleGetUserMysteryGifts();
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
                            <tr>
                                <td style={{ fontWeight: "bold" }}>Draw Count</td>
                                <td>{userDraws.length}</td>
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
                            <Tab label="Mystery Gifts" value="mystery_gifts"></Tab>
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
                            <>

                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Draw #</TableCell>
                                            <TableCell>Prize</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Item Won</TableCell>
                                            <TableCell>Mystery Gift Open</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userDraws.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell>#{r.id}</TableCell>
                                                <TableCell>
                                                    {r.is_mystery_gift
                                                        ? (r.mystery_gift_content?.name || 'Mystery Gift')
                                                        : r.prize_content?.prize?.name}
                                                </TableCell>
                                                <TableCell>
                                                    {typeof r.price === 'number'
                                                        ? r.price.toFixed(2)
                                                        : (typeof r.prize_content?.price === 'number'
                                                            ? r.prize_content.price.toFixed(2)
                                                            : '')}
                                                </TableCell>
                                                <TableCell>
                                                    {((r.is_mystery_gift ? r.mystery_gift_content?.thumbnail : r.prize_content?.thumbnail)) && (
                                                        <img src={process.env.NEXT_PUBLIC_STORAGE_URL + (r.is_mystery_gift ? r.mystery_gift_content?.thumbnail : r.prize_content?.thumbnail)}
                                                            style={{
                                                                width: "40px"
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>{r.is_mystery_gift ? (r.mystery_gift_open ? 'Yes' : 'No') : '-'}</TableCell>

                                                <TableCell>{r.user_prize_status?.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                            </>
                        )}

                        {selectedTab == 'mystery_gifts' && (
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
                                    <Button variant="contained" onClick={() => handleOpenAddMysteryGiftDialog()}>
                                        Add Mystery Gift
                                    </Button>
                                </div>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Thumbnail</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Gift Price</TableCell>
                                            <TableCell>Unlock Price</TableCell>
                                            <TableCell>Obtain At (draws)</TableCell>
                                            <TableCell>Active</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userMysteryGifts.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    {r.mystery_gift_content?.thumbnail && (
                                                        <img
                                                            src={process.env.NEXT_PUBLIC_STORAGE_URL + r.mystery_gift_content.thumbnail}
                                                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>{r.mystery_gift_content?.name}</TableCell>
                                                <TableCell>{r.gift_price}</TableCell>
                                                <TableCell>{r.unlock_price}</TableCell>
                                                <TableCell>{r.obtain_at}</TableCell>
                                                <TableCell>{r.is_active ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleOpenAddMysteryGiftDialog(r)}>
                                                        <Iconify icon="tabler:edit" />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDeleteUserMysteryGift(r)}>
                                                        <Iconify icon="tabler:trash" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}

                        <br />

                    </CardContent>

                </Card>

            )
            }

            <Dialog open={openAddMysteryGiftDialog} onClose={handleCloseAddMysteryGiftDialog}>
                <DialogTitle>{selectedUserMysteryGift ? 'Edit Mystery Gift' : 'Add Mystery Gift'}</DialogTitle>
                <DialogContent>
                    <Stack direction="column" gap={2} style={{ minWidth: '400px', marginTop: '10px' }}>
                        <TextField
                            label="Mystery Gift Content"
                            name="mystery_gift_content_id"
                            select
                            value={addMysteryGiftForm.mystery_gift_content_id}
                            onChange={handleChangeAddMysteryGiftForm}
                        >
                            {mysteryGiftContents.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Gift Price"
                            name="gift_price"
                            type="number"
                            value={addMysteryGiftForm.gift_price}
                            onChange={handleChangeAddMysteryGiftForm}
                        />
                        <TextField
                            label="Unlock Price"
                            name="unlock_price"
                            type="number"
                            value={addMysteryGiftForm.unlock_price}
                            onChange={handleChangeAddMysteryGiftForm}
                        />
                        <TextField
                            label="Obtain At (after X draws)"
                            name="obtain_at"
                            type="number"
                            inputProps={{ min: 0 }}
                            value={addMysteryGiftForm.obtain_at}
                            onChange={handleChangeAddMysteryGiftForm}
                        />
                        <TextField
                            label="Active"
                            name="is_active"
                            select
                            value={addMysteryGiftForm.is_active}
                            onChange={handleChangeAddMysteryGiftForm}
                        >
                            <MenuItem value={1}>Yes</MenuItem>
                            <MenuItem value={0}>No</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddMysteryGiftDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitAddMysteryGift}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openMysteryGiftDialog}
                onClose={handleCloseMysteryGiftDialog}
            >
                <DialogTitle>Add Mystery Gift</DialogTitle>
                <DialogContent>
                    <Stack direction={"column"} gap={2} style={{ minWidth: "400px", marginTop: "10px" }}>
                        <TextField name="prize_id" select
                            value={mysteryGiftForm.prize_id} onChange={handleChangeMysteryGiftDialog}
                            label="Prize">
                            {prizes.filter((p) => p.active).map((prize) => (
                                <MenuItem key={prize.id} value={prize.id}>{prize.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            type="number"
                            label="Quantity"
                            name="quantity"
                            inputProps={{ min: 1 }}
                            value={mysteryGiftForm.quantity}
                            onChange={handleChangeMysteryGiftDialog}
                        ></TextField>

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMysteryGiftDialog}>Cancel</Button>
                    <Button variant="contained"
                        onClick={handleSubmitMysteryGiftDialog}
                    >Submit</Button>
                </DialogActions>

            </Dialog>

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
