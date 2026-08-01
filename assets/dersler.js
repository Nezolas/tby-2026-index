/* Ders ve form indeksi: arama, açılır menüler ve iz şeridi davranışı.
   Sekmeler, tarih ve ⭐ filtresi saf CSS ile çalıştığı için burada yer almaz. */
(function () {
  'use strict';

  function norm(s) {
    s = (s || '').replace(/İ/g, 'I').replace(/I/g, 'i').replace(/ı/g, 'i').toLowerCase();
    return s.replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ö/g, 'o').replace(/ç/g, 'c');
  }

  var input = document.getElementById('q');
  var box = document.getElementById('searchBox');
  var clearBtn = document.getElementById('clearBtn');
  var stat = document.getElementById('searchStat');

  var cards = Array.prototype.slice.call(document.querySelectorAll('#v-lessons .card'));
  var idxRows = Array.prototype.slice.call(document.querySelectorAll('#idx .irow:not(.ihead)'));

  function runSearch() {
    var raw = input.value.trim();
    var query = norm(raw);

    if (box) box.classList.toggle('has-value', raw.length > 0);

    var visibleCards = 0;
    cards.forEach(function (card) {
      var cardHit = !query || (card.dataset.search || '').indexOf(query) !== -1;
      var anyRow = false;

      card.querySelectorAll('tbody tr').forEach(function (row) {
        var show = !query || cardHit || (row.dataset.search || '').indexOf(query) !== -1;
        row.classList.toggle('hidden', !show);
        if (show) anyRow = true;
      });

      var show = cardHit || anyRow;
      card.classList.toggle('hidden', !show);
      if (show) visibleCards++;
    });

    var visibleRows = 0;
    idxRows.forEach(function (row) {
      var show = !query || (row.dataset.search || '').indexOf(query) !== -1;
      row.classList.toggle('hidden', !show);
      if (show) visibleRows++;
    });

    if (stat) {
      stat.textContent = query
        ? visibleCards + ' ders · ' + visibleRows + ' form eşleşti'
        : '';
    }
  }

  if (input) {
    input.addEventListener('input', runSearch);
    input.addEventListener('search', runSearch);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      input.value = '';
      runSearch();
      input.focus();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && input && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      return;
    }
    if (e.key === 'Escape') {
      if (input && input.value) { input.value = ''; runSearch(); }
      document.querySelectorAll('details.dd[open]').forEach(function (d) {
        d.removeAttribute('open');
      });
    }
  });

  /* İz şeridindeki bir kutuya tıklamak her zaman Dersler sekmesine götürür */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#ders-"]');
    if (!link) return;
    var tabLessons = document.getElementById('tab-lessons');
    if (tabLessons) tabLessons.checked = true;
  });

  /* Form İndeksi'ne geçerken adres çubuğunda kalan #ders-N çıpasını temizle:
     çıpa kalırsa geri dönüldüğünde yanlış derse atlanır. */
  var tabIndex = document.getElementById('tab-index');
  if (tabIndex) {
    tabIndex.addEventListener('change', function () {
      if (tabIndex.checked && location.hash && history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    });
  }

  /* Açılır menüler: dışarı tıklayınca da kapansın */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.dd[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  /* Bir seçenek işaretlenince menü kapansın (inline onchange yerine) */
  document.querySelectorAll('.dd-menu input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var dd = radio.closest('details');
      if (dd) dd.removeAttribute('open');
    });
  });

  /* Yan şeritte okunmakta olan dersi vurgula */
  if ('IntersectionObserver' in window) {
    var railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var no = entry.target.id.replace('ders-', '');
        railLinks.forEach(function (a) { a.classList.toggle('here', a.dataset.no === no); });
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    cards.forEach(function (card) { spy.observe(card); });
  }

  runSearch();
})();
