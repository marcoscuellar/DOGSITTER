/* LEON'S · pet owner app (Home, My Dogs, Book a Stay).
   Prototype: data stays in this browser. No prices, times or phone numbers are invented;
   unknown values show as [BRACKETS]. */
(() => {
  const KEY = 'leons-owner-v2';
    const SVG = 'http://www.w3.org/2000/svg';
  const $ = (s) => document.querySelector(s);

  // Safe DOM builder: text is always a text node.
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };
  const icon = (name, cls = '') => {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('class', 'ic ' + cls); s.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS(SVG, 'use'); u.setAttribute('href', `#leons-${name}`);
    s.append(u); return s;
  };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const day = (v) => (v ? new Date(v + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '');

  // ---------- state ----------
  const seed = () => ({
    // Luna's photo is the kit's sample. The two bracketed dogs only show the multi-dog layout.
    dogs: [
      { id: 'd1', name: 'Luna', photo: 'photos/luna-guest-PLACEHOLDER.webp' },
      { id: 'd2', name: '[DOG 2]', photo: 'photos/dog-small-ears-up.webp', sample: true },
      { id: 'd3', name: '[DOG 3]', photo: 'photos/dog-beagle-ball.webp', sample: true },
    ],
    bookings: [],
    draft: { type: 'hotel', checkin: '', checkout: '', dogIds: [], services: '' },
  });
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage unavailable */ } };
  const dogName = (d) => d.name;

  // ---------- bottom sheet ----------
  const sheet = $('#sheet');
  function openSheet(title, body, onSave, saveLabel = 'Save') {
    $('#sheet-title').textContent = title;
    $('#sheet-body').replaceChildren(...[body].flat());
    $('#sheet-save').textContent = saveLabel;
    $('#sheet-form').onsubmit = (e) => {
      e.preventDefault();
      const err = onSave(new FormData(e.target));
      if (err) { showErr(err); return; }
      sheet.close(); render();
    };
    $('#sheet-cancel').onclick = () => sheet.close();
    sheet.showModal();
    const first = sheet.querySelector('input,textarea'); if (first) first.focus();
  }
  function showErr(msg) {
    sheet.querySelector('.err')?.remove();
    $('#sheet-body').prepend(h('p', { class: 'err', role: 'alert' }, msg));
  }
  const field = (label, input) => h('label', { class: 'field' }, h('span', { class: 'label' }, label), input);

  // ---------- shared pieces ----------
  const back = (href = '#/home') => h('a', { class: 'iconbtn', href, 'aria-label': 'Back' }, icon('back'));
  const comingNext = (title, line) => h('div', { class: 'screen' }, h('div', { class: 'bar' }, back()),
    h('h1', { class: 'title' }, title),
    h('div', { class: 'card empty' }, h('span', { class: 'label label--cognac' }, 'Next build'), h('p', { class: 'sub' }, line)));

  // ---------- Home ----------
  function home() {
    const tile = (href, ic, text) => h('a', { class: 'tile', href }, icon(ic), text);
    return h('div', {},
      h('section', { class: 'hero on-ink', 'aria-label': 'Welcome' },
        h('div', { class: 'hero-brand' },
          h('img', { src: 'logos/leons-head-mark-bone.svg', alt: '' }),
          h('div', { class: 'name' }, 'LEON’S'),
          h('div', { class: 'label' }, 'Hotel & Day Club')),
        h('p', { class: 'hero-shot' }, '[Photo: a golden retriever stretched out on a suite bed, warm lamp light, looking right at the camera]'),
        h('div', { class: 'hero-welcome' }, h('h1', {}, 'Welcome back,', h('br'), '[NAME].'), h('p', {}, 'Your dog is on the list.'))),
      h('div', { class: 'tiles' },
        tile('#/book/hotel', 'hotel-stay', 'Book a stay'),
        tile('#/book/day', 'day-club', 'Day Club'),
        tile('#/dogs', 'dog', 'My dogs'),
        tile('#/messages', 'messages', 'Messages')));
  }

  // ---------- My Dogs ----------
  function dogs() {
    const list = S.dogs.map((d) => h('button', { class: 'dog card', onclick: () => (location.hash = `#/dog/${d.id}`), 'aria-label': `${dogName(d)}, open profile` },
      h('div', { class: 'shot' }, d.photo ? h('img', { class: 'photo', src: d.photo, alt: `${dogName(d)}` }) : (d.ph || `[Photo: tight on ${dogName(d)}'s face]`)),
      h('div', { class: 'dog-body' },
        h('div', { class: 'dog-name' }, dogName(d)),
        h('div', { class: 'dog-breed' }, d.breed || '[Breed]'),
        h('div', { class: 'dog-meta label label--cognac' }, `${d.age || '[AGE]'} · ${d.weight || '[WEIGHT]'}`)),
      icon('arrow-right')));
    return h('div', { class: 'screen' },
      h('div', { class: 'bar' }, back(), h('button', { class: 'iconbtn iconbtn--fill', 'aria-label': 'Add a dog', onclick: addDog }, icon('add'))),
      h('h1', { class: 'title' }, 'My dogs'),
      h('div', { class: 'dogs' }, list));
  }
  function addDog() {
    openSheet('Add a dog', [
      field('Name', h('input', { name: 'name', required: true, autocomplete: 'off' })),
      field('Breed (optional)', h('input', { name: 'breed', autocomplete: 'off' })),
      field('Age (optional)', h('input', { name: 'age', autocomplete: 'off' })),
      field('Weight (optional)', h('input', { name: 'weight', autocomplete: 'off' })),
    ], (f) => {
      const name = String(f.get('name')).trim();
      if (!name) return 'Add a name to continue.';
      S.dogs = S.dogs.filter((d) => !d.sample); // layout samples go away once a real dog is added
      S.dogs.push({ id: uid(), name, breed: String(f.get('breed')).trim(), age: String(f.get('age')).trim(), weight: String(f.get('weight')).trim() });
      save();
    }, 'Add dog');
  }

  // ---------- Book a Stay ----------
  function book(type) {
    const d = S.draft;
    if (type && (type === 'hotel' || type === 'day') && d.type !== type) { d.type = type; save(); }
    const hotel = d.type === 'hotel';
    const chosen = S.dogs.filter((x) => d.dogIds.includes(x.id) && !x.sample);
    const datesText = hotel
      ? (d.checkin || d.checkout ? `${day(d.checkin) || '[Check-in]'} – ${day(d.checkout) || '[Check-out]'}` : '[Check-in] – [Check-out]')
      : (d.checkin ? day(d.checkin) : '[Date]');
    const row = (ic, title, sub, onclick, extra) => h('button', { class: 'row', type: 'button', onclick, disabled: !onclick }, icon(ic), h('div', { class: 'row-text' }, h('div', { class: 'row-title' }, title), h('div', { class: 'row-sub' }, sub)), extra || (onclick ? icon('arrow-right', 'arrow') : null));
    const ready = d.checkin && (!hotel || d.checkout) && chosen.length;
    const note = h('p', { class: 'note', role: 'status' }, ready ? '' : (hotel ? 'Choose dates and a dog to continue.' : 'Choose a date and a dog to continue.'));
    return h('div', { class: 'screen' },
      h('div', { class: 'bar' }, back()),
      h('h1', { class: 'title' }, 'Book a stay'),
      h('div', { class: 'seg', role: 'group', 'aria-label': 'Service' },
        h('button', { 'aria-pressed': String(hotel), onclick: () => { d.type = 'hotel'; save(); render(); } }, 'Hotel stay'),
        h('button', { 'aria-pressed': String(!hotel), onclick: () => { d.type = 'day'; save(); render(); } }, 'Day Club')),
      h('div', { class: 'card rows' },
        row('bookings', hotel ? 'Dates' : 'Date', datesText, () => pickDates(hotel)),
        hotel && row('hotel-stay', 'Room / Suite', '[Suite name]', null, h('div', { class: 'shot' }, '[Photo: the suite]')),
        row('dog', 'Which dogs', chosen.length ? chosen.map(dogName).join(', ') : '[Dog names]', pickDogs),
        row('add', 'Add services', d.services ? d.services : '[Bath, grooming, enrichment]', pickServices)),
      h('div', { class: 'spacer' }),
      note,
      h('button', { class: 'btn leons-btn leons-btn--primary', disabled: !ready, onclick: submitBooking }, 'Continue'));
  }
  function pickDates(hotel) {
    const d = S.draft;
    openSheet(hotel ? 'Dates' : 'Date', [
      field(hotel ? 'Check-in' : 'Date', h('input', { type: 'date', name: 'in', value: d.checkin, required: true })),
      hotel && field('Check-out', h('input', { type: 'date', name: 'out', value: d.checkout, required: true })),
    ], (f) => {
      const a = f.get('in'), b = hotel ? f.get('out') : '';
      if (!a) return 'Choose a date.';
      if (hotel && (!b || b <= a)) return 'Check-out needs to be after check-in.';
      d.checkin = a; d.checkout = b; save();
    });
  }
  function pickDogs() {
    const d = S.draft; const real = S.dogs.filter((x) => !x.sample);
    openSheet('Which dogs', real.length ? real.map((x) => h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'dog', value: x.id, checked: d.dogIds.includes(x.id) }), dogName(x))) : h('p', { class: 'sub' }, 'Add a dog first, from My dogs.'),
      (f) => { d.dogIds = f.getAll('dog'); save(); });
  }
  function pickServices() {
    const d = S.draft;
    openSheet('Add services', field('Anything you’d like to add', h('textarea', { name: 'services' }, d.services)), (f) => { d.services = String(f.get('services')).trim(); save(); });
  }
  function submitBooking() {
    const d = S.draft;
    const b = { id: uid(), type: d.type, checkin: d.checkin, checkout: d.checkout, dogs: S.dogs.filter((x) => d.dogIds.includes(x.id) && !x.sample).map(dogName), services: d.services, status: 'requested', at: new Date().toISOString() };
    S.bookings.unshift(b);
    S.draft = { type: d.type, checkin: '', checkout: '', dogIds: [], services: '' };
    save(); location.hash = `#/booked/${b.id}`;
  }
  const summary = (b) => [b.type === 'hotel' ? 'Hotel stay' : 'Day Club', b.type === 'hotel' ? `${day(b.checkin)} – ${day(b.checkout)}` : day(b.checkin), b.dogs.join(', ')];

  function booked(id) {
    const b = S.bookings.find((x) => x.id === id);
    if (!b) return bookings();
    return h('div', { class: 'screen' },
      h('div', { class: 'done on-ink' }, h('span', { class: 'label' }, 'Booking'), h('h1', {}, 'Request received'), h('p', {}, 'We’ll confirm within [TIME].'),
        h('div', { class: 'facts' }, summary(b).map((t) => h('span', { class: 'label' }, t)))),
      h('div', { class: 'spacer' }),
      h('a', { class: 'btn leons-btn leons-btn--primary', href: '#/bookings' }, 'View bookings'),
      h('a', { class: 'btn leons-btn leons-btn--secondary', href: '#/home' }, 'Back home'));
  }
  function bookings() {
    return h('div', { class: 'screen' }, h('h1', { class: 'title' }, 'Bookings'),
      S.bookings.length ? h('div', { class: 'dogs' }, S.bookings.map((b) => h('div', { class: 'card booking' },
        h('span', { class: 'label label--cognac' }, `${b.status} · ${summary(b)[0]}`), h('h3', {}, summary(b)[1]), h('p', { class: 'sub' }, summary(b)[2] + (b.services ? ` · ${b.services}` : '')), h('p', { class: 'note' }, 'We’ll confirm within [TIME].'))))
        : h('div', { class: 'card empty' }, h('h2', {}, 'Nothing booked yet'), h('p', { class: 'sub' }, 'Your dog is on the list — pick a date.'), h('a', { class: 'btn leons-btn leons-btn--primary', href: '#/book/hotel' }, 'Book a stay')));
  }

  // ---------- router ----------
  const TAB = { home: 'home', bookings: 'bookings', booked: 'bookings', book: 'home', dogs: 'dogs', dog: 'dogs', messages: 'messages', account: 'account' };
  function render() {
    const [r = 'home', arg] = location.hash.replace(/^#\/?/, '').split('/');
    const view = {
      home, dogs, bookings,
      book: () => book(arg), booked: () => booked(arg),
      dog: () => comingNext('Dog profile', 'Profile and care instructions come in the next build.'),
      messages: () => comingNext('Messages', 'Two-way messages with Leon come in the next build.'),
      account: () => comingNext('Account', 'Account and payments come in the next build.'),
    }[r] || home;
    $('#screen').replaceChildren(view());
    document.querySelectorAll('.tabs a').forEach((a) => (a.dataset.tab === TAB[r] ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const t = { home: 'LEON’S', dogs: 'My dogs · LEON’S', book: 'Book a stay · LEON’S', bookings: 'Bookings · LEON’S', booked: 'Request received · LEON’S' }[r];
    document.title = t || 'LEON’S';
  }
  addEventListener('hashchange', () => { render(); scrollTo(0, 0); $('#screen').focus({ preventScroll: true }); });
  render();
})();
