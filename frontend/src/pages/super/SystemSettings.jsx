import { useEffect, useState } from "react";
import api from "../../utils/api";
import InlineLoader from '../../components/shared/InlineLoader';
import { toast } from "react-toastify";

export function SystemSettings() {
  const [list, setList] = useState([]);
  const [elections, setElections] = useState([]);
  const [current, setCurrent] = useState({ name: '', theme_color: '#2563EB', footer_text: '', support_email: '', election_id: null, is_default: false });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => { fetchElections(); }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      setList(res.data.results || []);
    } catch (err) {
      console.error('failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchElections() {
    try {
      const res = await api.get('/admin/elections');
      setElections(res.data.results || []);
    } catch  {
      console.error('failed to load elections');
    }
  }

  function selectSetting(s) {
    setCurrent({
      id: s.id,
      name: s.name || '',
      theme_color: s.theme_color || '#2563EB',
      logo_path: s.logo_path || null,
  footer_text: s.footer_text || '',
  support_email: s.support_email || '',
      election_id: s.election_id || null,
      is_default: !!s.is_default
    });
    setLogoFile(null);
  }

  function handleFile(e) { setLogoFile(e.target.files[0]); }

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', current.name || '');
      fd.append('theme_color', current.theme_color || '');
      fd.append('footer_text', current.footer_text || '');
      fd.append('support_email', current.support_email || '');
  fd.append('election_id', current.election_id || '');
  fd.append('is_default', current.is_default ? 'true' : 'false');
      if (logoFile) fd.append('logo', logoFile);

      let res;
      if (current.id) {
        res = await api.put(`/settings/${current.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await fetchSettings();
      setCurrent(res.data);
      setLogoFile(null);
      alert('Saved');
    } catch {
      alert('Failed to save');
    } finally { setLoading(false); }
  }

  async function remove() {
    if (!current.id) return;
    if (!confirm('Delete this setting?')) return;
    try {
      await api.delete(`/settings/${current.id}`);
      setCurrent({ name: '', theme_color: '#2563EB', config: {} });
      fetchSettings();
    } catch (err) {
      toast.error(err,'Failed to delete');
    }
  }


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>


      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Available Customizations</h3>
          <button className="text-sm text-indigo-600 mb-3" onClick={() => setCurrent({ name: '', theme_color: '#2563EB', footer_text: '', support_email: '', election_id: null, is_default: false })}>+ Create New</button>
          <ul className="space-y-2 text-sm">
            {loading ? (
              <li>
                <InlineLoader message="Loading settings…" />
              </li>
            ) : list.length === 0 ? (
              <li className="text-center text-gray-500">No settings configured yet.</li>
            ) : (
              list.map(s => (
                <li key={s.id} className="cursor-pointer" onClick={() => selectSetting(s)}>
                  <div className="flex items-center space-x-2">
                    {s.logo_path ? <img src={s.logo_path} alt="logo" className="w-8 h-8 rounded" /> : <div className="w-8 h-8 bg-gray-200 rounded" />}
                    <div>{s.name || `#${s.id}`}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="col-span-2 bg-white p-6 rounded shadow">
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={current.name || ''} onChange={e => setCurrent({ ...current, name: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Theme color</label>
              <input type="color" value={current.theme_color || '#2563EB'} onChange={e => setCurrent({ ...current, theme_color: e.target.value })} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <input type="file" accept="image/*" onChange={handleFile} className="mt-1" />
              {current.logo_path && <div className="mt-2"><img src={current.logo_path} className="w-24 h-24 object-contain" alt="logo" /></div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Footer text</label>
              <input value={current.footer_text || ''} onChange={e => setCurrent({ ...current, footer_text: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Support email</label>
              <input value={current.support_email || ''} onChange={e => setCurrent({ ...current, support_email: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Attach to Election (optional)</label>
              <select value={current.election_id || ''} onChange={e => setCurrent({ ...current, election_id: e.target.value || null })} className="mt-1 block w-full rounded-md border px-3 py-2">
                <option value="">-- Not assigned to election --</option>
                {elections.map(ev => (<option key={ev.id} value={ev.id}>{ev.title}</option>))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={!!current.is_default} onChange={e => setCurrent({ ...current, is_default: e.target.checked })} className="h-4 w-4" />
                <span className="text-sm">Make default for this election</span>
              </label>
              <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
              {current.id && <button type="button" onClick={remove} className="bg-red-500 text-white px-3 py-2 rounded">Delete</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
