import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, useData, errorText } from '../lib/api';
import { PageHead, Field, Loading, ErrorState } from '../components/Common';
import { Button } from '../components/ui/button';

const fields = { external_id:'Task ID *', title:'Nama task *', description:'Deskripsi', status:'Status', assignees:'PIC', priority:'Prioritas', start_date:'Tanggal mulai', due_date:'Deadline', tags:'Tags', estimate:'Estimasi waktu', parent_id:'Parent Task ID', space:'Space', folder:'Folder', list:'List' };

export default function ClickUpImport() {
  const projects = useData('/projects');
  const [project, setProject] = useState(''), [file, setFile] = useState(null), [session, setSession] = useState(null);
  const [mapping, setMapping] = useState(null), [preview, setPreview] = useState(null), [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmed, setConfirmed] = useState(false);
  const invalidate = () => { setPreview(null); setConfirmed(false); setResult(null); };
  const changeMapping = next => { setMapping(next); invalidate(); };
  const analyze = async e => {
    e.preventDefault(); if (!file || !project) return;
    setBusy(true); setError(''); setSession(null); invalidate();
    try {
      const fd = new FormData(); fd.append('project_id', project); fd.append('file', file);
      const {data} = await api.post('/imports/clickup/analyze', fd);
      setSession(data); setMapping({ columns:data.columns, status_map:data.status_map, user_map:data.user_map, date_order:'DMY', estimate_unit:'milliseconds' });
    } catch(e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  const buildPreview = async () => {
    setBusy(true); setError(''); setConfirmed(false);
    try {
      const {data} = await api.post(`/imports/clickup/${session.session_id}/preview`, mapping);
      setPreview(data); setSession({...session,source_statuses:data.source_statuses,source_assignees:data.source_assignees});
    } catch(e) { setPreview(null); setError(errorText(e)); } finally { setBusy(false); }
  };
  const commit = async () => {
    setBusy(true); setError('');
    try {
      const {data} = await api.post(`/imports/clickup/${session.session_id}/commit`, { preview_hash:preview.preview_hash, confirm:true });
      setResult(data); toast.success('Impor ClickUp selesai');
    } catch(e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  if (projects.loading) return <Loading/>;
  if (projects.error) return <ErrorState error={projects.error} reload={projects.reload}/>;
  return <div className="import-page" data-testid="clickup-import-page">
    <Link to="/settings" className="back-link" data-testid="import-back"><ArrowLeft size={14}/>Pengaturan</Link>
    <PageHead eyebrow="DATA WORKSPACE" title="Impor ClickUp"/>
    <form className="import-step" onSubmit={analyze} data-testid="import-upload-form">
      <h2 data-testid="import-upload-heading">1. File & project tujuan</h2>
      <div className="import-mapping-grid">
        <Field label="Project tujuan" name="import_project" as="select" required value={project} onChange={e => {setProject(e.target.value);setSession(null);invalidate();}} options={[{value:'',label:'Pilih project'},...projects.data.map(p => ({value:p.id,label:p.name}))]}/>
        <Field label="CSV ClickUp (maks. 2 MB / 2.000 baris)" name="import_file" type="file" accept=".csv,text/csv" required onChange={e => {setFile(e.target.files[0] || null);setSession(null);invalidate();}}/>
      </div>
      <div className="import-actions"><Button type="submit" className="primary-button" data-testid="import-analyze" disabled={busy || !file || !project}><FileUp size={15}/>{busy ? 'Memproses...' : 'Baca CSV'}</Button><a className="link-button" data-testid="import-example-download" href="/clickup-example.csv" download>Contoh CSV</a><a className="link-button" href="/panduan-migrasi-backup.md" download data-testid="import-backup-guide">Panduan migrasi & backup</a></div>
    </form>
    {session && mapping && !result && <>
      <section className="import-step" data-testid="import-column-mapping">
        <h2 data-testid="import-mapping-heading">2. Pemetaan kolom · {session.row_count} baris</h2>
        <div className="import-mapping-grid">{Object.entries(fields).map(([key,label]) => <Field key={key} label={label} name={`import_column_${key}`} as="select" value={mapping.columns[key] || ''} onChange={e => changeMapping({...mapping,columns:{...mapping.columns,[key]:e.target.value}})} options={[{value:'',label:'Tidak dipetakan'},...session.headers.map(h => ({value:h,label:h}))]}/>)}</div>
        <div className="import-mapping-grid" style={{marginTop:16}}>
          <Field label="Urutan tanggal CSV" name="import_date_order" as="select" value={mapping.date_order} onChange={e => changeMapping({...mapping,date_order:e.target.value})} options={[{value:'DMY',label:'Hari / Bulan / Tahun'},{value:'MDY',label:'Bulan / Hari / Tahun'}]}/>
          <Field label="Satuan estimasi numerik" name="import_estimate_unit" as="select" value={mapping.estimate_unit} onChange={e => changeMapping({...mapping,estimate_unit:e.target.value})} options={[{value:'milliseconds',label:'Milidetik (ClickUp)'},{value:'minutes',label:'Menit'},{value:'hours',label:'Jam'}]}/>
        </div>
      </section>
      <section className="import-step" data-testid="import-value-mapping">
        <h2 data-testid="import-values-heading">3. Status & penanggung jawab</h2>
        <div className="import-mapping-grid">
          {session.source_statuses.map((source,i) => <Field key={`status-${source}`} label={`Status: ${source}`} name={`import_status_${i}`} as="select" value={mapping.status_map[source] || ''} onChange={e => changeMapping({...mapping,status_map:{...mapping.status_map,[source]:e.target.value}})} options={[{value:'',label:'Pilih status tujuan'},...session.statuses.map(s => ({value:s.name,label:s.name}))]}/>)}
          {session.source_assignees.map((source,i) => <Field key={`user-${source}`} label={`PIC: ${source}`} name={`import_user_${i}`} as="select" value={mapping.user_map[source] || ''} onChange={e => changeMapping({...mapping,user_map:{...mapping.user_map,[source]:e.target.value}})} options={[{value:'',label:'Pilih akun tujuan'},{value:'__unassigned__',label:'Tanpa PIC'},...session.people.map(p => ({value:p.id,label:`${p.name} · ${p.role}`}))]}/>)}
        </div>
        <div className="import-actions"><Button className="primary-button" data-testid="import-preview" disabled={busy} onClick={buildPreview}>{busy ? 'Memproses...' : 'Pratinjau impor'}</Button></div>
      </section>
      {preview && <section className="import-step" data-testid="import-preview-panel">
        <h2 data-testid="import-preview-heading">4. Konfirmasi impor</h2>
        <p data-testid="import-preview-counts">{preview.tasks} task · {preview.subtasks} subtask · {preview.duplicates} task duplikat dilewati</p>
        <ul className="import-list">{preview.warnings.map((w,i) => <li key={i} data-testid={`import-warning-${i}`}>{w}</li>)}</ul>
        {preview.errors.length > 0 && <ul className="form-error import-list" data-testid="import-validation-errors">{preview.errors.map((e,i) => <li key={i} data-testid={`import-validation-error-${i}`}>Baris {e.row}: {e.message}</li>)}</ul>}
        <ul className="import-preview-list" data-testid="import-preview-rows">{preview.rows.map(r => <li key={r.id} data-testid={`import-preview-row-${r.id}`}><b>{r.parent_external_id ? '↳ ' : ''}{r.title}</b><small>{r.external_id} · {r.status} · {r.priority} · {r.due_date || 'Tanpa deadline'}</small></li>)}</ul>
        {preview.valid && <label className="checkbox-label"><input type="checkbox" data-testid="import-confirm-checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>Saya sudah memeriksa pratinjau dan menyiapkan backup yang diperlukan.</label>}
        <div className="import-actions"><Button className="primary-button" data-testid="import-commit" disabled={busy || !preview.valid || !confirmed} onClick={commit}>{busy ? 'Mengimpor...' : 'Konfirmasi & impor'}</Button></div>
      </section>}
    </>}
    {error && <p className="form-error" role="alert" data-testid="import-error">{error}</p>}
    {result && <section className="import-result" data-testid="import-result"><h2 data-testid="import-result-heading"><CheckCircle2 size={18}/> Impor selesai</h2><p data-testid="import-result-counts">{result.imported} task dan {result.subtasks_imported} subtask ditambahkan. {result.skipped} task yang sudah ada dilewati.</p><Link className="link-button" to={`/projects/${result.project_id}/kanban`} data-testid="import-open-project">Buka Kanban project →</Link></section>}
  </div>;
}