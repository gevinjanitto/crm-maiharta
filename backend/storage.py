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
