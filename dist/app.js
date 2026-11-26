/* LEON'S · pet owner app. Prototype: data stays in this browser.
   No prices, times or phone numbers are invented; unknown values show as [BRACKETS]. */
(() => {
  const KEY = 'leons-owner-v4';
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.setAttribute('style', v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const ic = (name, cls = '') => { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('class', 'ic ' + cls); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS(SVGNS, 'use'); u.setAttribute('href', '#' + name); s.append(u); return s; };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const day = (v) => (v ? new Date(v + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '');
  const hhmm = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // ---------- state ----------
  // Sample household for the pitch. No prices, no phone numbers: pricing is still open with Leon.
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  const todayAt = (hr, min) => { const d = new Date(); d.setHours(hr, min, 0, 0); return d.toISOString(); };
  const yesterdayAt = (hr, min) => { const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(hr, min, 0, 0); return d.toISOString(); };
  const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
  const seed = () => ({
    unread: 2,
    dogs: [
      { id: 'luna', name: 'Luna', breed: 'Golden Retriever', age: '3 yrs', blurb: 'loves a sofa', photo: 'photos/luna-guest.webp', pos: '76% 25%', status: '● Day Club · Tomorrow', walkAt: '8:30 AM', stats: { visits: 24, nights: 12, friends: 3 },
        notes: { likes: 'Fetch, belly rubs and sofa naps.', care: 'No medications.', feeding: '1 cup, morning and evening.', notes: 'Great with other dogs. Takes a minute to settle at drop-off.' },
        history: [{ date: inDays(-3), text: 'Day Club. Two play sessions and a long nap.' }, { date: inDays(-10), text: 'Overnight stay, 2 nights. Settled in by bedtime.' }, { date: inDays(-17), text: 'Day Club. A big day with the play group.' }] },
      { id: 'bruno', name: 'Bruno', breed: 'French Bulldog', age: '5 yrs', blurb: 'snores like a champ', photo: 'photos/dog-small-ears-up.webp', pos: '50% 22%', status: 'Hotel stay · Requested', walkAt: '11:30 AM', stats: { visits: 11, nights: 6, friends: 2 },
        notes: { likes: 'Sunny spots and chew toys.', care: 'No medications.', feeding: '3/4 cup, twice a day.', notes: 'Keep him cool on walks.' },
        history: [{ date: inDays(-8), text: 'Overnight stay, 1 night. Slept through.' }] },
      { id: 'biscuit', name: 'Biscuit', breed: 'Beagle', age: '4 yrs', blurb: 'follows his nose', photo: 'photos/dog-beagle-ball.webp', pos: '60% 30%', status: 'Day Club · Requested', walkAt: '1:15 PM', stats: { visits: 8, nights: 0, friends: 1 },
        notes: { likes: 'The red ball. Anything with a smell.', care: 'No medications.', feeding: '1/2 cup, twice a day.', notes: 'Keep the leash short.' },
        history: [{ date: inDays(-5), text: 'Day Club. Played fetch until the very end.' }] },
    ],
    requests: [
      { id: 'r1', type: 'day', dog: 'Luna', checkin: inDays(1), checkout: '', drop: '8:30 AM', pick: '5:30 PM', addons: '', status: 'approved', at: yesterdayAt(16, 10) },
      { id: 'r2', type: 'hotel', dog: 'Bruno', checkin: inDays(9), checkout: inDays(12), drop: '', pick: '', addons: 'Bath before pick-up', status: 'pending', at: todayAt(8, 5) },
      { id: 'r3', type: 'day', dog: 'Biscuit', checkin: inDays(3), checkout: '', drop: '9:00 AM', pick: '4:00 PM', addons: '', status: 'pending', at: todayAt(8, 40) },
    ],
    draft: { type: 'day', dogId: 'luna', checkin: '', checkout: '', drop: '', pick: '', addons: '' },
    msgs: [
      { from: 'staff', text: 'Welcome to Leon’s, Jordan. Luna is on the list for tomorrow.', at: yesterdayAt(16, 12) },
      { from: 'me', text: 'Thank you! She’s a little shy at drop-off but warms up fast.', at: yesterdayAt(16, 20) },
      { from: 'staff', text: 'Good to know. We’ll start with a short walk to settle her in.', at: yesterdayAt(16, 31) },
      { from: 'staff', text: 'Luna had a great morning: two play sessions and a long nap.', at: todayAt(11, 5) },
    ],
    careNotes: [
      { id: 'n1', dog: 'luna', date: inDays(1), text: 'Short walk first to help her settle in.' },
      { id: 'n2', dog: 'luna', date: inDays(1), text: 'No treats after 4 PM.' },
    ],
    walks: [
      { id: 'w1', dog: 'luna', start: todayAt(8, 55), end: todayAt(9, 25) },
      { id: 'w2', dog: 'biscuit', start: minsAgo(12), end: null },
    ],
    staffNotes: [{ id: 's1', dog: 'luna', at: todayAt(9, 30), text: 'Slow to settle at drop-off, calmer after her first walk.' }],
    updates: [{ id: 'u1', dog: 'luna', at: todayAt(11, 5), text: 'Luna had a great morning: two play sessions and a long nap.' }],
    profile: { name: 'Jordan Ellis', email: 'jordan.ellis@example.com', phone: '', emergency: 'Casey Ellis' },
    settings: { recap: 'Daily email', notify: true },
  });
  const nextDay = () => { const u = S.requests.filter((x) => x.checkin && (x.status || 'pending') !== 'declined').sort((x, y) => x.checkin.localeCompare(y.checkin))[0]; return u ? new Date(u.checkin + 'T00:00').toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase() : '[DAY]'; };
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage unavailable */ } };
  const dogById = (id) => S.dogs.find((d) => d.id === id) || S.dogs[0];
  S.requests.forEach((r) => { r.status = r.status || 'pending'; });
  S.unread = S.unread ?? 0;
  S.walks = S.walks || [];        // { id, dog, start, end }  timestamps only, no location
  S.staffNotes = S.staffNotes || []; // private to staff, never shown in the owner app
  S.updates = S.updates || [];    // owner-facing updates written by staff
  S.profile = S.profile || { name: '', email: '', phone: '', emergency: '' };
  S.settings = S.settings || { recap: 'Daily email', notify: true };
  let profileTab = 'Details';

  // ---------- sheet ----------
  const sheet = $('#sheet');
  function openSheet(title, body, onSave, label = 'Save') {
    $('#sheet-title').textContent = title;
    $('#sheet-body').replaceChildren(...[body].flat());
    $('#sheet-save').textContent = label;
    $('#sheet-form').onsubmit = (e) => { e.preventDefault(); const err = onSave(new FormData(e.target)); if (err) { $('#sheet-body').querySelector('.err')?.remove(); $('#sheet-body').prepend(h('p', { class: 'err', role: 'alert' }, err)); return; } sheet.close(); render(); };
    $('#sheet-cancel').onclick = () => sheet.close();
    sheet.showModal();
    sheet.querySelector('input,textarea')?.focus();
  }
  const field = (label, input) => h('label', { class: 'field' }, label, input);

  // ---------- pieces ----------
  const hero = ({ img, pos, hh, title, sub, back, action, tag, size }) => h('div', { class: 'hero', style: `--hh:${hh || 400}px;--pos:${pos || '76% 25%'}` },
    h('img', { src: img, alt: '' }),
    back && h('a', { class: 'circle', href: back, 'aria-label': 'Back' }, ic('aback')),
    tag && h('span', { class: 'pill tag' }, tag),
    action,
    h('div', { class: 'hero-text' }, h('h1', { class: 'hero-title', style: size ? `font-size:${size}` : null }, title), sub && h('p', { class: 'hero-sub' }, sub)));
  const stats = (rows) => h('div', { class: 'stats' }, rows.map(([v, l]) => h('div', { class: 'stat' }, h('b', {}, v), h('span', {}, l))));
  const pillBtn = (label, icon, onclick) => h('button', { class: 'pill', onclick, type: 'button' }, icon && ic(icon), label);
  const theme = (cls, ...kids) => { $('#screen').className = cls; return h('div', {}, kids); };

  function soon(title, line, back = '#/home') {
    return [h('div', { class: 'body', style: 'padding-top:28px' }, h('a', { href: back, class: 'chip', style: 'display:inline-block;text-decoration:none' }, '← Back'), h('h1', { class: 'hero-title', style: 'margin-top:20px;font-size:56px' }, title), h('p', { class: 'hero-sub', style: 'margin-top:8px' }, line))];
  }

  // ---------- Home ----------
  function home() {
    const nextReq = S.requests[0];
    const real = S.dogs.filter((d) => !d.sample).length;
    const tile = (href, cls, icon, name, sub) => h('a', { class: 'tile ' + cls, href }, ic(icon), h('span', {}, h('b', {}, name), h('i', {}, sub)));
    return [
      hero({ img: 'photos/dog-golden-sitting.webp', pos: '50% 12%', hh: 440, size: 'clamp(40px,12.5vw,54px)', title: ['Welcome back,', h('br'), `${(S.profile.name || '').split(' ')[0] || '[NAME]'}.`], sub: 'Your dog is on the list.' }),
      stats([[String(S.dogs.length), 'Dogs'], [nextDay(), 'Next visit'], [String(S.unread || 0), 'Unread']]),
      h('div', { class: 'body' },
        h('div', { class: 'tiles' },
          tile('#/book', 'forest', 'acal', 'Book a visit', 'We’ll hold a spot.'),
          tile('#/today', 'navy', 'asun', 'Today at the club', 'See how the day is going.'),
          tile('#/dogs', '', 'adog', 'My dogs', `${real || S.dogs.length} on the list.`),
          tile('#/messages', '', 'amsg', 'Messages', 'Straight from Leon’s team.')),
        S.requests.length ? [h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Your requests')), h('div', { class: 'rows', style: 'margin-top:0' }, S.requests.map((r) => h('div', { class: 'row plain' }, ic(r.type === 'day' ? 'asun' : 'abed'), h('span', { class: 'grow' }, h('b', {}, `${r.type === 'day' ? 'Day Club' : 'Hotel Stay'} · ${r.dog}`), h('i', {}, `${day(r.checkin)}${r.checkout ? ' – ' + day(r.checkout) : ''} · ${r.status === 'approved' ? 'confirmed' : r.status === 'declined' ? 'declined' : 'requested'}`)))))] : null,
        h('p', { class: 'note' }, 'Sample data for the pitch preview.')),
    ];
  }

  // ---------- My Dogs ----------
  function dogs() {
    return [
      hero({ img: 'photos/luna-guest.webp', hh: 400, title: 'My dogs', sub: `${S.dogs.length} on the list. All good dogs.`, back: '#/home', action: pillBtn('Add a dog', 'aplus', addDog) }),
      stats([['6', 'Visits this month'], ['12', 'Nights stayed'], [nextDay(), 'Next visit']]),
      h('div', { class: 'body' },
        h('div', { class: 'sec-head' }, h('h2', {}, 'The pack'), h('span', {}, 'Swipe for everyone →')),
        h('div', { class: 'pack' }, S.dogs.map((d) => h('a', { class: 'dogcard', href: `#/dog/${d.id}`, style: `--pos:${d.pos || '50% 25%'}` },
          h('img', { src: d.photo || 'photos/luna-guest.webp', alt: d.name }),
          h('span', { class: 'meta' }, h('b', {}, d.name), h('i', {}, `${d.breed || '[Breed]'} · ${d.age || '[age]'}`), h('small', {}, d.status || 'No visit booked')))))),
    ];
  }
  function addDog() {
    openSheet('Add a dog', [
      field('Name', h('input', { name: 'name', required: true, autocomplete: 'off' })),
      field('Breed (optional)', h('input', { name: 'breed', autocomplete: 'off' })),
      field('Age (optional)', h('input', { name: 'age', autocomplete: 'off' })),
      field('Photo (optional)', h('input', { name: 'photo', type: 'file', accept: 'image/*' })),
    ], (f) => {
      const name = String(f.get('name')).trim(); if (!name) return 'Add a name to continue.';
      const d = { id: uid(), name, breed: String(f.get('breed')).trim(), age: String(f.get('age')).trim(), photo: null, pos: '50% 30%', status: 'No visit booked', notes: {} };
      S.dogs = S.dogs.filter((x) => !x.sample); S.dogs.push(d);
      const file = f.get('photo');
      if (file && file.size) {
        const r = new FileReader();
        r.onload = () => { const i = new Image(); i.onload = () => { const k = Math.min(1, 800 / Math.max(i.width, i.height)); const c = document.createElement('canvas'); c.width = i.width * k; c.height = i.height * k; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); d.photo = c.toDataURL('image/jpeg', 0.8); save(); render(); }; i.src = r.result; };
        r.readAsDataURL(file);
      }
      save();
    }, 'Add dog');
  }

  // ---------- Dog profile ----------
  const DETAILS = [['likes', 'aheart', 'Likes', '[Fetch, belly rubs, playtime]', '#F4EEE2', '#163D28'], ['care', 'apill', 'Care Needs', '[Medications or none]', '#0D1C31', '#F4EEE2'], ['feeding', 'abowl', 'Feeding', '[Amount, times a day]', '#F4EEE2', '#163D28'], ['notes', 'anote', 'Notes', '[Good with other dogs?]', '#163D28', '#F4EEE2']];
  function profile(id) {
    const d = dogById(id);
    let body;
    if (profileTab === 'Details') {
      body = h('div', { style: 'margin-top:6px' }, DETAILS.map(([k, icon, title, ph, bg, fg]) => h('button', { class: 'row', style: 'border-radius:0;padding:12px 0', onclick: () => openSheet(title, field(title, h('textarea', { name: 'v' }, d.notes[k] || '')), (f) => { d.notes[k] = String(f.get('v')).trim(); save(); }) },
        h('span', { class: 'badge', style: `background:${bg};color:${fg}` }, ic(icon)), h('span', { class: 'grow' }, h('b', {}, title), h('i', {}, d.notes[k] || ph)), ic('achev', 'chev'))));
    } else if (profileTab === 'Care Notes') {
      const mine = S.careNotes.filter((n) => n.dog === d.id);
      body = h('div', { style: 'margin-top:12px' }, h('button', { class: 'cta', style: 'margin-top:0;height:50px;font-size:17px', onclick: () => openSheet('Care note', [field('Date', h('input', { type: 'date', name: 'date', required: true, value: new Date().toISOString().slice(0, 10) })), field('Instruction', h('textarea', { name: 'text', required: true }))], (f) => { S.careNotes.unshift({ id: uid(), dog: d.id, date: f.get('date'), text: String(f.get('text')).trim() }); save(); }, 'Add') }, 'Add a care note'),
        mine.length ? h('div', { class: 'rows' }, mine.map((n) => h('div', { class: 'row plain' }, ic('anote'), h('span', { class: 'grow' }, h('b', {}, day(n.date)), h('i', {}, n.text))))) : h('div', { class: 'empty' }, h('b', {}, 'No care notes yet'), h('i', {}, 'Add instructions for Leon’s team.')));
    } else {
      body = (d.history || []).length ? h('div', { class: 'rows' }, d.history.map((x) => h('div', { class: 'row plain' }, ic('aclock'), h('span', { class: 'grow' }, h('b', {}, day(x.date)), h('i', {}, x.text))))) : h('div', { class: 'empty' }, h('b', {}, 'Nothing here yet'), h('i', {}, 'Visits show up here after the first one.'));
    }
    return [
      hero({ img: d.photo || 'photos/luna-guest.webp', pos: d.pos, hh: 380, title: d.name, sub: `${d.breed || '[Breed]'} · ${d.age || '[age]'}${d.blurb ? ' · ' + d.blurb : ''}`, back: '#/dogs', action: pillBtn('Edit', null, () => openSheet(`Edit ${d.name}`, [field('Name', h('input', { name: 'name', value: d.name, required: true })), field('Breed', h('input', { name: 'breed', value: d.breed || '' })), field('Age', h('input', { name: 'age', value: d.age || '' }))], (f) => { const n = String(f.get('name')).trim(); if (!n) return 'Add a name.'; d.name = n; d.breed = String(f.get('breed')).trim(); d.age = String(f.get('age')).trim(); d.sample = false; save(); })) }),
      stats([[String((d.stats || {}).visits ?? '[#]'), 'Visits'], [String((d.stats || {}).nights ?? '[#]'), 'Nights'], [String((d.stats || {}).friends ?? '[#]'), 'Best friends']]),
      h('div', { class: 'body' }, h('div', { class: 'chips', role: 'group', 'aria-label': 'Profile section' }, ['Details', 'Care Notes', 'History'].map((t) => h('button', { class: 'chip', 'aria-pressed': String(t === profileTab), onclick: () => { profileTab = t; render(); } }, t))), body),
    ];
  }

  // ---------- Book a visit ----------
  function book(type) {
    const q = S.draft; if (type === 'day' || type === 'hotel') q.type = type;
    const day_ = q.type === 'day'; const d = dogById(q.dogId);
    const row = (icon, title, note, onclick) => h('button', { class: 'row', type: 'button', onclick }, ic(icon), h('span', { class: 'grow' }, h('b', {}, title), h('i', {}, note)), ic('achev', 'chev'));
    const dates = day_ ? (q.checkin ? day(q.checkin) : 'Choose dates') : (q.checkin || q.checkout ? `${day(q.checkin) || '[Check-in]'} – ${day(q.checkout) || '[Check-out]'}` : 'Choose dates');
    const ready = q.checkin && (day_ || q.checkout);
    return [
      hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 360, title: 'Book a visit', sub: `We’ll hold a spot for ${d.name}.`, back: '#/home' }),
      stats([['6', 'Spots open'], ['2', 'Suites free'], ['4', 'Visits left']]),
      h('div', { class: 'body' },
        h('div', { class: 'toggle', role: 'group', 'aria-label': 'Service' },
          h('button', { 'aria-pressed': String(day_), onclick: () => { q.type = 'day'; save(); render(); } }, ic('asun'), 'Day Club'),
          h('button', { 'aria-pressed': String(!day_), onclick: () => { q.type = 'hotel'; save(); render(); } }, ic('abed'), 'Hotel Stay')),
        h('div', { class: 'rows' },
          row('adog', 'Which dog', d.name, () => openSheet('Which dog', S.dogs.filter((x) => !x.sample).map((x) => h('label', { class: 'check' }, h('input', { type: 'radio', name: 'dog', value: x.id, checked: x.id === q.dogId }), x.name)), (f) => { if (f.get('dog')) q.dogId = f.get('dog'); save(); })),
          row('acal', day_ ? 'Select Date' : 'Select Dates', dates, () => openSheet(day_ ? 'Select date' : 'Select dates', [field(day_ ? 'Date' : 'Check-in', h('input', { type: 'date', name: 'a', value: q.checkin, required: true })), !day_ && field('Check-out', h('input', { type: 'date', name: 'b', value: q.checkout, required: true }))], (f) => { const a = f.get('a'), b = day_ ? '' : f.get('b'); if (!day_ && (!b || b <= a)) return 'Check-out needs to be after check-in.'; q.checkin = a; q.checkout = b; save(); })),
          row('aclock', 'Drop-off & Pick-up', q.drop || q.pick ? `${q.drop || '[Drop-off]'} · ${q.pick || '[Pick-up]'}` : 'Choose your windows', () => openSheet('Drop-off & pick-up', [field('Preferred drop-off', h('input', { name: 'drop', value: q.drop })), field('Preferred pick-up', h('input', { name: 'pick', value: q.pick }))], (f) => { q.drop = String(f.get('drop')).trim(); q.pick = String(f.get('pick')).trim(); save(); })),
          row('aspark', 'Add-Ons', q.addons || 'Anything extra for the visit?', () => openSheet('Add-ons', field('Anything to add', h('textarea', { name: 'v' }, q.addons)), (f) => { q.addons = String(f.get('v')).trim(); save(); }))),
        h('button', { class: 'cta', disabled: !ready, onclick: submit }, 'Send request →'),
        h('p', { class: 'note', role: 'status' }, ready ? '' : (day_ ? 'Choose a date to continue.' : 'Choose your dates to continue.'))),
    ];
  }
  function submit() {
    const q = S.draft; const d = dogById(q.dogId);
    const r = { id: uid(), type: q.type, dog: d.name, checkin: q.checkin, checkout: q.checkout, drop: q.drop, pick: q.pick, addons: q.addons, status: 'pending', at: new Date().toISOString() };
    S.requests.unshift(r); S.draft = { type: q.type, dogId: q.dogId, checkin: '', checkout: '', drop: '', pick: '', addons: '' }; save(); location.hash = `#/booked/${r.id}`;
  }
  function booked(id) {
    const r = S.requests.find((x) => x.id === id); if (!r) return home();
    return [hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 340, title: ['Request', h('br'), 'received'], sub: 'We’ll confirm shortly.', back: '#/home' }),
      h('div', { class: 'body' }, h('div', { class: 'rows', style: 'margin-top:0' },
        h('div', { class: 'row plain' }, ic(r.type === 'day' ? 'asun' : 'abed'), h('span', { class: 'grow' }, h('b', {}, r.type === 'day' ? 'Day Club' : 'Hotel Stay'), h('i', {}, r.dog))),
        h('div', { class: 'row plain' }, ic('acal'), h('span', { class: 'grow' }, h('b', {}, 'Dates'), h('i', {}, `${day(r.checkin)}${r.checkout ? ' – ' + day(r.checkout) : ''}`)))),
        h('a', { class: 'cta', href: '#/home' }, 'Back home'))];
  }

  // ---------- Messages ----------
  function messages() {
    const t = $('#screen'); void t;
    const last = S.msgs[S.msgs.length - 1];
    const row = (href, avatar, name, time, line, dot) => h('a', { class: 'thread', href }, avatar, h('span', { class: 'grow' }, h('span', { class: 'top' }, h('b', {}, name), h('span', {}, time)), h('span', { class: 'line' }, h('span', {}, line), dot && h('span', { class: 'dot' }))));
    return [
      hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 330, title: 'Messages', sub: 'Straight from Leon’s team.', action: pillBtn('New', 'aplus', () => (location.hash = '#/thread/team')) }),
      stats([[String(S.unread || 0), 'Unread'], [String(SHOTS.filter((s) => s.when === 'today').length), 'Photos today'], [String(S.updates.length), 'Care updates']]),
      h('div', { class: 'threads' },
        row('#/thread/team', h('span', { class: 'avatar' }, h('img', { src: 'icons/leons-head-mark-ink.svg', alt: '' })), 'Leon’s Team', hhmm(last.at), last.text, !!S.unread),
        row('#/thread/care', h('span', { class: 'avatar photo' }, h('img', { src: 'photos/luna-guest.webp', alt: '' })), 'Care Update', '9:42 AM', 'Photos from today’s play.'),
        row('#/thread/booking', h('span', { class: 'avatar navy' }, ic('abell')), 'Booking Confirmed', 'Yesterday', 'Your Day Club visit is set.')),
    ];
  }
  const inDesk = () => location.hash.startsWith('#/desk');
  function thread(key) {
    if (key !== 'team') return [h('div', { class: 'body' }, h('a', { href: '#/messages', class: 'chip', style: 'display:inline-block;text-decoration:none' }, '← Back'), h('h1', { class: 'hero-title', style: 'margin-top:18px;font-size:48px' }, key === 'care' ? 'Care update' : 'Booking confirmed'), h('div', { class: 'bubble', style: 'margin-top:16px' }, key === 'care' ? 'Photos from today’s play.' : 'Your Day Club visit is set.', h('small', {}, key === 'care' ? '9:42 AM' : 'Yesterday')))];
    if (!inDesk() && S.unread) { S.unread = 0; save(); }
    const ta = h('textarea', { 'aria-label': 'Message', placeholder: 'Write a message…' });
    return [h('div', { class: 'body' }, h('a', { href: '#/messages', class: 'chip', style: 'display:inline-block;text-decoration:none' }, '← Back'), h('h1', { class: 'hero-title', style: 'margin-top:18px;font-size:48px' }, 'Leon’s team')),
      h('div', { class: 'convo' }, S.msgs.map((m) => { const mine = inDesk() ? m.from === 'staff' : m.from === 'me'; return h('div', { class: 'bubble' + (mine ? ' me' : '') }, m.text, h('small', {}, `${m.from === 'me' ? 'Owner' : 'Leon’s team'} · ${hhmm(m.at)}`)); })),
      h('form', { class: 'compose', onsubmit: (e) => { e.preventDefault(); if (!ta.value.trim()) return; S.msgs.push({ from: inDesk() ? 'staff' : 'me', text: ta.value.trim(), at: new Date().toISOString() }); save(); render(); } }, ta, h('button', { class: 'cta cream', style: 'margin-top:0' }, 'Send'))];
  }

  // ---------- Photos & Updates ----------
  let photoTab = 'Today';
  const SHOTS = [
    { id: 1, when: 'today', img: 'photos/golden-walk.jpg', pos: '58% 30%', tag: '9:05 AM · MORNING WALK', cap: 'Luna on her morning walk, tail up the whole way.', alt: 'A golden retriever out on a walk, leash in hand' },
    { id: 2, when: 'today', img: 'photos/luna-guest.webp', pos: '76% 25%', tag: '10:40 AM · REST', cap: 'Nap time on the lounge.', alt: 'Luna resting on a velvet lounge' },
    { id: 3, when: 'today', img: 'photos/dog-golden-sitting.webp', pos: '50% 20%', tag: '12:10 PM · PLAY YARD', cap: 'Posing in the sun after lunch.', alt: 'A golden retriever sitting in the park' },
    { id: 4, when: 'today', img: 'photos/dog-small-ears-up.webp', pos: '50% 22%', tag: '1:20 PM · CHECK-IN', cap: 'Bruno stops by to say hello.', alt: 'A French bulldog sitting with ears up' },
    { id: 5, when: 'stay', img: 'photos/dog-beagle-ball.webp', pos: '60% 30%', tag: 'YESTERDAY · FETCH', cap: 'Biscuit and the red ball. Inseparable.', alt: 'A beagle lying in the grass with a red ball' },
  ];
  function photos() {
    const items = photoTab === 'Today' ? SHOTS.filter((s) => s.when === 'today') : SHOTS;
    const big = items[0];
    const tile = (s) => h('button', { class: 'shot ' + (s.tone || ''), type: 'button', 'aria-label': s.img ? s.alt : s.ph,
      onclick: () => openSheet('Photo', [s.img ? h('img', { class: 'lightbox', src: s.img, alt: s.alt }) : h('div', { class: 'shot-ph ' + (s.tone || '') }, s.ph), h('p', { class: 'hero-sub', style: 'margin-top:12px' }, s.cap || '[Caption from the care team.]')], () => null, 'Close') },
      s.img ? h('img', { src: s.img, alt: '', style: `object-position:${s.pos || '50% 30%'}` }) : h('span', {}, s.ph));
    return [
      hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 330, title: ['Photos &', h('br'), 'updates'], sub: 'Straight from the day.', back: '#/home' }),
      stats([[String(SHOTS.filter((s) => s.when === 'today').length), 'Photos today'], [String(S.updates.length), 'Updates'], [String(SHOTS.length), 'This stay']]),
      h('div', { class: 'body' },
        h('div', { class: 'chips on-dark', role: 'group', 'aria-label': 'Show' }, ['Today', 'This stay', 'All'].map((t) => h('button', { class: 'chip', 'aria-pressed': String(t === photoTab), onclick: () => { photoTab = t; render(); } }, t))),
        big && h('div', { class: 'feature' }, tile(big), h('div', { class: 'cap' }, h('span', { class: 'capline' }, ic('acam'), big.tag || '[TIME] · PLAY GROUP'), h('p', {}, big.cap || '[Caption from the care team.]'))),
        h('div', { class: 'grid' }, items.slice(1).map(tile)),
        photoTab === 'Today' ? h('button', { class: 'cta cream', onclick: () => { photoTab = 'All'; render(); } }, ic('acam'), `View all (${SHOTS.length})`) : null),
    ];
  }

  // ---------- Account ----------
  function account() {
    const p = S.profile;
    const luna = dogById('luna');
    const row = (icon, title, note, onclick, extra) => h('button', { class: 'row', type: 'button', onclick }, ic(icon), h('span', { class: 'grow' }, h('b', {}, title), h('i', {}, note)), extra || ic('achev', 'chev'));
    const card = h('div', { class: 'member', 'aria-label': 'Member card' },
      h('div', { class: 'member-main' },
        h('span', { class: 'mono' }, 'Member № 0042'),
        h('div', { class: 'member-name' }, 'LEON’S'),
        h('div', { class: 'member-foot' }, h('span', {}, `${luna.name} · ${p.name || '[HUMAN]'}`), h('span', {}, 'Member since 2026'))),
      h('div', { class: 'qr', role: 'img', 'aria-label': 'Space for the check-in QR code' }, h('span', {}, 'QR', h('br'), 'CHECK-IN')));
    return [
      hero({ img: 'photos/luna-guest.webp', pos: '76% 25%', hh: 300, title: 'Account', sub: p.name ? `Hello, ${p.name}.` : 'Your household at Leon’s.', back: '#/home' }),
      h('div', { class: 'body', style: 'padding-top:0' },
        h('div', { class: 'member-wrap' }, card),
        h('div', { class: 'sec-head' }, h('h2', {}, 'You')),
        h('div', { class: 'rows', style: 'margin-top:0' },
          row('aacct', 'Profile', [p.name || '[Name]', p.email || '[Email]', p.phone || 'Add phone'].join(' · '), () => openSheet('Profile', [field('Name', h('input', { name: 'name', value: p.name, autocomplete: 'name' })), field('Email', h('input', { name: 'email', type: 'email', value: p.email, autocomplete: 'email' })), field('Phone', h('input', { name: 'phone', type: 'tel', value: p.phone, autocomplete: 'tel' }))], (f) => { p.name = String(f.get('name')).trim(); p.email = String(f.get('email')).trim(); p.phone = String(f.get('phone')).trim(); save(); })),
          row('aheart', 'Emergency contact', p.emergency || 'Add a contact', () => openSheet('Emergency contact', field('Name and phone', h('input', { name: 'v', value: p.emergency })), (f) => { p.emergency = String(f.get('v')).trim(); save(); })),
          row('apay', 'Payment method', 'Not set up yet', () => openSheet('Payment method', [h('p', { class: 'hero-sub', style: 'font-size:18px' }, 'Payments aren’t connected yet. We’ll add a secure card form before anything is billed.'), h('p', { class: 'note', style: 'text-align:left;margin-top:12px' }, 'Don’t enter card details anywhere in this preview.')], () => null, 'Got it')),
          row('abell', 'Notifications', `${S.settings.recap} · ${S.settings.notify ? 'messages on' : 'messages off'}`, () => openSheet('Notifications', [h('div', { class: 'field' }, 'Daily recap', ['Daily email', 'Push notification', 'Off'].map((o) => h('label', { class: 'check', style: 'margin-top:8px' }, h('input', { type: 'radio', name: 'recap', value: o, checked: S.settings.recap === o }), o))), h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'notify', checked: S.settings.notify }), 'Tell me about new messages'), h('p', { class: 'note', style: 'text-align:left' }, 'Recaps and push alerts aren’t sent in this preview.')], (f) => { S.settings.recap = f.get('recap') || S.settings.recap; S.settings.notify = f.get('notify') === 'on'; save(); }))),
        h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Demo')),
        h('div', { class: 'rows', style: 'margin-top:0' },
          h('a', { class: 'row', href: '#/desk' }, ic('abell'), h('span', { class: 'grow' }, h('b', {}, 'Open Leon’s Care Desk'), h('i', {}, 'Staff view. A demo switch, not a real sign-in.')), ic('achev', 'chev')),
          row('aopen', 'Reset demo data', 'Clears everything saved in this browser.', () => openSheet('Reset demo data?', h('p', { class: 'hero-sub', style: 'font-size:18px' }, 'This clears the dogs, requests and messages you added in this browser.'), () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } location.hash = '#/home'; location.reload(); return null; }, 'Reset')))),
    ];
  }

  // ---------- Leon's Care Desk (demo role: not real access control) ----------
  const pending = () => S.requests.filter((r) => (r.status || 'pending') === 'pending');
  const walkOf = (dogId) => S.walks.filter((w) => w.dog === dogId);
  const activeWalk = (dogId) => walkOf(dogId).find((w) => !w.end);
  const real = () => S.dogs.filter((d) => !d.sample);
  const dogAvatar = (d) => h('span', { class: 'avatar photo' }, h('img', { src: d.photo || 'photos/luna-guest.webp', alt: '', style: `object-position:${d.pos || '50% 25%'}` }));

  function deskToday() {
    const doneWalks = S.walks.filter((w) => w.end).length;
    const live = S.walks.filter((w) => !w.end).length;
    return [
      hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 340, title: 'Today', sub: 'Your day at a glance.', tag: '● CARE DESK' }),
      stats([[String(pending().length), 'Requests'], [String(live), 'Walking now'], [String(doneWalks), 'Walks done']]),
      h('div', { class: 'body' },
        pending().length ? h('a', { class: 'banner', href: '#/desk/requests' }, ic('abell'), h('span', { class: 'grow' }, h('b', {}, `${pending().length} request${pending().length > 1 ? 's' : ''} waiting`), h('i', {}, 'Approve or decline.')), ic('achev', 'chev')) : null,
        h('div', { class: 'sec-head' }, h('h2', {}, 'Today’s walks'), h('span', {}, 'Tap a dog')),
        h('div', { class: 'rows', style: 'margin-top:0' }, real().map((d) => { const aw = activeWalk(d.id); const dn = walkOf(d.id).filter((w) => w.end).length;
          return h('a', { class: 'row', href: `#/desk/dog/${d.id}` }, dogAvatar(d), h('span', { class: 'grow' }, h('b', {}, d.name), h('i', {}, aw ? `Out since ${hhmm(aw.start)}` : dn ? `${dn} walk${dn > 1 ? 's' : ''} done` : `${d.walkAt || 'Unscheduled'} · not started`)), h('span', { class: 'status ' + (aw ? 'live' : '') }, aw ? 'WALKING' : dn ? 'DONE' : 'TO DO'), ic('achev', 'chev')); })),
        h('p', { class: 'note' }, 'Walks record start and end times only. No GPS.')),
    ];
  }

  function deskRequests() {
    const decide = (r, status) => { r.status = status; r.at2 = new Date().toISOString(); save(); render(); };
    const card = (r) => {
      const d = S.dogs.find((x) => x.name === r.dog) || S.dogs[0];
      return h('div', { class: 'req' },
        h('div', { class: 'req-top' }, dogAvatar(d), h('span', { class: 'grow' }, h('b', {}, r.dog), h('i', {}, `${r.type === 'day' ? 'Day Club' : 'Hotel Stay'} · ${day(r.checkin)}${r.checkout ? ' – ' + day(r.checkout) : ''}`))),
        (r.drop || r.pick) ? h('p', { class: 'req-line' }, `Drop-off ${r.drop || '[ ]'} · Pick-up ${r.pick || '[ ]'}`) : null,
        r.addons ? h('p', { class: 'req-line' }, `Add-ons: ${r.addons}`) : null,
        r.status === 'pending'
          ? h('div', { class: 'req-actions' }, h('button', { class: 'no', type: 'button', onclick: () => decide(r, 'declined') }, ic('adecline'), 'Decline'), h('button', { class: 'go', type: 'button', onclick: () => decide(r, 'approved') }, ic('acheck'), 'Approve'))
          : h('p', { class: 'status-line ' + r.status }, r.status === 'approved' ? '✓ Approved' : '✕ Declined'));
    };
    const waiting = pending(); const decided = S.requests.filter((r) => r.status !== 'pending');
    return [
      hero({ img: 'photos/dog-golden-sitting.webp', pos: '50% 20%', hh: 300, title: 'Requests', sub: `${waiting.length} waiting.`, back: '#/desk' }),
      h('div', { class: 'body', style: 'padding-top:20px' },
        waiting.length ? waiting.map(card) : h('div', { class: 'empty' }, h('b', {}, 'Nothing waiting'), h('i', {}, 'New requests from owners show up here.')),
        decided.length ? [h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Decided')), ...decided.map(card)] : null),
    ];
  }

  function deskDog(id) {
    const d = dogById(id); const aw = activeWalk(d.id); const log = walkOf(d.id).filter((w) => w.end).reverse();
    const priv = h('textarea', { 'aria-label': 'Private note', placeholder: 'Only staff can see this.' });
    const upd = h('textarea', { 'aria-label': 'Update for the owner', placeholder: 'A short, friendly note for the owner.' });
    const care = S.careNotes.filter((n) => n.dog === d.id);
    const notes = Object.entries(d.notes || {}).filter(([, v]) => v);
    return [
      hero({ img: d.photo || 'photos/luna-guest.webp', pos: d.pos, hh: 360, title: d.name, sub: `${d.breed || '[Breed]'} · ${d.age || '[age]'}`, back: '#/desk' }),
      h('div', { class: 'walkbar' },
        h('div', { class: 'grow' }, h('b', {}, aw ? 'Walk in progress' : 'Ready for a walk'), h('i', {}, aw ? `Started ${hhmm(aw.start)}` : 'Times only. No GPS.')),
        h('button', { class: 'go', type: 'button', disabled: !!aw, onclick: () => { S.walks.push({ id: uid(), dog: d.id, start: new Date().toISOString(), end: null }); save(); render(); } }, ic('asun'), 'Start walk'),
        h('button', { class: 'stop', type: 'button', disabled: !aw, onclick: () => { aw.end = new Date().toISOString(); save(); render(); } }, 'End walk')),
      h('div', { class: 'body' },
        h('div', { class: 'sec-head' }, h('h2', {}, 'Care instructions')),
        h('div', { class: 'rows', style: 'margin-top:0' }, [...care.map((n) => h('div', { class: 'row plain' }, ic('anote'), h('span', { class: 'grow' }, h('b', {}, day(n.date)), h('i', {}, n.text)))), ...notes.map(([k, v]) => h('div', { class: 'row plain' }, ic('aheart'), h('span', { class: 'grow' }, h('b', {}, k[0].toUpperCase() + k.slice(1)), h('i', {}, v))))].concat(care.length || notes.length ? [] : [h('div', { class: 'row plain' }, ic('anote'), h('span', { class: 'grow' }, h('b', {}, 'None on file'), h('i', {}, 'The owner hasn’t added any yet.')))])),
        h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Walk log')),
        h('div', { class: 'rows', style: 'margin-top:0' }, log.length ? log.map((w) => h('div', { class: 'row plain' }, ic('aclock'), h('span', { class: 'grow' }, h('b', {}, `${hhmm(w.start)} – ${hhmm(w.end)}`), h('i', {}, day(w.start.slice(0, 10)))))) : [h('div', { class: 'row plain' }, ic('aclock'), h('span', { class: 'grow' }, h('b', {}, 'No walks yet'), h('i', {}, 'Start one above.')))]),
        h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Private note')),
        h('form', { class: 'deskform', onsubmit: (e) => { e.preventDefault(); if (!priv.value.trim()) return; S.staffNotes.unshift({ id: uid(), dog: d.id, at: new Date().toISOString(), text: priv.value.trim() }); save(); render(); toast('Private note saved'); } }, h('p', { class: 'note', style: 'text-align:left;margin:0' }, 'Staff only. Owners never see this.'), priv, h('button', { class: 'cta', style: 'margin-top:0;height:48px;font-size:17px' }, 'Save private note')),
        S.staffNotes.filter((n) => n.dog === d.id).map((n) => h('div', { class: 'row plain deskrow' }, ic('aprivate'), h('span', { class: 'grow' }, h('b', {}, hhmm(n.at)), h('i', {}, n.text)))),
        h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Update for the owner')),
        h('form', { class: 'deskform', onsubmit: (e) => { e.preventDefault(); if (!upd.value.trim()) return; S.updates.unshift({ id: uid(), dog: d.id, at: new Date().toISOString(), text: upd.value.trim() }); save(); render(); toast('Update sent to the owner'); } }, upd, h('button', { class: 'cta cream', style: 'margin-top:0;height:48px;font-size:17px' }, 'Send update')),
        S.updates.filter((n) => n.dog === d.id).map((n) => h('div', { class: 'row plain deskrow' }, ic('amsg'), h('span', { class: 'grow' }, h('b', {}, hhmm(n.at)), h('i', {}, n.text))))),
    ];
  }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; clearTimeout(toast.t); toast.t = setTimeout(() => (t.textContent = ''), 2400); }

  // ---------- Today at the club ----------
  function today() {
    const w = S.walks.filter((x) => x.dog === 'luna').slice(-1)[0];
    const walkTxt = w ? (w.end ? `${hhmm(w.start)} – ${hhmm(w.end)}` : `since ${hhmm(w.start)}`) : '9:00 AM';
    const steps = [['acheck', 'Checked In', '8:42 AM'], [w && w.end ? 'acheck' : 'aopen', 'Walk', walkTxt], ['acheck', 'Play Time', '9:40 AM'], ['aopen', 'Rest & Recharge', '12:15 PM'], ['aopen', 'Afternoon Play', '2:00 PM']];
    const ups = S.updates.filter((u) => u.dog === 'luna');
    return [
      hero({ img: 'photos/luna-guest.webp', hh: 380, title: ['Luna’s', h('br'), 'Day Club'], sub: '8:30 AM – 5:30 PM · having a big one.', tag: '● TODAY AT THE CLUB' }),
      stats([['2', 'Meals'], ['3', 'Play sessions'], [String(SHOTS.filter((s) => s.when === 'today').length), 'Photos']]),
      h('div', { class: 'body' }, h('div', { class: 'card' }, steps.map(([i, t, tm]) => h('div', { class: 'step' }, ic(i), h('span', {}, t), h('small', {}, tm)))), ups.length ? h('div', { class: 'rows' }, ups.map((u) => h('div', { class: 'row plain' }, ic('amsg'), h('span', { class: 'grow' }, h('b', {}, `Leon’s team · ${hhmm(u.at)}`), h('i', {}, u.text))))) : null,
        h('a', { class: 'cta cream', href: '#/photos' }, ic('acam'), `View photos (${SHOTS.filter((s) => s.when === 'today').length})`)),
    ];
  }

  // ---------- router ----------
  const SCREENS = {
    home: ['t-cream', home, 'Home'], dogs: ['t-cream', dogs, 'Dogs'], dog: ['t-white', (a) => profile(a), 'Dogs'], book: ['t-cream', book, 'Book'], booked: ['t-cream', booked, 'Book'],
    messages: ['t-forest', messages, 'Messages'], thread: ['t-forest', thread, 'Messages'], today: ['t-navy', today, 'Home'],
    photos: ['t-navy', photos, 'Home'],
    desk: ['t-cream', deskToday, 'dToday'], 'desk-requests': ['t-cream', deskRequests, 'dRequests'], 'desk-dog': ['t-cream', (a) => deskDog(a), 'dToday'], 'desk-thread': ['t-forest', (a) => thread(a || 'team'), 'dMessages'], account: ['t-cream', account, 'Account'],
  };
  const TABS = { Home: 'home', Book: 'book', Dogs: 'dogs', Messages: 'messages', Account: 'account' };
  function render() {
    let [r = 'home', arg, arg2] = location.hash.replace(/^#\/?/, '').split('/');
    if (r === 'desk') { if (arg === 'requests') r = 'desk-requests'; else if (arg === 'dog') { r = 'desk-dog'; arg = arg2; } else if (arg === 'messages') { r = 'desk-thread'; arg = 'team'; } }
    const desk = r.startsWith('desk');
    document.body.classList.toggle('desk', desk);
    const [cls, fn, tab] = SCREENS[r] || SCREENS.home;
    $('#screen').className = cls;
    $('#screen').replaceChildren(...[fn(arg)].flat().filter(Boolean));
    document.querySelectorAll('.tabs a').forEach((a) => (a.dataset.tab === (desk ? tab : TABS[tab]) ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = ({ home: 'LEON’S', dogs: 'My dogs · LEON’S', dog: 'Dog · LEON’S', book: 'Book a visit · LEON’S', messages: 'Messages · LEON’S', today: 'Today · LEON’S' })[r] || 'LEON’S';
  }
  addEventListener('hashchange', () => { render(); scrollTo(0, 0); $('#screen').focus({ preventScroll: true }); });
  render();
})();
