/* LEON'S · pet owner app. Prototype: data stays in this browser.
   No prices, times or phone numbers are invented; unknown values show as [BRACKETS]. */
(() => {
  const KEY = 'leons-owner-v3';
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
  const seed = () => ({
    dogs: [
      { id: 'luna', name: 'Luna', breed: 'Golden retriever', age: '', blurb: 'loves a sofa', photo: 'photos/luna-guest.webp', pos: '76% 25%', status: '● Day Club · [TOMORROW]', notes: {} },
      { id: 'd2', name: '[DOG 2]', breed: '', age: '', photo: 'photos/dog-small-ears-up.webp', pos: '50% 22%', status: 'Next · [DATE]', notes: {}, sample: true },
      { id: 'd3', name: '[DOG 3]', breed: '', age: '', photo: 'photos/dog-beagle-ball.webp', pos: '60% 30%', status: 'No visit booked', notes: {}, sample: true },
    ],
    requests: [],
    draft: { type: 'day', dogId: 'luna', checkin: '', checkout: '', drop: '', pick: '', addons: '' },
    msgs: [{ from: 'staff', text: 'Luna had a great day.', at: new Date().toISOString() }],
    careNotes: [],
  });
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage unavailable */ } };
  const dogById = (id) => S.dogs.find((d) => d.id === id) || S.dogs[0];
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
    tag && h('span', { class: 'circle pill tag' }, tag),
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
      hero({ img: 'photos/dog-golden-sitting.webp', pos: '50% 12%', hh: 440, size: 'clamp(40px,12.5vw,54px)', title: ['Welcome back,', h('br'), '[NAME].'], sub: 'Your dog is on the list.' }),
      stats([[String(S.dogs.length), 'Dogs'], [nextReq ? new Date((nextReq.checkin || '') + 'T00:00').toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase() : '[DAY]', 'Next visit'], ['[#]', 'Unread']]),
      h('div', { class: 'body' },
        h('div', { class: 'tiles' },
          tile('#/book', 'forest', 'acal', 'Book a visit', 'We’ll hold a spot.'),
          tile('#/today', 'navy', 'asun', 'Today at the club', 'See how the day is going.'),
          tile('#/dogs', '', 'adog', 'My dogs', `${real || S.dogs.length} on the list.`),
          tile('#/messages', '', 'amsg', 'Messages', 'Straight from Leon’s team.')),
        S.requests.length ? [h('div', { class: 'sec-head', style: 'margin-top:22px' }, h('h2', {}, 'Your requests')), h('div', { class: 'rows', style: 'margin-top:0' }, S.requests.map((r) => h('div', { class: 'row plain' }, ic(r.type === 'day' ? 'asun' : 'abed'), h('span', { class: 'grow' }, h('b', {}, `${r.type === 'day' ? 'Day Club' : 'Hotel Stay'} · ${r.dog}`), h('i', {}, `${day(r.checkin)}${r.checkout ? ' – ' + day(r.checkout) : ''} · requested`)))))] : null),
    ];
  }

  // ---------- My Dogs ----------
  function dogs() {
    return [
      hero({ img: 'photos/luna-guest.webp', hh: 400, title: 'My dogs', sub: `${S.dogs.length} on the list. All good dogs.`, back: '#/home', action: pillBtn('Add a dog', 'aplus', addDog) }),
      stats([['[#]', 'Visits this month'], ['[#]', 'Nights stayed'], ['[DAY]', 'Next visit']]),
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
      body = h('div', { class: 'empty' }, h('b', {}, 'Nothing here yet'), h('i', {}, 'Visits show up here after the first one.'));
    }
    return [
      hero({ img: d.photo || 'photos/luna-guest.webp', pos: d.pos, hh: 380, title: d.name, sub: `${d.breed || '[Breed]'} · ${d.age || '[age]'}${d.blurb ? ' · ' + d.blurb : ''}`, back: '#/dogs', action: pillBtn('Edit', null, () => openSheet(`Edit ${d.name}`, [field('Name', h('input', { name: 'name', value: d.name, required: true })), field('Breed', h('input', { name: 'breed', value: d.breed || '' })), field('Age', h('input', { name: 'age', value: d.age || '' }))], (f) => { const n = String(f.get('name')).trim(); if (!n) return 'Add a name.'; d.name = n; d.breed = String(f.get('breed')).trim(); d.age = String(f.get('age')).trim(); d.sample = false; save(); })) }),
      stats([['[#]', 'Visits'], ['[#]', 'Nights'], ['[#]', 'Best friends']]),
      h('div', { class: 'body' }, h('div', { class: 'chips', role: 'group', 'aria-label': 'Profile section' }, ['Details', 'Care Notes', 'History'].map((t) => h('button', { class: 'chip', 'aria-pressed': String(t === profileTab), onclick: () => { profileTab = t; render(); } }, t))), body),
    ];
  }

  // ---------- Book a visit ----------
  function book(type) {
    const q = S.draft; if (type === 'day' || type === 'hotel') q.type = type;
    const day_ = q.type === 'day'; const d = dogById(q.dogId);
    const row = (icon, title, note, onclick) => h('button', { class: 'row', type: 'button', onclick }, ic(icon), h('span', { class: 'grow' }, h('b', {}, title), h('i', {}, note)), ic('achev', 'chev'));
    const dates = day_ ? (q.checkin ? day(q.checkin) : '[Choose dates]') : (q.checkin || q.checkout ? `${day(q.checkin) || '[Check-in]'} – ${day(q.checkout) || '[Check-out]'}` : '[Choose dates]');
    const ready = q.checkin && (day_ || q.checkout);
    return [
      hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 360, title: 'Book a visit', sub: `We’ll hold a spot for ${d.name}.`, back: '#/home' }),
      stats([['[#]', 'Spots open'], ['[#]', 'Suites free'], ['[#]', 'Visits left']]),
      h('div', { class: 'body' },
        h('div', { class: 'toggle', role: 'group', 'aria-label': 'Service' },
          h('button', { 'aria-pressed': String(day_), onclick: () => { q.type = 'day'; save(); render(); } }, ic('asun'), 'Day Club'),
          h('button', { 'aria-pressed': String(!day_), onclick: () => { q.type = 'hotel'; save(); render(); } }, ic('abed'), 'Hotel Stay')),
        h('div', { class: 'rows' },
          row('adog', 'Which dog', d.name, () => openSheet('Which dog', S.dogs.filter((x) => !x.sample).map((x) => h('label', { class: 'check' }, h('input', { type: 'radio', name: 'dog', value: x.id, checked: x.id === q.dogId }), x.name)), (f) => { if (f.get('dog')) q.dogId = f.get('dog'); save(); })),
          row('acal', day_ ? 'Select Date' : 'Select Dates', dates, () => openSheet(day_ ? 'Select date' : 'Select dates', [field(day_ ? 'Date' : 'Check-in', h('input', { type: 'date', name: 'a', value: q.checkin, required: true })), !day_ && field('Check-out', h('input', { type: 'date', name: 'b', value: q.checkout, required: true }))], (f) => { const a = f.get('a'), b = day_ ? '' : f.get('b'); if (!day_ && (!b || b <= a)) return 'Check-out needs to be after check-in.'; q.checkin = a; q.checkout = b; save(); })),
          row('aclock', 'Drop-off & Pick-up', q.drop || q.pick ? `${q.drop || '[Drop-off]'} · ${q.pick || '[Pick-up]'}` : '[Morning] · [Evening] windows', () => openSheet('Drop-off & pick-up', [field('Preferred drop-off', h('input', { name: 'drop', value: q.drop })), field('Preferred pick-up', h('input', { name: 'pick', value: q.pick }))], (f) => { q.drop = String(f.get('drop')).trim(); q.pick = String(f.get('pick')).trim(); save(); })),
          row('aspark', 'Add-Ons', q.addons || '[Bath, grooming, enrichment]', () => openSheet('Add-ons', field('Anything to add', h('textarea', { name: 'v' }, q.addons)), (f) => { q.addons = String(f.get('v')).trim(); save(); }))),
        h('button', { class: 'cta', disabled: !ready, onclick: submit }, 'Send request →'),
        h('p', { class: 'note', role: 'status' }, ready ? '' : (day_ ? 'Choose a date to continue.' : 'Choose your dates to continue.'))),
    ];
  }
  function submit() {
    const q = S.draft; const d = dogById(q.dogId);
    const r = { id: uid(), type: q.type, dog: d.name, checkin: q.checkin, checkout: q.checkout, drop: q.drop, pick: q.pick, addons: q.addons, at: new Date().toISOString() };
    S.requests.unshift(r); S.draft = { type: q.type, dogId: q.dogId, checkin: '', checkout: '', drop: '', pick: '', addons: '' }; save(); location.hash = `#/booked/${r.id}`;
  }
  function booked(id) {
    const r = S.requests.find((x) => x.id === id); if (!r) return home();
    return [hero({ img: 'photos/golden-walk.jpg', pos: '58% 30%', hh: 340, title: ['Request', h('br'), 'received'], sub: 'We’ll confirm within [TIME].', back: '#/home' }),
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
      stats([['[#]', 'Unread'], ['[#]', 'Photos today'], ['[#]', 'Care updates']]),
      h('div', { class: 'threads' },
        row('#/thread/team', h('span', { class: 'avatar' }, h('img', { src: 'icons/leons-head-mark-ink.svg', alt: '' })), 'Leon’s Team', '[time]', last.text, true),
        row('#/thread/care', h('span', { class: 'avatar photo' }, h('img', { src: 'photos/luna-guest.webp', alt: '' })), 'Care Update', '[time]', 'Photos from today’s play.'),
        row('#/thread/booking', h('span', { class: 'avatar navy' }, ic('abell')), 'Booking Confirmed', '[day]', 'Your Day Club visit is set.')),
    ];
  }
  function thread(key) {
    if (key !== 'team') return [h('div', { class: 'body' }, h('a', { href: '#/messages', class: 'chip', style: 'display:inline-block;text-decoration:none' }, '← Back'), h('h1', { class: 'hero-title', style: 'margin-top:18px;font-size:48px' }, key === 'care' ? 'Care update' : 'Booking confirmed'), h('div', { class: 'bubble', style: 'margin-top:16px' }, key === 'care' ? 'Photos from today’s play.' : 'Your Day Club visit is set.', h('small', {}, '[time]')))];
    const ta = h('textarea', { 'aria-label': 'Message', placeholder: 'Write a message…' });
    return [h('div', { class: 'body' }, h('a', { href: '#/messages', class: 'chip', style: 'display:inline-block;text-decoration:none' }, '← Back'), h('h1', { class: 'hero-title', style: 'margin-top:18px;font-size:48px' }, 'Leon’s team')),
      h('div', { class: 'convo' }, S.msgs.map((m) => h('div', { class: 'bubble' + (m.from === 'me' ? ' me' : '') }, m.text, h('small', {}, `${m.from === 'me' ? 'You' : 'Leon’s team'} · ${hhmm(m.at)}`)))),
      h('form', { class: 'compose', onsubmit: (e) => { e.preventDefault(); if (!ta.value.trim()) return; S.msgs.push({ from: 'me', text: ta.value.trim(), at: new Date().toISOString() }); save(); render(); } }, ta, h('button', { class: 'cta cream', style: 'margin-top:0' }, 'Send'))];
  }

  // ---------- Today at the club ----------
  function today() {
    const steps = [['acheck', 'Checked In', '[time]'], ['acheck', 'Play Time', '[time]'], ['aopen', 'Rest & Recharge', '[time]'], ['aopen', 'Afternoon Play', '[time]']];
    return [
      hero({ img: 'photos/luna-guest.webp', hh: 380, title: ['Luna’s', h('br'), 'Day Club'], sub: '[Drop-off] – [Pick-up] · having a big one.', tag: '● TODAY AT THE CLUB' }),
      stats([['[#]', 'Meals'], ['[#]', 'Play sessions'], ['[#]', 'Photos']]),
      h('div', { class: 'body' }, h('div', { class: 'card' }, steps.map(([i, t, tm]) => h('div', { class: 'step' }, ic(i), h('span', {}, t), h('small', {}, tm)))),
        h('a', { class: 'cta cream', href: '#/photos' }, ic('acam'), 'View photos ([#])')),
    ];
  }

  // ---------- router ----------
  const SCREENS = {
    home: ['t-cream', home, 'Home'], dogs: ['t-cream', dogs, 'Dogs'], dog: ['t-white', (a) => profile(a), 'Dogs'], book: ['t-cream', book, 'Book'], booked: ['t-cream', booked, 'Book'],
    messages: ['t-forest', messages, 'Messages'], thread: ['t-forest', thread, 'Messages'], today: ['t-navy', today, 'Home'],
    photos: ['t-cream', () => soon('Photos', 'Photos from the club arrive in the next build.'), 'Home'], account: ['t-white', () => soon('Account', 'Account and payments come in the next build.'), 'Account'],
  };
  const TABS = { Home: 'home', Book: 'book', Dogs: 'dogs', Messages: 'messages', Account: 'account' };
  function render() {
    const [r = 'home', arg] = location.hash.replace(/^#\/?/, '').split('/');
    const [cls, fn, tab] = SCREENS[r] || SCREENS.home;
    $('#screen').className = cls;
    $('#screen').replaceChildren(...[fn(arg)].flat().filter(Boolean));
    document.querySelectorAll('.tabs a').forEach((a) => (a.dataset.tab === TABS[tab] ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = ({ home: 'LEON’S', dogs: 'My dogs · LEON’S', dog: 'Dog · LEON’S', book: 'Book a visit · LEON’S', messages: 'Messages · LEON’S', today: 'Today · LEON’S' })[r] || 'LEON’S';
  }
  addEventListener('hashchange', () => { render(); scrollTo(0, 0); $('#screen').focus({ preventScroll: true }); });
  render();
})();
