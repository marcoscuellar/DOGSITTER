/* Leo's Services · Guest Studio
   Prototype only: data lives in this browser (localStorage). The role switch and household
   selector are demo controls and do NOT enforce access. See START-HERE.md for production steps. */
(() => {
  const KEY = 'leo-guest-studio-v1';
  const $ = (s) => document.querySelector(s);
  // DOM builder. Text is always added as text nodes, never as HTML, so user input cannot inject markup.
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [n, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (n === 'class') e.className = v;
      else if (n.startsWith('on')) e.addEventListener(n.slice(2), v);
      else e.setAttribute(n, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const now = () => new Date().toISOString();
  const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const stamp = (iso) => new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const today = () => new Date().toISOString().slice(0, 10);

  const PACK = ['Food and bowls', 'Leash and harness', 'Bed or blanket', 'Medications', 'Favorite toy'];
  const KINDS = [['walk', 'Walks'], ['dropin', 'Drop-ins'], ['overnight', 'Overnight care']];
  const SECTIONS = ['Profile', 'Stay & care', 'History', 'Messages', 'Settings'];

  const seed = () => ({
    role: 'owner', hh: 'cuellar', dog: 'luna', section: 'Profile', visit: null, hostPhoto: null,
    households: [{ id: 'cuellar', name: 'Cuellar household' }, { id: 'rivera', name: 'Rivera household' }],
    dogs: [
      { id: 'luna', hh: 'cuellar', name: 'Luna', breed: 'Golden Retriever Mix', age: '3 yrs', weight: '62 lb', vet: 'Lakeview Animal Hospital', personality: 'Friendly, social, loves playtime.', likes: 'Fetch, treats, water, and other dogs.', photo: 'luna-guest.webp', art: 'luna.svg' },
      { id: 'milo', hh: 'rivera', name: 'Milo', breed: 'Corgi Mix', age: '5 yrs', weight: '28 lb', vet: 'Uptown Veterinary', personality: 'Bold and chatty.', likes: 'Treat puzzles, belly rubs.', photo: null, art: 'milo.svg' },
      { id: 'pepper', hh: 'rivera', name: 'Pepper', breed: 'Schnauzer Mix', age: '2 yrs', weight: '18 lb', vet: 'Uptown Veterinary', personality: 'A little shy at first, then all in.', likes: 'Squeaky toys, short walks.', photo: null, art: 'pepper.svg' },
    ],
    visits: [
      { id: 'v1', dog: 'luna', kind: 'walk', time: '10:00 AM', status: 'scheduled', walk: null },
      { id: 'v2', dog: 'pepper', kind: 'walk', time: '11:30 AM', status: 'scheduled', walk: null },
      { id: 'v3', dog: 'milo', kind: 'dropin', time: '1:00 PM', status: 'scheduled', walk: null },
      { id: 'v4', dog: 'pepper', kind: 'overnight', time: 'Tonight', status: 'scheduled', walk: null },
    ],
    stays: { luna: { arrival: 'Fri, Dec 4 · 9:00 AM', packed: [] }, milo: { arrival: 'Sat, Dec 5 · 8:30 AM', packed: [] }, pepper: { arrival: 'Sat, Dec 5 · 8:30 AM', packed: [] } },
    instructions: [{ id: 'i1', dog: 'luna', date: today(), text: 'Sample: heartworm pill with dinner.' }],
    updates: [], // parent-facing visit updates
    staffNotes: [], // staff-only observations; never rendered in the parent view
    messages: [{ id: 'm1', hh: 'cuellar', from: 'staff', at: now(), text: 'Hi! Luna is on the schedule for Friday. Send any care notes you like.' }],
    statements: [
      { id: 's1', hh: 'cuellar', title: 'November boarding (sample)', amount: '$240.00' },
      { id: 's2', hh: 'rivera', title: 'November day club (sample)', amount: '$180.00' },
    ],
    settings: { recap: 'Daily email', notify: true },
  });

  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('Storage is full. Try a smaller photo.'); } };
  const dogOf = (id) => S.dogs.find((d) => d.id === id);
  const myDogs = () => S.dogs.filter((d) => d.hh === S.hh);
  const curDog = () => dogOf(S.dog) && dogOf(S.dog).hh === S.hh ? dogOf(S.dog) : myDogs()[0];

  let toastTimer;
  function toast(msg) { const t = $('#status'); t.textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.textContent = ''), 2600); }

  // ---------- shared pieces ----------
  const src = (d) => d.photo || d.art;
  const avatar = (d) => h('span', { class: 'avatar' }, h('img', { src: src(d), alt: '' }));
  const mut = (fn) => () => { fn(); save(); render(); };

  function form(title, fields, onSave) {
    $('#ft').textContent = title;
    const box = $('#fields'); box.replaceChildren();
    for (const f of fields) {
      const input = f.type === 'textarea' ? h('textarea', { name: f.name, required: f.required }) : h('input', { name: f.name, type: f.type || 'text', required: f.required });
      input.value = f.value || '';
      box.append(h('label', {}, f.label, input));
    }
    const dlg = $('#dialog');
    $('#form').onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); dlg.close(); onSave(v); };
    $('#cancel').onclick = () => dlg.close();
    dlg.showModal();
    box.querySelector('input,textarea')?.focus();
  }

  let photoTarget = null;
  function pickPhoto(target) { photoTarget = target; $('#photo-input').click(); }
  $('#photo-input').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f || !photoTarget) return;
    const url = await new Promise((res) => {
      const r = new FileReader();
      r.onload = () => { const i = new Image(); i.onload = () => { const s = Math.min(1, 900 / Math.max(i.width, i.height)); const c = document.createElement('canvas'); c.width = i.width * s; c.height = i.height * s; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); }; i.src = r.result; };
      r.readAsDataURL(f);
    });
    if (photoTarget === 'host') S.hostPhoto = url; else dogOf(photoTarget).photo = url;
    save(); render(); toast('Photo updated');
  });

  function thread(hh, me) {
    const msgs = S.messages.filter((m) => m.hh === hh);
    const box = h('div', { class: 'thread' });
    box.append(h('h2', {}, 'Messages'), h('p', { class: 'thread-context' }, `${S.households.find((x) => x.id === hh).name} · demo thread`));
    box.append(msgs.length ? h('ol', {}, msgs.map((m) => h('li', { class: m.from === me ? 'mine' : '' }, h('p', {}, m.text), h('small', {}, `${m.from === 'staff' ? 'Leo' : 'Parent'} · ${stamp(m.at)}`)))) : h('p', { class: 'empty-thread' }, 'No messages yet.'));
    const ta = h('textarea', { 'aria-label': 'Message', placeholder: 'Write a message…' });
    box.append(h('form', { onsubmit: (e) => { e.preventDefault(); if (!ta.value.trim()) return; S.messages.push({ id: uid(), hh, from: me, at: now(), text: ta.value.trim() }); save(); render(); toast('Message sent'); } }, ta, h('button', { class: 'primary' }, 'Send')));
    return box;
  }

  // ---------- parent view (My dogs) ----------
  function profile(d) {
    const st = S.stays[d.id];
    const facts = [['Breed', d.breed], ['Age', d.age], ['Weight', d.weight], ['Vet', d.vet], ['Personality', d.personality], ['Likes', d.likes]];
    const pass = h('div', { class: 'dog-pass' },
      h('div', { class: 'pass-top' }, h('b', {}, 'Guest pass'), h('span', { class: 'slot' })),
      h('div', { class: 'pass-photo' }, h('img', { src: src(d), class: d.photo ? '' : 'art', alt: `${d.name}, ${d.breed}` })),
      h('div', { class: 'pass-bottom' }, h('div', {},
        h('span', { class: 'label' }, 'Guest'), h('h2', {}, d.name),
        h('dl', { class: 'badge-facts' }, facts.map(([k, v]) => h('div', {}, h('dt', {}, k), h('dd', {}, v || '—')))),
        h('div', { class: 'badge-controls' },
          h('button', { onclick: () => form(`Edit ${d.name}`, [['name', 'Name'], ['breed', 'Breed'], ['age', 'Age'], ['weight', 'Weight'], ['vet', 'Vet'], ['personality', 'Personality'], ['likes', 'Likes']].map(([name, label]) => ({ name, label, value: d[name] })), (v) => { Object.assign(d, v); save(); render(); toast('Profile saved'); }) }, 'Edit profile'),
          h('button', { onclick: () => pickPhoto(d.id) }, 'Swap photo')))));
    const bag = h('details', { class: 'bag', open: true },
      h('summary', {}, h('span', { class: 'label' }, 'Packing'), h('strong', {}, `${st.packed.length} of ${PACK.length} packed`)),
      PACK.map((p, i) => h('label', {}, h('input', { type: 'checkbox', checked: st.packed.includes(i), onchange: (e) => { st.packed = e.target.checked ? [...st.packed, i] : st.packed.filter((x) => x !== i); save(); render(); } }), ' ', p)));
    const arrival = h('div', { class: 'arrival' }, h('span', { class: 'label' }, 'Arrival'), h('strong', {}, st.arrival),
      h('button', { onclick: () => form('Arrival', [{ name: 'arrival', label: 'Date and time', value: st.arrival }], (v) => { st.arrival = v.arrival; save(); render(); }) }, 'Change'));
    const latest = S.instructions.filter((i) => i.dog === d.id).slice(-1)[0];
    return [pass, h('div', { class: 'stay-grid' }, arrival, bag), latest && h('div', { class: 'note' }, h('span', { class: 'label' }, 'Latest instruction'), h('p', {}, `${latest.date}: ${latest.text}`))];
  }

  function stayCare(d) {
    const date = h('input', { type: 'date', value: today(), name: 'date', required: true });
    const text = h('textarea', { name: 'text', required: true, placeholder: 'e.g. Half a scoop of food, no treats after 6 PM' });
    const list = S.instructions.filter((i) => i.dog === d.id).sort((a, b) => b.date.localeCompare(a.date));
    return h('div', { class: 'member-panel' }, h('h2', {}, `Stay & care for ${d.name}`),
      h('form', { onsubmit: (e) => { e.preventDefault(); S.instructions.push({ id: uid(), dog: d.id, date: date.value, text: text.value.trim() }); save(); render(); toast('Instruction added'); } },
        h('label', {}, 'Date', date), h('label', {}, 'Instruction', text), h('button', { class: 'primary' }, 'Add instruction')),
      h('h3', {}, 'Instructions'),
      list.length ? list.map((i) => h('div', { class: 'record' }, h('b', {}, i.date), h('p', {}, i.text), h('button', { onclick: mut(() => (S.instructions = S.instructions.filter((x) => x.id !== i.id))) }, 'Remove'))) : h('p', { class: 'muted' }, 'No instructions yet.'));
  }

  function history(d) {
    // Parent view shows ONLY: walk timestamps, parent-facing updates, statements. Staff observations are never included.
    const walks = S.visits.filter((v) => v.dog === d.id && v.walk && v.walk.end).map((v) => ({ at: v.walk.start, title: 'Walk', body: `Started ${clock(v.walk.start)} · Ended ${clock(v.walk.end)}` }));
    const ups = S.updates.filter((u) => u.dog === d.id).map((u) => ({ at: u.at, title: 'Visit update from Leo’s team', body: u.text }));
    const rows = [...walks, ...ups].sort((a, b) => b.at.localeCompare(a.at));
    return h('div', { class: 'member-panel' }, h('h2', {}, 'History'),
      rows.length ? rows.map((r) => h('div', { class: 'record' }, h('b', {}, `${r.title} · ${stamp(r.at)}`), h('p', {}, r.body))) : h('p', { class: 'muted' }, 'Walks and visit updates will appear here.'),
      h('h3', {}, 'Statements'),
      S.statements.filter((s) => s.hh === S.hh).map((s) => h('details', { class: 'record' }, h('summary', {}, `${s.title} · ${s.amount}`),
        h('p', { class: 'muted' }, 'Demo amount only. Rates and late-pickup terms need Leo’s approval before billing.'),
        h('button', { onclick: () => { S.section = 'Messages'; save(); render(); const ta = $('.thread textarea'); if (ta) ta.value = `Question about "${s.title}": `; ta?.focus(); } }, 'Ask Leo about this'))));
  }

  function settings() {
    return h('div', { class: 'member-panel' }, h('h2', {}, 'Settings'),
      h('label', {}, 'Daily recap', h('select', { onchange: (e) => { S.settings.recap = e.target.value; save(); toast('Saved'); } }, ['Daily email', 'Push notification', 'Off'].map((o) => h('option', { selected: S.settings.recap === o }, o)))),
      h('label', {}, h('input', { type: 'checkbox', checked: S.settings.notify, onchange: (e) => { S.settings.notify = e.target.checked; save(); toast('Saved'); } }), ' Notify me about new messages'),
      h('p', { class: 'muted' }, 'Recaps are not sent in this prototype.'),
      h('button', { onclick: () => { if (confirm('Reset all demo data in this browser?')) { S = seed(); save(); render(); } } }, 'Reset demo data'));
  }

  function renderOwner() {
    const d = curDog();
    S.dog = d.id;
    $('#title').textContent = 'My dogs';
    $('#switch').replaceChildren('Household ', h('select', { 'aria-label': 'Household (demo)', onchange: (e) => { S.hh = e.target.value; S.dog = myDogs()[0].id; save(); render(); } }, S.households.map((x) => h('option', { value: x.id, selected: x.id === S.hh }, x.name))));
    $('#sections').replaceChildren(h('label', { class: 'section-picker' }, 'Section', h('select', { onchange: (e) => { S.section = e.target.value; save(); render(); } }, SECTIONS.map((s) => h('option', { selected: s === S.section }, s)))));
    $('#list').replaceChildren(h('div', { class: 'panelhead' }, h('span', { class: 'label' }, 'Your dogs')),
      ...myDogs().map((x) => h('button', { class: 'visit' + (x.id === d.id ? ' active' : ''), 'aria-pressed': x.id === d.id, onclick: mut(() => (S.dog = x.id)) }, avatar(x), h('span', {}, h('strong', {}, x.name), h('small', {}, `${x.breed} · ${x.age}`)))),
      h('button', { class: 'visit', 'data-act': 'add', onclick: () => form('Add a dog', [{ name: 'name', label: 'Name', required: true }, { name: 'breed', label: 'Breed' }], (v) => { const id = uid(); S.dogs.push({ id, hh: S.hh, name: v.name.trim(), breed: v.breed, age: '', weight: '', vet: '', personality: '', likes: '', photo: null, art: 'luna.svg' }); S.stays[id] = { arrival: 'To be set', packed: [] }; S.dog = id; save(); render(); }) }, '+ Add a dog'));
    const body = { Profile: () => profile(d), 'Stay & care': () => stayCare(d), History: () => history(d), Messages: () => thread(S.hh, 'parent'), Settings: settings }[S.section]();
    $('#detail').replaceChildren(...[body].flat().filter(Boolean));
  }

  // ---------- Care desk ----------
  const STATUS = { scheduled: '○ Scheduled', active: '● In progress', done: '✓ Done' };

  function today_() {
    $('#title').textContent = 'Today';
    $('#switch').replaceChildren(); $('#sections').replaceChildren(); $('#list').replaceChildren();
    const groups = KINDS.map(([k, label]) => {
      const vs = S.visits.filter((v) => v.kind === k);
      return h('div', { class: 'agenda-group' }, h('h2', {}, label, h('small', {}, `${vs.filter((v) => v.status === 'done').length}/${vs.length} done`)),
        vs.length ? vs.map((v) => { const d = dogOf(v.dog); return h('button', { class: 'agenda-row', onclick: mut(() => (S.visit = v.id)) }, avatar(d), h('span', {}, h('strong', {}, d.name), h('small', {}, d.breed)), h('span', { class: 'agenda-time' }, h('strong', {}, v.time), h('small', {}, STATUS[v.status]))); }) : h('p', { class: 'muted' }, 'Nothing scheduled.'));
    });
    $('#detail').replaceChildren(h('div', { class: 'agenda' }, groups));
  }

  function visitView(v) {
    const d = dogOf(v.dog);
    $('#title').textContent = d.name;
    $('#switch').replaceChildren(h('button', { onclick: mut(() => (S.visit = null)) }, '← Back to Today'));
    $('#sections').replaceChildren(); $('#list').replaceChildren();
    const isWalk = v.kind === 'walk';
    const kindName = KINDS.find((k) => k[0] === v.kind)[1].replace(/s$/, '');
    let ctl;
    if (isWalk) {
      const w = v.walk;
      ctl = [h('h3', {}, 'Walk'), h('p', {}, !w ? 'Not started. Walk logs record timestamps only.' : w.end ? `Started ${clock(w.start)} · Ended ${clock(w.end)}` : `Started ${clock(w.start)}`),
        h('button', { 'data-walk': '', disabled: w && w.end, onclick: mut(() => { if (!w) { v.walk = { start: now(), end: null }; v.status = 'active'; toast('Walk started'); } else if (!w.end) { w.end = now(); v.status = 'done'; toast('Walk ended'); } }) }, !w ? 'Start walk' : w.end ? 'Walk logged' : 'End walk')];
    } else {
      ctl = [h('h3', {}, kindName), h('p', {}, STATUS[v.status]), h('button', { 'data-walk': '', disabled: v.status === 'done', onclick: mut(() => { v.status = 'done'; toast('Visit complete'); }) }, v.status === 'done' ? 'Complete' : 'Mark complete')];
    }
    const head = h('div', { class: 'visit-head' },
      h('div', { class: 'visit-line' }, h('div', { class: 'visit-portrait' }, h('img', { src: src(d), alt: '' })), h('div', {}, h('span', { class: 'eyebrow' }, kindName), h('h2', {}, d.name), h('p', {}, d.breed), h('p', { class: 'visit-time' }, v.time))),
      h('div', { class: 'inside' }, ctl));
    const notes = S.instructions.filter((i) => i.dog === d.id);
    const care = h('div', { class: 'inside' }, h('h3', {}, 'Care instructions'), notes.length ? notes.map((i) => h('p', {}, `${i.date}: ${i.text}`)) : h('p', { class: 'muted' }, 'None on file.'),
      h('details', { class: 'visit-facts' }, h('summary', {}, 'Profile details'), h('p', {}, `${d.personality} Likes: ${d.likes} Vet: ${d.vet}`)));
    const obs = h('textarea', { required: true, 'aria-label': 'Sitter observation' });
    const mine = S.staffNotes.filter((n) => n.dog === d.id);
    const staff = h('div', { class: 'inside' }, h('h3', {}, 'Sitter observation'), h('p', { class: 'muted' }, 'Staff only. Parents never see this.'),
      h('form', { onsubmit: (e) => { e.preventDefault(); S.staffNotes.push({ id: uid(), dog: d.id, at: now(), text: obs.value.trim() }); save(); render(); toast('Observation saved (staff only)'); } }, obs, h('button', { class: 'primary' }, 'Save observation')),
      mine.map((n) => h('div', { class: 'record' }, h('b', {}, stamp(n.at)), h('p', {}, n.text))));
    const upd = h('textarea', { required: true, 'aria-label': 'Update for parents', placeholder: 'A short, friendly summary of the visit' });
    const ups = S.updates.filter((u) => u.dog === d.id);
    const parent = h('div', { class: 'inside' }, h('h3', {}, 'Update for parents'), h('p', { class: 'muted' }, 'Visible in the parent History tab.'),
      h('form', { onsubmit: (e) => { e.preventDefault(); S.updates.push({ id: uid(), dog: d.id, at: now(), text: upd.value.trim() }); save(); render(); toast('Update shared with parents'); } }, upd, h('button', { class: 'primary' }, 'Share update')),
      ups.map((u) => h('div', { class: 'record' }, h('b', {}, stamp(u.at)), h('p', {}, u.text))));
    $('#detail').replaceChildren(head, care, staff, parent, thread(d.hh, 'staff'));
  }

  // ---------- shell ----------
  function render() {
    document.body.dataset.view = S.role;
    $('#desk').setAttribute('aria-pressed', S.role === 'desk');
    $('#owner').setAttribute('aria-pressed', S.role === 'owner');
    $('#date').textContent = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const hf = $('#host-face');
    hf.replaceChildren(S.hostPhoto ? h('img', { src: S.hostPhoto, alt: 'Leo' }) : 'L');
    document.title = `Leo’s Services · ${S.role === 'desk' ? 'Care desk' : 'My dogs'}`;
    if (S.role === 'owner') renderOwner();
    else { const v = S.visits.find((x) => x.id === S.visit); v ? visitView(v) : today_(); }
    $('#title').focus({ preventScroll: true });
  }

  $('#desk').onclick = () => { S.role = 'desk'; S.visit = null; save(); render(); };
  $('#owner').onclick = () => { S.role = 'owner'; save(); render(); };
  $('#host-photo').onclick = () => pickPhoto('host');
  render();
})();
