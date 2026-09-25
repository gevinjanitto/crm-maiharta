import asyncio, logging
from pathlib import Path
from fastapi import HTTPException
<<<<<<< HEAD
from core import db, uid, now, log_activity
from storage import put_object

DOC_TYPES = ['Kontrak','Requirement','Rincian Fitur','Timeline','UI/UX Design','Penawaran Harga','Invoice','Akses Server','BAST','Dokumentasi Penggunaan','Lampiran Project','Lampiran Task']
=======
from core import db, uid, now
from storage import put_object

DOC_TYPES = ['Kontrak','Requirement','Rincian Fitur','Timeline','UI/UX Design','Penawaran Harga','Invoice','Akses Server','BAST','Dokumentasi Penggunaan','Lampiran Task']
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
ALLOWED_EXT = ['.pdf','.docx','.xlsx','.txt','.csv','.png','.jpg','.jpeg','.webp']

async def store_document(pid, u, file, kind, visibility='Internal', task_id=None):
    if kind not in DOC_TYPES or visibility not in ['Internal','Client']: raise HTTPException(400,'Kategori atau visibilitas tidak valid.')
    if kind=='Akses Server' and visibility=='Client': raise HTTPException(400,'Dokumen akses server wajib internal.')
    ext=Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_EXT: raise HTTPException(400,'Format tidak didukung. Gunakan PDF, DOCX, XLSX, TXT, CSV, atau gambar.')
    data=await file.read(10*1024*1024+1)
    if not data or len(data)>10*1024*1024: raise HTTPException(400,'File harus berukuran 1 byte hingga 10 MB.')
    doc_id=uid()
    try: result=await asyncio.to_thread(put_object,f'crm-maiharta/uploads/{u["id"]}/{doc_id}{ext}',data,file.content_type or 'application/octet-stream')
    except Exception as e:
        logging.getLogger(__name__).warning('Cloudinary upload gagal: %s', e)
        raise HTTPException(503,'Penyimpanan dokumen (Cloudinary) belum dapat dihubungi. Periksa konfigurasi CLOUDINARY_* di server.')
    doc={'id':doc_id,'project_id':pid,'name':Path(file.filename).name,'kind':kind,'visibility':visibility,'size':len(data),'storage_path':result['path'],'content_type':file.content_type or 'application/octet-stream','created_at':now(),'uploaded_by':u['name'],'is_deleted':False}
    if task_id: doc['task_id']=task_id
    await db.project_documents.insert_one(doc.copy())
<<<<<<< HEAD
    await log_activity(u, 'unggah', 'dokumen', doc_id, doc['name'], pid, {'kategori': kind})
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
    doc.pop('storage_path')
    return doc
