'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Button, Card, CardActions, CardContent, CardHeader, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';
import Link from 'next/link';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import { create_prize } from 'src/components/api/api';

// ----------------------------------------------------------------------

export default function PrizeCreateView() {
    const settings = useSettingsContext();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: "",
        price: 0,
        slots: 0,
    });

    const router = useRouter();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const getData = async () => {
        var { data } = await supabase.from("gift_category").select("*");
        setCategories(data);
    };

    const handleSubmit = async () => {
        var res = await create_prize(form);
        if (res.status) {
            router.push(paths.prizes.root)
        } else {
            alert(res.message);
        }


    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="Create"

                ></CardHeader>
                <CardContent>
                    <Stack gap={2}>
                        <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
                        <TextField label="Price" name="price" type="number" value={form.price} onChange={handleChange} fullWidth />
                        <TextField label="Slots" name="slots" type="number" value={form.slots} onChange={handleChange} fullWidth />
                        <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth />
                    </Stack>
                </CardContent>
                <CardActions style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                }}>
                    <Button
                        onClick={handleSubmit}
                        variant='contained'>Submit</Button>
                </CardActions>
            </Card>



        </Container>
    );
}
