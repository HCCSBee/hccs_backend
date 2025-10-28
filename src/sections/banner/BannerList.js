'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import { create_banner, get_banners, get_users, update_banner, uploadCommonImage, uploadImage } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function BannerListView() {
    const settings = useSettingsContext();
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [openBannerForm, setOpenBannerForm] = useState(false);
    const [banners, setBanners] = useState([]);
    const router = useRouter();
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [form, setForm] = useState({
        image: "",
        link: ""
    });

    const handleOpenBanner = (row = null) => {
        if (row != null) {
            setSelectedBanner(row);
            setForm({
                image: row.image,
                link: row.link
            });
        }
        setOpenBannerForm(true);
    }


    const handleChangeFile = async (e) => {
        var file = e.target.files[0];
        var res = await uploadCommonImage(file, "banners/");
        if (res.status) {
            setForm({
                ...form,
                image: res.data.fullPath
            });
        }

    };
    const getData = async () => {
        var { status, data } = await get_banners();
        if (status) {
            console.log(data);
            setBanners(data)
        }
    };

    const handleOpenRow = (row) => {
        // router.push(paths.users.details(row.id));
    }

    useEffect(() => {
        getData();
    }, []);

    const handleCloseBanner = () => {
        setOpenBannerForm(false);
        setSelectedBanner(null);
    }

    const handleDeleteBanner = async (row) => {
        var res = await update_banner({
            id: row.id,
            deleted: 1
        });
        if (res.status) {
            getData();
        }
    }
    const handleSubmit = async () => {
        setLoadingUpload(true);

        if (selectedBanner != null) {
            var res = await update_banner({
                ...form,
                id: selectedBanner.id
            })
        } else {
            var res = await create_banner({
                ...form
            })
        }

        if (res.status) {
            handleCloseBanner();
            getData();
        }
        setLoadingUpload(false);
    };

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="Banners"
                    action={<Button
                        variant='contained'
                        onClick={() => {
                            handleOpenBanner();
                        }}
                    >
                        Create
                    </Button>}
                />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/* <TableCell>User</TableCell> */}
                                <TableCell>Image</TableCell>
                                <TableCell>Link</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {banners.map((r) => (
                                <TableRow key={r.id}>

                                    <Table>
                                        <img src={process.env.NEXT_PUBLIC_STORAGE_URL + r.image}
                                            style={{
                                                height: "80px"
                                            }}
                                        />
                                    </Table>
                                    <TableCell>
                                        {r.link}
                                    </TableCell>
                                    <TableCell>
                                        <Stack gap={1} direction="row">
                                            <IconButton
                                                onClick={() => {
                                                    handleDeleteBanner(r);
                                                }}
                                            >
                                                <Iconify icon="meteor-icons:trash" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    handleOpenBanner(r);
                                                }}
                                            >
                                                <Iconify icon="solar:alt-arrow-right-line-duotone" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}


                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={openBannerForm}
                onClose={() => {
                    handleCloseBanner();
                }}
            >
                <DialogTitle>{selectedBanner != null ? "Edit Banner" : "Create Banner"}</DialogTitle>
                <DialogContent style={{
                    paddingTop: "10px"
                }} >
                    <Stack gap={1}>
                        {selectedBanner && (
                            <img src={process.env.NEXT_PUBLIC_STORAGE_URL + selectedBanner.image} style={{

                            }} />
                        )}
                        <TextField fullWidth type="file" onChange={handleChangeFile}  ></TextField>

                        <TextField fullWidth name="link" type="text" value={form.link}
                            InputLabelProps={{
                                shrink: true
                            }}
                            label="Link" placeholder="https://...." onChange={(e) => {
                                setForm({
                                    ...form,
                                    [e.target.name]: e.target.value
                                });
                            }} ></TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={handleSubmit}
                    >
                        {loadingUpload ? (
                            <CircularProgress size="1.5em" />
                        ) :
                            <>Upload</>}

                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
