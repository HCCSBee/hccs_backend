'use client';

import Container from '@mui/material/Container';
import {
  Card, CardContent, CardHeader, Chip, IconButton, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSettingsContext } from 'src/components/settings';
import { get_compliance_scans } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

export default function ComplianceScanListView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    get_compliance_scans().then((res) => {
      if (res.status) setRows(res.data);
    });
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Card>
        <CardHeader title="Compliance Scan Submissions" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Foreign Workers</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.company_name}</TableCell>
                  <TableCell>{r.contact_name}</TableCell>
                  <TableCell>{r.business_email}</TableCell>
                  <TableCell>{r.contact_number}</TableCell>
                  <TableCell>{r.industry}</TableCell>
                  <TableCell>{r.employess}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.has_foreign_workers ? 'Yes' : 'No'}
                      color={r.has_foreign_workers ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                    onClick={()=>{
                      router.push("/compliance_scan/" + r.id);
                    }}
                    >
                      <Iconify icon="eva:eye-fill" />
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
