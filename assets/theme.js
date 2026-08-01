/* Ortak tema anahtarı — her sayfada sağ üstteki düğmeyi çalıştırır. */
(function () {
  'use strict';

  var KEY = 'tby.theme';
  var root = document.documentElement;

  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (err) { /* özel mod */ }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeBtn');
    if (!btn) return;
    var dark = theme === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('title', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
    btn.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
    var ico = btn.querySelector('.ico');
    var lbl = btn.querySelector('.lbl');
    if (ico) ico.textContent = dark ? '☀' : '☾';
    if (lbl) lbl.textContent = dark ? 'Açık' : 'Koyu';
  }

  function init() {
    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        store(next);
      });
    }

    /* Kullanıcı elle seçmediyse sistem tercihini izlemeyi sürdür. */
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch (err) { /* yok say */ }
        if (!saved) apply(e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
