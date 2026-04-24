'use client';

import Container from '@mui/material/Container';
import {
  Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import {
  get_news, create_news, update_news, delete_news,
  get_news_categories,
} from 'src/components/api/api';

const EMPTY_FORM = {
  title: '',
  date: '',
  short_description: '',
  long_description: '',
  content: '',
  news_category_id: '',
};

export default function NewsListView() {
  const settings = useSettingsContext();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const getData = async () => {
    const [newsRes, catRes] = await Promise.all([get_news(), get_news_categories()]);
    if (newsRes.status) setRows(newsRes.data);
    if (catRes.status) setCategories(catRes.data);
  };

  useEffect(() => { getData(); }, []);

  const handleOpen = (row = null) => {
    setSelected(row);
    setForm(row ? {
      title: row.title ?? '',
      date: row.date ?? '',
      short_description: row.short_description ?? '',
      long_description: row.long_description ?? '',
      content: row.content ?? '',
      news_category_id: row.news_category_id ?? '',
    } : EMPTY_FORM);
    setOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const payload = selected ? { ...form, id: selected.id } : form;
    const res = selected ? await update_news(payload) : await create_news(payload);
    if (res.status) {
      setOpen(false);
      getData();
    } else {
      alert(res.message || 'Error saving');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete article "${row.title}"?`)) return;
    const res = await delete_news({ id: row.id });
    if (res.status) getData();
    else alert(res.message || 'Error deleting');
  };

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.text ?? '-';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Card>
        <CardHeader
          title="News Articles"
          action={<Button variant="contained" onClick={() => handleOpen()}>Create</Button>}
        />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    {r.news_category ? (
                      <Chip label={r.news_category.text} size="small" />
                    ) : getCategoryName(r.news_category_id)}
                  </TableCell>
                  <TableCell>{r.date ?? '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpen(r)}>
                      <Iconify icon="mdi:pencil-outline" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r)}>
                      <Iconify icon="mdi:trash-can-outline" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{selected ? 'Edit Article' : 'Create Article'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} />
            <TextField fullWidth label="Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField
              fullWidth select label="Category" name="news_category_id"
              value={form.news_category_id} onChange={handleChange}
            >
              <MenuItem value="">— None —</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.text}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Short Description" name="short_description" value={form.short_description} onChange={handleChange} multiline rows={2} />
            <TextField fullWidth label="Long Description" name="long_description" value={form.long_description} onChange={handleChange} multiline rows={3} />
            <TextField fullWidth label="Content" name="content" value={form.content} onChange={handleChange} multiline rows={5} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
