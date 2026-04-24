'use client';

import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import { Card, CardContent, CardHeader, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { get_users } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'next/navigation';
import moment from 'moment';

// ----------------------------------------------------------------------

export default function UserListView() {
    const settings = useSettingsContext();
    const [users, setUsers] = useState([]);
    const router = useRouter();

    const getData = async () => {
        const { status, data } = await get_users();
        if (status) setUsers(data);
    };

    const handleOpenRow = (row) => {
        router.push(paths.users.details(row.id));
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <Container maxWidth={settings.themeStretch ? false : 'xl'}>
            <Card>
                <CardHeader title="User List" />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Email</TableCell>
                                <TableCell>Register Date</TableCell>
                                <TableCell>Tier</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{moment(user.created_at).format("YYYY-MM-DD")}</TableCell>
                                    <TableCell>{user.user_tier?.name ?? '—'}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenRow(user)}>
                                            <Iconify icon="solar:alt-arrow-right-line-duotone" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Container>
    );
}
