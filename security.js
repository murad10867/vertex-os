(() => {
  'use strict';

  const production = location.hostname.endsWith('github.io');

  if (production && location.protocol !== 'https:') {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
    return;
  }

  try {
    if (window.opener) window.opener = null;
  } catch {}

  const safeUrl = href => {
    try {
      const url = new URL(href, location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && !production);
    } catch {
      return false;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href]').forEach(link => {
      if (!safeUrl(link.getAttribute('href'))) {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        return;
      }

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });

    if (window.top !== window.self) {
      document.body.replaceChildren();
      const message = document.createElement('div');
      message.style.cssText = 'min-height:100vh;display:grid;place-items:center;background:#050913;color:white;font-family:Arial;padding:24px;text-align:center';
      message.textContent = 'افتح Vertex OS مباشرةً لحماية الصفحة من التضمين الخارجي.';
      document.body.appendChild(message);
    }
  });
})();