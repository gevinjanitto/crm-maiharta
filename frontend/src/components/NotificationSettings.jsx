import React, { useEffect, useState } from 'react';
import { Bell, RefreshCw, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api, errorText, useData } from '../lib/api';
import { Field, Loading, ErrorState } from './Common';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

const statusLabels = { accepted: 'Diterima layanan', sent: 'Terkirim', delivered: 'Sampai', read: 'Dibaca', failed: 'Gagal', skipped: 'Tidak dikirim' };

export const NotificationSettings = () => {
  const settings = useData('/account/notifications');
  const history = useData('/account/notifications/deliveries');
  const [form, setForm] = useState(null), [busy, setBusy] = useState(false), [testing, setTesting] = useState(false), [error, setError] = useState('');
  useEffect(() => { if (settings.data) setForm(settings.data); }, [settings.data]);
  const save = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { in_app, email, whatsapp, whatsapp_number } = form;
      await api.patch('/account/notifications', { in_app, email, whatsapp, whatsapp_number });
      toast.success('Preferensi notifikasi disimpan'); settings.reload();
    } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  const test = async () => {
    setTesting(true);
    try { const r = await api.post('/account/notifications/test'); toast.success(r.data.message); history.reload(); }
    catch (e) { toast.error(errorText(e)); } finally { setTesting(false); }
  };
  if (settings.loading) return <Loading/>;
  if (settings.error) return <ErrorState error={settings.error} reload={settings.reload}/>;
  if (!form) return null;
  return <section className="panel panel-padding notification-settings" data-testid="notification-settings">
    <div className="section-heading"><h2 data-testid="notification-settings-heading">Notifikasi akun</h2><Bell size={18}/></div>
    <form onSubmit={save} data-testid="notification-settings-form">
      <p className="form-note" data-testid="notification-registered-email">Email terdaftar: {form.registered_email}</p>
      <div className="notification-channel-list">
        {[['in_app','Dalam aplikasi'], ['email','Email'], ['whatsapp','WhatsApp']].map(([key,label]) => <label className="notification-channel" key={key} data-testid={`notification-channel-${key}`}>
          <span>{label}</span><Switch data-testid={`notification-toggle-${key}`} checked={form[key]} onCheckedChange={value => setForm({...form,[key]:value})} aria-label={`Notifikasi ${label}`}/>
        </label>)}
      </div>
      <Field label="Nomor WhatsApp terdaftar" name="notification_whatsapp_number" type="tel" autoComplete="tel" value={form.whatsapp_number} placeholder="+628123456789" onChange={e => setForm({...form,whatsapp_number:e.target.value})} required={form.whatsapp}/>
      {form.whatsapp && <p className="form-note" data-testid="notification-whatsapp-consent">Dengan menyimpan WhatsApp aktif, saya menyetujui notifikasi akun pada nomor ini. Saya dapat menonaktifkannya kapan saja.</p>}
      <p className="form-note" data-testid="notification-provider-status">Email: {form.email_configured ? 'Terkonfigurasi' : 'Belum dikonfigurasi'} · WhatsApp: {form.whatsapp_configured ? 'Terkonfigurasi' : 'Menunggu aktivasi layanan'}</p>
      {error && <p className="form-error" role="alert" data-testid="notification-settings-error">{error}</p>}
      <div className="form-actions"><Button className="primary-button" data-testid="notification-save" type="submit" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan notifikasi'}</Button></div>
    </form>
    <div className="section-heading notification-history-head"><h2 data-testid="notification-history-heading">Pengiriman terakhir</h2><div className="row-actions">
      <Button variant="outline" data-testid="notification-test" disabled={testing} onClick={test}><Send size={14}/>Uji</Button>
      <button className="icon-button" data-testid="notification-refresh-history" title="Muat ulang pengiriman" onClick={history.reload}><RefreshCw size={15}/></button>
    </div></div>
    {history.error && <p className="form-error" data-testid="notification-history-error">{history.error}</p>}
    <ul className="notification-deliveries" data-testid="notification-deliveries">{(history.data || []).slice(0,5).map(row => <li key={row.id} data-testid={`delivery-${row.id}`}><span>{row.channel === 'email' ? 'Email' : 'WhatsApp'} · {statusLabels[row.status] || row.status}</span><small>{row.reason || new Date(row.created_at).toLocaleString('id-ID')}</small></li>)}</ul>
    {!history.data?.length && <p className="form-note" data-testid="notification-deliveries-empty">Belum ada pengiriman eksternal.</p>}
    <a href="/panduan-notifikasi.md" download className="link-button" data-testid="notification-activation-guide">Panduan aktivasi email & WhatsApp</a>
  </section>;
};