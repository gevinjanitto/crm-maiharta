"""Offline CSV normalization; no ClickUp API access and no spreadsheet evaluation."""
import csv
import io
import json
import re
from datetime import datetime, timezone
from uuid import uuid5, NAMESPACE_URL
from dateutil.parser import parse

FIELDS = {
    'external_id': ['Task ID', 'ID'], 'title': ['Task Name', 'Name', 'Title'],
    'description': ['Task Content', 'Description', 'Content'], 'status': ['Status'],
    'assignees': ['Assignee', 'Assignees'], 'priority': ['Priority'],
    'start_date': ['Start Date'], 'due_date': ['Due Date'], 'tags': ['Tags'],
    'estimate': ['Time Estimate', 'Time Estimated'], 'parent_id': ['Parent ID', 'Parent Task ID'],
    'space': ['Space Name', 'Space'], 'folder': ['Folder Name', 'Folder'], 'list': ['List Name', 'List'],
}


def stable_id(pid, value):
    return 'clickup-' + str(uuid5(NAMESPACE_URL, f'{pid}:{value}'))


def parse_csv(content):
    try: text = content.decode('utf-8-sig')
    except UnicodeDecodeError: raise ValueError('CSV harus menggunakan UTF-8.')
    if '\x00' in text: raise ValueError('Berkas bukan CSV teks.')
    try:
        delimiter = csv.Sniffer().sniff(text[:8192], delimiters=',;\t').delimiter
    except csv.Error: delimiter = ','
    reader = csv.DictReader(io.StringIO(text), delimiter=delimiter, strict=True)
    try:
        headers = [h.strip() for h in (reader.fieldnames or [])]
        if not headers or any(not h for h in headers) or len(set(h.lower() for h in headers)) != len(headers):
            raise ValueError('Header CSV kosong atau duplikat.')
        if len(headers) > 100: raise ValueError('Maksimal 100 kolom CSV.')
        reader.fieldnames = headers
        rows = []
        for row in reader:
            if None in row: raise ValueError('Jumlah kolom tidak konsisten. Periksa tanda kutip CSV.')
            if any(v is None for v in row.values()): raise ValueError('Baris CSV memiliki kolom yang hilang.')
            clean = {k: v.strip() for k, v in row.items()}
            if any(clean.values()): rows.append(clean)
            if len(rows) > 2000: raise ValueError('Maksimal 2.000 baris per impor.')
    except csv.Error: raise ValueError('Format CSV tidak valid.')
    if not rows: raise ValueError('CSV tidak memiliki data.')
    mapping = {field: next((h for h in headers if h.lower() in [a.lower() for a in aliases]), '') for field, aliases in FIELDS.items()}
    return headers, rows, mapping


def split_values(value):
    if not value: return []
    if value.startswith('['):
        try:
            values = json.loads(value)
            if isinstance(values, list): return list(dict.fromkeys(str(x).strip() for x in values if str(x).strip()))
        except ValueError: pass
    return list(dict.fromkeys(x.strip().strip('[]\"\'') for x in re.split(r'[,;]', value) if x.strip().strip('[]\"\'')))


def date_value(value, date_order):
    if not value: return None
    if re.fullmatch(r'\d{10,13}', value):
        stamp = int(value) / (1000 if len(value) == 13 else 1)
        return datetime.fromtimestamp(stamp, timezone.utc).date().isoformat()
    return parse(value, dayfirst=date_order == 'DMY', yearfirst=bool(re.match(r'^\d{4}-', value)), fuzzy=False).date().isoformat()


def estimate_hours(value, unit):
    if not value: return 0
    if re.fullmatch(r'\d+(\.\d+)?', value):
        return round(float(value) / {'milliseconds': 3600000, 'minutes': 60, 'hours': 1}[unit], 4)
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*(h|m)', value.lower())
    if matches and not re.sub(r'\d+(?:\.\d+)?\s*[hm]', '', value.lower()).strip():
        return round(sum(float(n) * (1 if u == 'h' else 1/60) for n, u in matches), 4)
    raise ValueError('Estimasi waktu tidak valid.')


def normalize_rows(rows, mapping, status_map, user_map, statuses, people, pid, date_order, estimate_unit):
    errors, normalized = [], []
    names = {s['name'] for s in statuses}
    user_ids = {u['id'] for u in people}
    ids = set()
    priority_map = {'urgent':'Mendesak','high':'Tinggi','normal':'Sedang','low':'Rendah','none':'Sedang','1':'Mendesak','2':'Tinggi','3':'Sedang','4':'Rendah'}
    for index, row in enumerate(rows, 2):
        def get(field): return row.get(mapping.get(field, ''), '').strip()
        try:
            external_id, title = get('external_id'), get('title')
            if not external_id: raise ValueError('Task ID wajib ada untuk mencegah duplikasi.')
            if external_id in ids: raise ValueError('Task ID duplikat di dalam CSV.')
            ids.add(external_id)
            if not title or len(title) > 200: raise ValueError('Nama task harus 1–200 karakter.')
            source_status = get('status')
            status = status_map.get(source_status, source_status if source_status in names else statuses[0]['name'] if not source_status else '')
            if status not in names: raise ValueError(f'Petakan status "{source_status}".')
            assigned = []
            for external_user in split_values(get('assignees')):
                target = user_map.get(external_user)
                if target == '__unassigned__': continue
                if target not in user_ids: raise ValueError(f'Petakan PIC "{external_user}".')
                if target not in assigned: assigned.append(target)
            start, due = date_value(get('start_date'), date_order), date_value(get('due_date'), date_order)
            if start and due and due < start: raise ValueError('Deadline sebelum tanggal mulai.')
            priority = get('priority') or 'Sedang'
            priority = priority_map.get(priority.lower(), priority)
            if priority not in ['Mendesak','Tinggi','Sedang','Rendah']: raise ValueError('Prioritas tidak dikenali: ' + priority)
            normalized.append({'id': stable_id(pid, external_id), 'external_id': external_id, 'title': title, 'description': get('description'), 'status': status, 'assignee_ids': assigned, 'assigned_to': assigned[0] if assigned else '', 'start_date': start, 'due_date': due, 'priority': priority, 'tags': split_values(get('tags')), 'estimate_hours': estimate_hours(get('estimate'), estimate_unit), 'parent_external_id': get('parent_id'), 'space': get('space'), 'folder': get('folder'), 'list': get('list'), 'csv_row': index})
        except (ValueError, OverflowError, KeyError) as exc:
            errors.append({'row': index, 'message': str(exc)})
    by_id = {r['external_id']: r for r in normalized}
    for row in normalized:
        parent = row['parent_external_id']
        if parent and (parent not in by_id or parent == row['external_id'] or by_id[parent]['parent_external_id']):
            errors.append({'row': row['csv_row'], 'message': 'Parent harus task utama di CSV yang sama; subtask bertingkat perlu diratakan terlebih dahulu.'})
    return normalized, errors