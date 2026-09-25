<<<<<<< HEAD
import os
import logging
from pathlib import Path
=======
<<<<<<< HEAD
import os
import logging
from pathlib import Path
=======
<<<<<<< HEAD
import os
import logging
from pathlib import Path
=======
<<<<<<< HEAD
import os
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
import requests
import cloudinary
import cloudinary.uploader
import cloudinary.utils

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
LOCAL_DIR = Path(__file__).parent / 'uploads'

def _configured():
    return all(os.environ.get(k) for k in ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'])

def _configure():
    cloudinary.config(cloud_name=os.environ['CLOUDINARY_CLOUD_NAME'], api_key=os.environ['CLOUDINARY_API_KEY'], api_secret=os.environ['CLOUDINARY_API_SECRET'], secure=True)

def put_object(path, data, content_type):
    if not _configured():
        logging.getLogger(__name__).warning('Cloudinary belum dikonfigurasi, menyimpan file secara lokal.')
        target = LOCAL_DIR / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        return {'path': 'local:' + path, 'url': ''}
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
def _configure():
    name, key, secret = os.environ.get('CLOUDINARY_CLOUD_NAME'), os.environ.get('CLOUDINARY_API_KEY'), os.environ.get('CLOUDINARY_API_SECRET')
    if not (name and key and secret): raise RuntimeError('Cloudinary belum dikonfigurasi.')
    cloudinary.config(cloud_name=name, api_key=key, api_secret=secret, secure=True)

def put_object(path, data, content_type):
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    _configure()
    r = cloudinary.uploader.upload(data, public_id=path, resource_type='raw', type='authenticated', overwrite=False, use_filename=False, unique_filename=False)
    return {'path': r['public_id'], 'url': r['secure_url']}

def get_object(path):
<<<<<<< HEAD
    if path.startswith('local:'): return (LOCAL_DIR / path[6:]).read_bytes()
=======
<<<<<<< HEAD
    if path.startswith('local:'): return (LOCAL_DIR / path[6:]).read_bytes()
=======
<<<<<<< HEAD
    if path.startswith('local:'): return (LOCAL_DIR / path[6:]).read_bytes()
=======
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    _configure()
    url, _ = cloudinary.utils.cloudinary_url(path, resource_type='raw', type='authenticated', sign_url=True)
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.content

def delete_object(path):
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
    if path.startswith('local:'):
        (LOCAL_DIR / path[6:]).unlink(missing_ok=True); return
    _configure()
    cloudinary.uploader.destroy(path, resource_type='raw', type='authenticated', invalidate=True)
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
=======
    _configure()
    cloudinary.uploader.destroy(path, resource_type='raw', type='authenticated', invalidate=True)
=======
import os, requests
STORAGE_BASE = os.environ['INTEGRATION_PROXY_URL'].strip()
STORAGE_URL = STORAGE_BASE.rstrip('/') + '/objstore/api/v1/storage'
storage_key = None
def init_storage(force=False):
    global storage_key
    if storage_key and not force: return storage_key
    r = requests.post(f'{STORAGE_URL}/init',json={'emergent_key':os.environ['EMERGENT_LLM_KEY']},timeout=30)
    r.raise_for_status()
    storage_key = r.json()['storage_key']
    return storage_key
def put_object(path,data,content_type):
    r = requests.put(f'{STORAGE_URL}/objects/{path}',headers={'X-Storage-Key':init_storage(),'Content-Type':content_type},data=data,timeout=120)
    r.raise_for_status()
    return r.json()
def get_object(path):
    r = requests.get(f'{STORAGE_URL}/objects/{path}',headers={'X-Storage-Key':init_storage()},timeout=60)
    r.raise_for_status()
    return r.content
>>>>>>> b246b9f0dcd59f93e220dafc66ccfd5b50d9cc1b
>>>>>>> abb7b4276f614088423817f4dc75effc576b2e5b
>>>>>>> 0641a06cd4d77fcddb9db1930ccf186521511ad2
>>>>>>> 63e7822993e2ec00966458cc5e7e1c3fc8f01394
