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