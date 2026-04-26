'use client';

import Container from '@mui/material/Container';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useSettingsContext } from 'src/components/settings';
import { get_compliance_scans } from 'src/components/api/api';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

export default function ComplianceScanListView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [industryFilter, setIndustryFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const getRiskLevel = (results) => {
    if (!results) return '-';
    if (typeof results === 'object') return results.riskLevel ?? '-';
    try {
      const parsed = JSON.parse(results);
      return parsed?.riskLevel ?? '-';
    } catch {
      return '-';
    }
  };

  const escapeCsvValue = (value) => {
    const str = String(value ?? '');
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const toExcelText = (value) => {
    const str = String(value ?? '').replace(/"/g, '""');
    // Force Excel to keep values like 1-5 employees as text.
    return `="${str}"`;
  };

  useEffect(() => {
    get_compliance_scans().then((res) => {
      if (res.status) setRows(res.data);
    });
  }, []);

  const rowsWithRisk = useMemo(
    () => rows.map((r) => ({ ...r, risk_level: getRiskLevel(r.results) })),
    [rows]
  );

  const industryOptions = useMemo(
    () => [...new Set(rowsWithRisk.map((r) => r.industry).filter(Boolean))].sort(),
    [rowsWithRisk]
  );

  const employeeOptions = useMemo(
    () => [...new Set(rowsWithRisk.map((r) => r.employess).filter(Boolean))].sort(),
    [rowsWithRisk]
  );

  const riskLevelOptions = useMemo(
    () => [...new Set(rowsWithRisk.map((r) => r.risk_level).filter((v) => v && v !== '-'))].sort(),
    [rowsWithRisk]
  );

  const filteredRows = useMemo(
    () => rowsWithRisk.filter((r) => {
      const industryOk = industryFilter === 'all' || r.industry === industryFilter;
      const employeeOk = employeeFilter === 'all' || r.employess === employeeFilter;
      const riskOk = riskLevelFilter === 'all' || r.risk_level === riskLevelFilter;
      return industryOk && employeeOk && riskOk;
    }),
    [rowsWithRisk, industryFilter, employeeFilter, riskLevelFilter]
  );

  const handleDownloadCsv = (includeDetails) => {
    const baseHeaders = ['id', 'industry', 'employees', 'risk_level', 'has_foreign_workers', 'submitted_at'];
    const detailHeaders = ['company', 'contact', 'email', 'phone'];
    const headers = includeDetails ? [...baseHeaders, ...detailHeaders] : baseHeaders;

    const lines = filteredRows.map((r) => {
      const rowData = [
        r.id,
        r.industry ?? '',
        toExcelText(r.employess ?? ''),
        r.risk_level ?? '',
        r.has_foreign_workers ? 'Yes' : 'No',
        r.created_at ?? '',
      ];

      if (includeDetails) {
        rowData.push(
          r.company_name ?? '',
          r.contact_name ?? '',
          r.business_email ?? '',
          r.contact_number ?? ''
        );
      }

      return rowData.map(escapeCsvValue).join(',');
    });

    const csv = ['\uFEFF', headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = includeDetails
      ? 'compliance_scans_filtered_with_details.csv'
      : 'compliance_scans_filtered_without_details.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Card>
        <CardHeader title="Compliance Scan Submissions" />
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Industry"
              select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All</MenuItem>
              {industryOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Employee Size"
              select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All</MenuItem>
              {employeeOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="Risk Level"
              select
              value={riskLevelFilter}
              onChange={(e) => setRiskLevelFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All</MenuItem>
              {riskLevelOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <Button variant="contained" onClick={() => setExportDialogOpen(true)} sx={{ ml: { md: 'auto' } }}>
              Download CSV
            </Button>
          </Stack>

          <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
            <DialogTitle>Export CSV</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Choose whether to include company contact details in this export.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
              <Button variant="outlined" onClick={() => handleDownloadCsv(false)}>
                Without Details
              </Button>
              <Button variant="contained" onClick={() => handleDownloadCsv(true)}>
                With Details
              </Button>
            </DialogActions>
          </Dialog>

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
                <TableCell>Risk Level</TableCell>
                <TableCell>Foreign Workers</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((r) => (
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
                      label={r.risk_level || '-'}
                      color={r.risk_level === 'HIGH' ? 'error' : r.risk_level === 'MEDIUM' ? 'warning' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
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
                      onClick={() => {
                        router.push(`/compliance_scan/${r.id}`);
                      }}
                    >
                      <Iconify icon="solar:alt-arrow-right-line-duotone" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Typography variant="body2" color="text.secondary">
                      No records found for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
}
