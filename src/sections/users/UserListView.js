'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useSettingsContext } from 'src/components/settings';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from 'src/auth/context/supabase/lib';

// ----------------------------------------------------------------------

export default function UserListView() {
    const settings = useSettingsContext();
    const [users, setUsers] = useState([]);

    const getData = async () => {
        // var users = await supabase.from("user").select("*");
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Typography variant="h4"> Users </Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>User</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                </TableBody>
            </Table>
        </Container>
    );
}
