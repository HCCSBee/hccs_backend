'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { create_prize, create_prize_content, get_background, get_prize, get_prize_content, get_prize_tiers, insert_prize_image, update_prize_content, uploadImage } from 'src/components/api/api';
import { get, set } from 'lodash';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PrizeDetailView({ id }) {
    const settings = useSettingsContext();

    const [data, setData] = useState(null);
    const [prizeTiers, setPrizeTiers] = useState([]);
    const [selectedTab, setSelectedTab] = useState('content');
    const [openContentDialog, setOpenContentDialog] = useState(false);
    const [selectedPrize, setSelectedPrize] = useState(null);
    const [backgrounds, setBackgrounds] = useState([]);

    const [contentDialogForm, setContentDialogForm] = useState({
        name: "",
        price: 0,
        tier: 1,
        percentage: "",
        unlock_after: 0,
        thumbnail: "",
        background: ""
    });

    const handleChangeContentDialog = (e) => {
        setContentDialogForm({
            ...contentDialogForm,
            [e.target.name]: e.target.value
        });
    }
    const handleOpenContentDialog = (prize) => {
        if (prize != null) {
            setSelectedPrize(prize);
            setContentDialogForm({
                name: prize.name,
                price: prize.price,
                tier: prize.tier,
                percentage: prize.percentage,
                unlock_after: prize.unlock_after,
                thumbnail: prize.thumbnail,
                background: prize.background
            });

        } else {
            setSelectedPrize(null);
        }
        setOpenContentDialog(true);
    };

    const handleCloseContentDialog = () => {
        setOpenContentDialog(false);
        setSelectedPrize(null);
        setContentDialogForm({
            name: "",
            price: 0,
            tier: 1,
            percentage: "",
            unlock_after: 0,
            thumbnail: "",
            background: ""
        });
    }


    const [contents, setContents] = useState([]);
    const getData = async () => {
        var res = await get_prize(id);
        if (res.status) {
            setData(res.data);
        }

        var { data: tiers } = await get_prize_tiers();
        if (tiers) {
            setPrizeTiers(tiers);
        }

        var { data: bgs } = await get_background();
        if (bgs) {
            setBackgrounds(bgs);
        }

        var { data: contentData } = await get_prize_content({ id: id });
        if (contentData) {
            setContents(contentData);
        }
    };

    const handleChangeFile = async (e) => {
        if (e.target.files.length) {
            var res = await uploadImage(e.target.files[0]);
            if (res.status) {
                setContentDialogForm({
                    ...contentDialogForm,
                    [e.target.name]: res.data.fullPath
                });
            }
        }
    };

    const handleSubmitContentDialog = async () => {
        if (contentDialogForm.thumbnail == "" || contentDialogForm.background == "") {
            alert("Please upload thumbnail and select background");
            return;

        }
        console.log(selectedPrize);
        if (selectedPrize != null) {
            var res = await update_prize_content({
                ...contentDialogForm,
                id: selectedPrize.id,
                prize_id: id
            });
        } else {
            var res = await create_prize_content({
                ...contentDialogForm,

                prize_id: id
            });
        }

        if (res.status) {
            alert("Created prize content");
            handleCloseContentDialog();
            getData();
        } else {
            alert("Error creating prize content");
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
                        </table>

                        <Divider></Divider>
                        <br />
                        <Tabs
                            value={selectedTab}
                            onChange={(e, v) => {
                                setSelectedTab(v);
                            }}
                        >
                            <Tab label="Content" value="content"></Tab>
                            <Tab label="Draws" value="draws"></Tab>
                        </Tabs>
                        {selectedTab == 'content' && (
                            <>
                                <Stack direction={"row"} justifyContent={"flex-end"} alignItems={"flex-end"}>
                                    <Button variant="contained"
                                        onClick={() => {
                                            handleOpenContentDialog();
                                        }}
                                    >Create</Button>

                                </Stack>

                                <Stack direction={"row"} gap={2} style={{ marginTop: "20px" }}>
                                    {contents.map(c => (
                                        <div key={c.id} style={{
                                            width: "300px",
                                            border: "1px solid #f1f1f1",
                                        }}>
                                            <div style={{
                                                position: "relative",
                                                width: "100%",
                                                height: "300px",
                                            }}>
                                                <Stack
                                                    style={{
                                                        position: "absolute",
                                                        top: "5px",
                                                        right: "5px",
                                                        zIndex: 3
                                                    }}
                                                    direction={"row"}
                                                >
                                                    <IconButton
                                                        onClick={() => {
                                                            handleOpenContentDialog(c)
                                                        }}
                                                        style={{
                                                            backgroundColor: "white",
                                                            cursor: "pointer"
                                                        }}>
                                                        <Iconify icon="tabler:edit" />
                                                    </IconButton>
                                                </Stack>
                                                <img src={process.env.NEXT_PUBLIC_STORAGE_URL + c.background}
                                                    style={{
                                                        width: '300px',
                                                        height: '300px',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                <img src={process.env.NEXT_PUBLIC_STORAGE_URL + c.thumbnail}
                                                    style={{
                                                        position: "absolute",
                                                        width: "100%",
                                                        height: "100%",
                                                        left: 0,
                                                        top: 0,
                                                        objectFit: "contain",
                                                    }}
                                                />


                                            </div>
                                            <p style={{
                                                textAlign: "center"
                                            }}>{c.name}</p>
                                            <p style={{
                                                textAlign: "center"
                                            }}>{c.price}</p>
                                        </div>
                                    ))}
                                </Stack>
                            </>
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
                <DialogTitle>Prize</DialogTitle>
                <DialogContent>
                    <Stack direction={"column"} gap={2} style={{ minWidth: "400px", marginTop: "10px" }}>
                        <TextField label="Name" name="name" value={contentDialogForm.name} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Price" name="price" type="number" value={contentDialogForm.price} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Tier" name="tier" select SelectProps={{ native: true }} value={contentDialogForm.tier} onChange={handleChangeContentDialog}>
                            {
                                prizeTiers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))
                            }
                        </TextField>
                        <TextField label="Percentage" name="percentage" value={contentDialogForm.percentage} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Unlock After (amount)" name="unlock_after" type="number" value={contentDialogForm.unlock_after} onChange={handleChangeContentDialog}></TextField>
                        <TextField label="Thumbnail URL" name="thumbnail"
                            InputLabelProps={{
                                shrink: true
                            }}
                            onChange={handleChangeFile} type="file"></TextField>
                        <Stack direction={"row"} gap={2}>
                            {backgrounds.map(bg => (
                                <div key={bg.id}

                                    style={{
                                        border: contentDialogForm.background == bg.image ? "3px solid blue" : "1px solid gray",
                                        cursor: "pointer",
                                        position: "relative"
                                    }}
                                    onClick={() => {
                                        setContentDialogForm({
                                            ...contentDialogForm,
                                            background: bg.image
                                        });
                                    }}
                                >
                                    <img src={process.env.NEXT_PUBLIC_STORAGE_URL + bg.image}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <img src={process.env.NEXT_PUBLIC_STORAGE_URL + contentDialogForm.thumbnail}
                                        style={{
                                            position: "absolute",
                                            width: "100%",
                                            height: "100%",
                                            left: 0,
                                            top: 0,
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>
                            ))}

                        </Stack>
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
