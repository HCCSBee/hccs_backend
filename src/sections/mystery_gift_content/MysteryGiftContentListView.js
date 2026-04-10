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
    create_mystery_gift_content, delete_mystery_gift_content,
    get_background, get_mystery_gift_contents, get_prize_tiers,
    update_mystery_gift_content, uploadImage
} from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function MysteryGiftContentListView() {
    const settings = useSettingsContext();

    const [items, setItems] = useState([]);
    const [prizeTiers, setPrizeTiers] = useState([]);
    const [backgrounds, setBackgrounds] = useState([]);
    const [selected, setSelected] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const emptyForm = {
        name: '',
        thumbnail: '',
        background: '',
        prize_tier_id: '',
    };

    const [form, setForm] = useState(emptyForm);

    // ── data fetching ─────────────────────────────────────────────────────────

    const getData = async () => {
        var res = await get_mystery_gift_contents();
        if (res.status) {
            setItems(res.data);
        }

        var { data: tiers } = await get_prize_tiers();
        if (tiers) {
            setPrizeTiers(tiers);
        }

        var { data: bgs } = await get_background();
        if (bgs) {
            setBackgrounds(bgs);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    // ── form handlers ─────────────────────────────────────────────────────────

    const handleChangeForm = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleChangeFile = async (e) => {
        if (e.target.files.length) {
            var res = await uploadImage(e.target.files[0]);
            if (res.status) {
                setForm({
                    ...form,
                    [e.target.name]: res.data.fullPath
                });
            }
        }
    };

    // ── dialog open / close ───────────────────────────────────────────────────

    const handleOpenDialog = (row = null) => {
        if (row != null) {
            setSelected(row);
            setForm({
                name: row.name,
                thumbnail: row.thumbnail,
                background: row.background,
                prize_tier_id: row.prize_tier_id,
            });
        } else {
            setSelected(null);
            setForm(emptyForm);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelected(null);
        setForm(emptyForm);
    };

    // ── submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!form.thumbnail || !form.background) {
            alert('Please upload a thumbnail and select a background.');
            return;
        }

        if (selected != null) {
            var res = await update_mystery_gift_content({
                ...form,
                id: selected.id
            });
        } else {
            var res = await create_mystery_gift_content({ ...form });
        }

        if (res.status) {
            handleCloseDialog();
            getData();
        } else {
            alert(res.message || 'Error saving mystery gift content.');
        }
    };

    // ── delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (row) => {
        var cfm = window.confirm('Are you sure you want to delete this item?');
        if (!cfm) return;

        var res = await delete_mystery_gift_content({ id: row.id });
        if (res.status) {
            getData();
        }
    };

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader
                    title="Mystery Gift Content"
                    action={
                        <Button variant="contained" onClick={() => handleOpenDialog()}>
                            Create
                        </Button>
                    }
                />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Thumbnail</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Tier</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                                            {r.background && (
                                                <img
                                                    src={process.env.NEXT_PUBLIC_STORAGE_URL + r.background}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                />
                                            )}
                                            {r.thumbnail && (
                                                <img
                                                    src={process.env.NEXT_PUBLIC_STORAGE_URL + r.thumbnail}
                                                    style={{
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        left: 0,
                                                        top: 0,
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{r.name}</TableCell>
                                    <TableCell>{r.prize_tier?.name}</TableCell>
                                    <TableCell>{moment(r.created_at).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" gap={1}>
                                            <IconButton onClick={() => handleDelete(r)}>
                                                <Iconify icon="tabler:trash" />
                                            </IconButton>
                                            <IconButton onClick={() => handleOpenDialog(r)}>
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
                    {selected != null ? 'Edit Mystery Gift Content' : 'Create Mystery Gift Content'}
                </DialogTitle>
                <DialogContent>
                    <Stack direction="column" gap={2} style={{ minWidth: '400px', marginTop: '10px' }}>
                        <TextField
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleChangeForm}
                        />
                        <TextField
                            label="Tier"
                            name="prize_tier_id"
                            select
                            SelectProps={{ native: true }}
                            value={form.prize_tier_id}
                            onChange={handleChangeForm}
                        >
                            <option value=""></option>
                            {prizeTiers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </TextField>
                        <TextField
                            label="Thumbnail"
                            name="thumbnail"
                            type="file"
                            InputLabelProps={{ shrink: true }}
                            onChange={handleChangeFile}
                        />
                        <Stack direction="row" gap={2} flexWrap="wrap">
                            {backgrounds.map((bg) => (
                                <div
                                    key={bg.id}
                                    style={{
                                        border: form.background === bg.image ? '3px solid blue' : '1px solid gray',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                    onClick={() => setForm({ ...form, background: bg.image })}
                                >
                                    <img
                                        src={process.env.NEXT_PUBLIC_STORAGE_URL + bg.image}
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                    {form.thumbnail && (
                                        <img
                                            src={process.env.NEXT_PUBLIC_STORAGE_URL + form.thumbnail}
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                left: 0,
                                                top: 0,
                                                objectFit: 'contain',
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </Stack>
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
