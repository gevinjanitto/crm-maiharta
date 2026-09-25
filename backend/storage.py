<<<<<<< HEAD
import os
import requests
import cloudinary
import cloudinary.uploader
import cloudinary.utils

def _configure():
    name, key, secret = os.environ.get('CLOUDINARY_CLOUD_NAME'), os.environ.get('CLOUDINARY_API_KEY'), os.environ.get('CLOUDINARY_API_SECRET')
    if not (name and key and secret): raise RuntimeError('Cloudinary belum dikonfigurasi.')
    cloudinary.config(cloud_name=name, api_key=key, api_secret=secret, secure=True)

def put_object(path, data, content_type):
    _configure()
    r = cloudinary.uploader.upload(data, public_id=path, resource_type='raw', type='authenticated', overwrite=False, use_filename=False, unique_filename=False)
    return {'path': r['public_id'], 'url': r['secure_url']}

def get_object(path):
    _configure()
    url, _ = cloudinary.utils.cloudinary_url(path, resource_type='raw', type='authenticated', sign_url=True)
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.content

def delete_object(path):
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
