'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import { create_background, delete_background, get_background, uploadImage, uploadImageBackground } from 'src/components/api/api';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function BackgroundListView() {
    const settings = useSettingsContext();

    const [backgrounds, setBackgrounds] = useState([]);
    const getData = async () => {
        var { status, data } = await get_background();
        if (status) {
            setBackgrounds(data);
        }
    };

    const handleChangeFile = async (e) => {
        var file = e.target.files[0];
        const { status, data } = await uploadImageBackground(file);
        if (status) {
            var res = await create_background({
                image: data.fullPath
            });
            if (res.status) {
                getData();
            }
        }
    }

    const handleDeleteBackground = async (row) => {
        var { status } = await delete_background({
            id: row.id
        });
        if (status) {
            getData();
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4"> Backgrounds </Typography>

            <TextField type="file" onChange={handleChangeFile} />
            <Stack direction={"row"} gap={2} style={{
                paddingTop: "20px"
            }}
                flexWrap="wrap">

                {backgrounds.map((bg) => (
                    <div style={{
                        position: "relative"
                    }} key={bg.id}>
                        <Tooltip title="Delete Background">
                            <IconButton
                                onClick={() => { handleDeleteBackground(bg) }}
                                style={{
                                    position: "absolute",
                                    top: "5px",
                                    right: "5px",
                                    backgroundColor: "white"
                                }}
                            >
                                <Iconify icon="eva:close-circle-outline" width={24} height={24} />
                            </IconButton>
                        </Tooltip>
                        <Box key={bg.id}
                            style={{
                                width: "300px",
                                height: "300px",
                                objectFit: "cover",
                                border: "1px solid #d1d1d1"
                            }}
                            src={process.env.NEXT_PUBLIC_STORAGE_URL + bg.image}
                            component="img"
                        />
                    </div>
                ))}
            </Stack>
        </Container>
    )
}
