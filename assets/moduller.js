/* Modül arşivi: gezinme, arama, aç/kapa ve mobil menü. */
(function () {
  'use strict';

  var $ = function (sel) { return document.querySelector(sel); };
  var all = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function el(tag, cls, txt) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt != null) node.textContent = txt;
    return node;
  }

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('tby.' + k); return v === null ? d : v; }
      catch (err) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('tby.' + k, v); } catch (err) { /* özel mod */ }
    }
  };

  /* -------------------------------------------------- Türkçe duyarsız arama */
  var TR = {
    'ı': 'i', 'İ': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u',
    'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c', 'â': 'a', 'Â': 'a', 'î': 'i', 'Î': 'i',
    'û': 'u', 'Û': 'u'
  };
  function fold(s) {
    return s.replace(/[ıİşŞğĞüÜöÖçÇâÂîÎûÛ]/g, function (c) { return TR[c] || c; }).toLowerCase();
  }

  /* -------------------------------------------------------------- dizin */
  var VIEWS = all('.view');
  var INDEX = [];

  all('.view.module').forEach(function (view) {
    var mod = {
      id: view.id,
      title: view.getAttribute('data-title'),
      badge: view.getAttribute('data-badge'),
      group: view.getAttribute('data-group')
    };
    all('.sec', view).forEach(function (sec) {
      var timeNode = sec.querySelector('.time');
      var time = timeNode ? timeNode.textContent.trim() : '';
      var head = sec.querySelector('h3').textContent;
      var items = all('li', sec).map(function (li) { return li.textContent; });
      INDEX.push({
        mod: mod, secId: sec.id, time: time === '—' ? '' : time,
        head: head, items: items,
        fhead: fold(head), fitems: items.map(fold)
      });
    });
  });

  var footStat = $('#footStat');
  if (footStat) {
    var totalItems = INDEX.reduce(function (a, s) { return a + s.items.length; }, 0);
    footStat.textContent = all('.view.module').length + ' modül · ' +
      INDEX.length + ' bölüm · ' + totalItems + ' madde';
  }

  /* ------------------------------------------------------ görünüm değiştirme */
  function setActive(id) {
    var found = false;
    VIEWS.forEach(function (view) {
      var on = view.id === id;
      if (on) found = true;
      view.classList.toggle('active', on);
    });
    if (!found) { $('#home').classList.add('active'); id = 'home'; }

    all('.nav-item').forEach(function (a) {
      a.setAttribute('aria-current', a.getAttribute('data-view') === id ? 'true' : 'false');
    });

    var view = document.getElementById(id);
    var h2 = view && view.querySelector('h2');
    var title = id === 'results' ? 'Arama sonuçları' : (h2 ? h2.textContent : 'Genel Bakış');
    document.title = title + ' — Travma Bilgili Yoga Eğitim Arşivi';
    return id;
  }

  function open(id, secId) {
    if (!document.getElementById(id)) id = 'home';
    setActive(id);
    if (id !== 'results') store.set('last', id);

    if (secId) {
      var target = document.getElementById(secId);
      if (target) {
        if (!target.hasAttribute('open')) target.setAttribute('open', '');
        target.scrollIntoView({ block: 'start' });
        target.classList.add('hit');
        setTimeout(function () { target.classList.remove('hit'); }, 2400);
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  /* "#m03-7" gibi bölüm bağlantılarını ilgili modül görünümüne çevirir */
  function openTarget(hash) {
    if (!hash) return false;
    var node = document.getElementById(hash);
    if (!node) return false;
    if (node.classList.contains('view')) { open(hash); return true; }
    var view = node;
    while (view && !view.classList.contains('view')) view = view.parentNode;
    if (view && view.id) { open(view.id, hash); return true; }
    return false;
  }

  all('a[data-view]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      ev.preventDefault();
      var id = link.getAttribute('data-view');
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      else location.hash = id;
      clearSearch();
      open(id);
      closeNav();
    });
  });

  window.addEventListener('hashchange', function () {
    openTarget(location.hash.slice(1));
  });

  /* ------------------------------------------------ tümünü daralt / genişlet */
  all('.collapse-all').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var view = btn.closest('.view');
      if (!view) return;
      var collapse = btn.getAttribute('data-state') !== 'closed';
      all('.sec', view).forEach(function (sec) {
        if (collapse) sec.removeAttribute('open');
        else sec.setAttribute('open', '');
      });
      btn.setAttribute('data-state', collapse ? 'closed' : 'open');
      btn.textContent = collapse ? 'Tümünü genişlet' : 'Tümünü daralt';
    });
  });

  /* ------------------------------------------------------------------ arama */
  function highlight(text, terms) {
    var folded = fold(text);
    var ranges = [];
    terms.forEach(function (term) {
      var i = folded.indexOf(term);
      while (i !== -1 && term) {
        ranges.push([i, i + term.length]);
        i = folded.indexOf(term, i + term.length);
      }
    });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    ranges.forEach(function (r) {
      if (r[0] < pos) return;
      out += esc(text.slice(pos, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(text.slice(pos));
  }

  var results = $('#results');

  function renderSearch(query) {
    var terms = fold(query).split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) { clearSearch(true); open(store.get('last', 'home')); return; }

    var hits = [];
    INDEX.forEach(function (s) {
      var inHead = terms.every(function (t) { return s.fhead.indexOf(t) !== -1; });
      var inBody = terms.every(function (t) {
        return s.fitems.some(function (b) { return b.indexOf(t) !== -1; });
      });
      if (!inHead && !inBody) return;

      var lines = [];
      s.fitems.forEach(function (b, i) {
        if (lines.length < 3 && terms.some(function (t) { return b.indexOf(t) !== -1; })) {
          lines.push(i);
        }
      });
      hits.push({ s: s, lines: lines, score: inHead ? 0 : 1 });
    });
    hits.sort(function (a, b) { return a.score - b.score; });

    results.innerHTML = '';
    var head = el('div', 'results-head');
    head.appendChild(el('h2', null, hits.length ? hits.length + ' sonuç bulundu' : 'Sonuç bulunamadı'));
    head.appendChild(el('p', null, '“' + query.trim() + '” için tüm modüllerde arandı.'));

    var LIMIT = 120;
    if (hits.length > LIMIT) {
      head.appendChild(el('p', null, 'İlk ' + LIMIT + ' sonuç listeleniyor — aramayı daraltmayı deneyin.'));
    }
    results.appendChild(head);

    if (!hits.length) {
      var empty = el('div', 'empty-state');
      empty.appendChild(el('div', 'big', '🔍'));
      empty.appendChild(el('div', null, 'Farklı bir sözcük deneyin.'));
      results.appendChild(empty);
    }

    hits.slice(0, LIMIT).forEach(function (hit) {
      var s = hit.s;
      var row = el('a', 'result');
      row.href = '#' + s.secId;
      row.appendChild(el('div', 'crumb',
        s.mod.group === 'ana' ? s.mod.title : s.mod.badge + ' · ' + s.mod.title));

      var h = el('h3');
      h.innerHTML = (s.time ? '<span class="time">' + esc(s.time) + '</span>' : '') +
        '<span>' + highlight(s.head, terms) + '</span>';
      row.appendChild(h);

      (hit.lines.length ? hit.lines : [0]).forEach(function (i) {
        if (!s.items[i]) return;
        var p = el('p');
        p.innerHTML = highlight(s.items[i], terms);
        row.appendChild(p);
      });

      row.addEventListener('click', function (ev) {
        ev.preventDefault();
        clearSearch();
        open(s.mod.id, s.secId);
      });
      results.appendChild(row);
    });

    results.hidden = false;
    setActive('results');
    window.scrollTo(0, 0);
  }

  function clearSearch(keepValue) {
    if (!keepValue) $('#q').value = '';
    $('#searchBox').classList.remove('has-value');
    results.hidden = true;
    results.innerHTML = '';
  }

  var timer;
  $('#q').addEventListener('input', function (ev) {
    var value = ev.target.value;
    $('#searchBox').classList.toggle('has-value', value.length > 0);
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (value.trim()) renderSearch(value);
      else { clearSearch(true); open(store.get('last', 'home')); }
    }, 130);
  });

  $('#clearBtn').addEventListener('click', function () {
    clearSearch();
    open(store.get('last', 'home'));
    $('#q').focus();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === '/' && document.activeElement !== $('#q')) {
      ev.preventDefault();
      $('#q').focus();
      return;
    }
    if (ev.key === 'Escape') {
      if ($('#q').value) { clearSearch(); open(store.get('last', 'home')); }
      closeNav();
    }
  });

  /* ------------------------------------------------------------ mobil menü */
  function closeNav() {
    document.body.classList.remove('nav-open');
    var btn = $('#menuBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  var menuBtn = $('#menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open_ = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open_ ? 'true' : 'false');
    });
  }
  var scrim = $('#scrim');
  if (scrim) scrim.addEventListener('click', closeNav);

  var navClose = $('#navCloseBtn');
  if (navClose) navClose.addEventListener('click', closeNav);

  /* ---------------------------------------------------------------- başlat */
  clearSearch();
  if (!openTarget(location.hash.slice(1))) open(store.get('last', 'home'));
})();
