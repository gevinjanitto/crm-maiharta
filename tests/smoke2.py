import requests, subprocess, sys, json
B = "http://localhost:8001/api"
def tok(u): return subprocess.check_output([sys.executable, "/app/tests/make_token.py", u]).decode().strip()
h = {"Authorization": "Bearer " + tok("admin")}
me = requests.get(B+"/auth/me", headers=h).json(); print("me", me["username"])
cl = requests.get(B+"/clients", headers=h).json()[0]
r = requests.post(B+"/projects", headers=h, json={"name":"Smoke Platform","client_id":cl["id"],"platforms":["Web","Mobile Android"],"start_date":"2026-06-01","due_date":"2026-09-01"}); print("project", r.status_code, r.json().get("platforms"), r.json().get("category"))
pid = r.json()["id"]
r = requests.post(B+"/projects", headers=h, json={"name":"Smoke NoPlat","client_id":cl["id"],"platforms":[],"start_date":"2026-06-01","due_date":"2026-09-01"}); print("no platform ->", r.status_code)
files = {"file": ("catatan.txt", b"halo", "text/plain")}
r = requests.post(f"{B}/projects/{pid}/documents", headers=h, files=files, data={"kind":"Lampiran Project","visibility":"Internal"}); print("upload", r.status_code, r.json().get("name"))
did = r.json()["id"]
r = requests.get(f"{B}/projects/{pid}/documents/{did}/download", headers=h); print("download", r.status_code, r.content)
# maintenance on production project
prod = [p for p in requests.get(B+"/projects", headers=h).json() if p.get("production_at")][0]
r = requests.post(f"{B}/projects/{prod['id']}/work/maintenances", headers=h, json={"title":"Maint smoke","kind":"Adaptive","priority":"Tinggi","entry_date":"2026-06-10","started_date":None,"due_date":None,"estimate":0}); print("maint", r.status_code, r.json().get("status"), r.json().get("priority"), r.json().get("entry_date"))
w = r.json()
r = requests.patch(f"{B}/projects/{prod['id']}/work/maintenances/{w['id']}", headers=h, json={"status":"Testing","started_date":"2026-06-12"}); print("maint->Testing", r.status_code, r.json().get("status"), r.json().get("started_date"))
t = [x for x in requests.get(f"{B}/projects/{prod['id']}/tasks", headers=h).json() if x["source_id"]==w["id"]][0]; print("task status", t["status"], t["priority"])
r = requests.patch(f"{B}/projects/{prod['id']}/tasks/{t['id']}", headers=h, json={"status":"Selesai"}); print("task->Selesai", r.status_code)
print("maint now", [x["status"] for x in requests.get(f"{B}/projects/{prod['id']}/work/maintenances", headers=h).json() if x["id"]==w["id"]])
r = requests.patch(f"{B}/projects/{prod['id']}/work/maintenances/{w['id']}", headers=h, json={"status":"Terbuka"}); print("invalid status ->", r.status_code)
# trash flows
r = requests.delete(f"{B}/projects/{prod['id']}/tasks/{t['id']}", headers=h); print("del task", r.status_code, r.json())
r = requests.delete(f"{B}/projects/{prod['id']}/work/maintenances/{w['id']}", headers=h); print("del maint", r.status_code)
r = requests.delete(f"{B}/projects/{pid}/documents/{did}", headers=h); print("del doc", r.status_code)
r = requests.delete(f"{B}/projects/{pid}", headers=h); print("del project", r.status_code, r.json())
tr = requests.get(B+"/trash", headers=h).json(); print("trash", [(x["entity_type"], x["name"]) for x in tr][:6])
proj_item = [x for x in tr if x["entity_type"]=="project"][0]
doc_item = [x for x in tr if x["entity_type"]=="dokumen"][0]
r = requests.post(f"{B}/trash/{doc_item['id']}/restore", headers=h); print("restore doc before project ->", r.status_code, r.json())
r = requests.post(f"{B}/trash/{proj_item['id']}/restore", headers=h); print("restore project", r.status_code, r.json())
r = requests.post(f"{B}/trash/{doc_item['id']}/restore", headers=h); print("restore doc", r.status_code)
print("docs after restore", [d["name"] for d in requests.get(f"{B}/projects/{pid}/documents", headers=h).json()])
maint_item = [x for x in tr if x["entity_type"]=="maintenance"][0]
r = requests.post(f"{B}/trash/{maint_item['id']}/restore", headers=h); print("restore maint", r.status_code)
task_item = [x for x in tr if x["entity_type"]=="task"][0]
r = requests.delete(f"{B}/trash/{task_item['id']}", headers=h); print("purge", r.status_code)
# audit
a = requests.get(B+"/audit?limit=8", headers=h).json(); print("audit", [(x["user_name"], x["action"], x["entity_type"]) for x in a])
hp = {"Authorization": "Bearer " + tok("adminproject")}
print("audit as adminproject ->", requests.get(B+"/audit", headers=hp).status_code, "trash ->", requests.get(B+"/trash", headers=hp).status_code)
