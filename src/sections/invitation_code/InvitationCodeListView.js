'use client';

import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import {
    Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, MenuItem, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
    create_invitation_code, delete_invitation_code, get_invitation_codes,
    get_users, update_invitation_code
} from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function InvitationCodeListView() {
    const settings = useSettingsContext();

    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [createQty, setCreateQty] = useState(1);
    const [form, setForm] = useState({
        code: '',
        is_active: 1,
        user_id: ''
    });

    const getData = async () => {
        var res = await get_invitation_codes();
        if (res.status) {
            setItems(res.data);
        }

        var userRes = await get_users();
        if (userRes.status) {
            setUsers(userRes.data);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleOpenCreateDialog = () => {
        setSelected(null);
        setCreateQty(1);
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (row) => {
        setSelected(row);
        setForm({
            code: row.code || '',
            is_active: row.is_active ?? 1,
            user_id: row.user_id || ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelected(null);
        setCreateQty(1);
        setForm({ code: '', is_active: 1, user_id: '' });
    };

    const handleChangeForm = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        let res;
        if (selected != null) {
            res = await update_invitation_code({
                id: selected.id,
                ...form
            });
        } else {
            const qty = Number(createQty || 0);
            if (Number.isNaN(qty) || qty < 1) {
                alert('Quantity must be at least 1.');
                return;
            }
            res = await create_invitation_code({ quantity: qty });
        }

        if (res.status) {
            handleCloseDialog();
            getData();
        } else {
            alert(res.message || 'Error saving invitation code.');
        }
    };

    const handleDelete = async (row) => {
        var cfm = window.confirm('Are you sure you want to delete this item?');
        if (!cfm) return;

        var res = await delete_invitation_code({ id: row.id });
        if (res.status) {
            getData();
        }
    };

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader
                    title="Invitation Codes"
                    action={
                        <Button variant="contained" onClick={handleOpenCreateDialog}>
                            Create
                        </Button>
                    }
                />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.code}</TableCell>
                                    <TableCell>{r.is_active ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{r.user?.email}</TableCell>
                                    <TableCell>{moment(r.created_at).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" gap={1}>
                                            <IconButton onClick={() => handleDelete(r)}>
                                                <Iconify icon="tabler:trash" />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenEditDialog(r)}>
                                                <Iconify icon="tabler:edit" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selected != null ? 'Edit Invitation Code' : 'Create Invitation Codes'}
                </DialogTitle>
                <DialogContent>
                    <Stack direction="column" gap={2} style={{ minWidth: '400px', marginTop: '10px' }}>
                        {selected == null && (
                            <TextField
                                label="Quantity"
                                type="number"
                                inputProps={{ min: 1 }}
                                value={createQty}
                                onChange={(e) => setCreateQty(e.target.value)}
                            />
                        )}

                        {selected != null && (
                            <>
                                <TextField
                                    label="Code"
                                    name="code"
                                    value={form.code}
                                    onChange={handleChangeForm}
                                />
                                <TextField
                                    label="Active"
                                    name="is_active"
                                    select
                                    value={form.is_active}
                                    onChange={handleChangeForm}
                                >
                                    <MenuItem value={1}>Yes</MenuItem>
                                    <MenuItem value={0}>No</MenuItem>
                                </TextField>
                                <TextField
                                    label="User"
                                    name="user_id"
                                    select
                                    value={form.user_id}
                                    onChange={handleChangeForm}
                                >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>{u.email}</MenuItem>
                                    ))}
                                </TextField>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
