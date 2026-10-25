/* Original typographic illustrations. Replace with commissioned photography when available. */
(function () {
  'use strict';
  window.MiidearStudy = function (theme, variation) {
    var themes = ['sage', 'rose', 'ink', 'gold'];
    if (themes.indexOf(theme) < 0) theme = 'sage';
    var titles = {sage: 'Aurelia', rose: 'Maison Blanc', ink: 'Quiet Lines', gold: 'Golden Hour'};
    return '<div class="study study--' + theme + ' study--v' + ((variation || 0) % 3) + '" aria-hidden="true"><div class="study__envelope"></div><div class="study__paper"><span class="study__monogram">m</span><span class="study__small">An invitation to celebrate</span><span class="study__name">' + titles[theme] + '</span><span class="study__line"></span><span class="study__small">With love, always</span></div><span class="study__seal">m</span></div>';
  };
})();
