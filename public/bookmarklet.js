(function () {
  'use strict';

  const PAC_API = (window.__PAC_API_BASE__ || 'http://localhost:3000').replace(/\/$/, '');
  const TOKEN_KEY = 'pac:smart-fill:token';

  function toast(message, type) {
    const existing = document.getElementById('pac-toast');
    if (existing) existing.remove();
    const root = document.createElement('div');
    root.id = 'pac-toast';
    root.style.cssText = [
      'position:fixed', 'top:16px', 'right:16px', 'z-index:2147483647',
      'max-width:360px', 'padding:14px 18px',
      'background:' + (type === 'error' ? '#fef2f2' : type === 'warn' ? '#fffbeb' : '#ecfdf5'),
      'color:#0b1d2e',
      'border:1px solid ' + (type === 'error' ? '#fecaca' : type === 'warn' ? '#fde68a' : '#a7f3d0'),
      'border-radius:12px',
      'box-shadow:0 8px 24px rgba(15,23,42,0.18)',
      'font:13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif',
      'white-space:pre-line'
    ].join(';');
    root.textContent = message;
    document.body.appendChild(root);
    setTimeout(() => { try { root.remove(); } catch (_) {} }, 8000);
  }

  function getToken() {
    try {
      const fromHash = new URL(location.href).hash.match(/pac-token=([^&]+)/);
      if (fromHash && fromHash[1]) {
        const t = decodeURIComponent(fromHash[1]);
        localStorage.setItem(TOKEN_KEY, t);
        return t;
      }
    } catch (_) {}
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; }
  }

  function setNativeValue(el, value) {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
      : el.tagName === 'SELECT' ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) { desc.set.call(el, value); } else { el.value = value; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function findElement(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) {
          return { el: el, selector: sel };
        }
      } catch (_) {}
    }
    return null;
  }

  function snippetAround(label) {
    const candidates = Array.from(document.querySelectorAll('input, textarea, select'))
      .filter(el => {
        const t = (el.getAttribute('name') || '') + ' ' + (el.id || '') + ' '
          + (el.getAttribute('aria-label') || '') + ' '
          + (el.getAttribute('placeholder') || '');
        return t.toLowerCase().includes(label.toLowerCase().slice(0, 6));
      })
      .slice(0, 6);
    const parts = candidates.map(el => el.outerHTML.slice(0, 1200));
    return parts.join('\n') || document.body.innerHTML.slice(0, 6000);
  }

  async function askMapper(token, docId, field, attempted) {
    try {
      const res = await fetch(PAC_API + '/api/portal-mapper', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          docId: docId,
          profileKey: field.profileKey,
          label: field.label,
          htmlSnippet: snippetAround(field.label),
          attemptedSelectors: attempted
        })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.selector || null;
    } catch (_) { return null; }
  }

  function applyTransform(raw, transform) {
    if (!raw || !transform) return raw;
    if (transform === 'de-date') {
      const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return m ? m[3] + '.' + m[2] + '.' + m[1] : raw;
    }
    if (transform === 'iban-no-spaces') return String(raw).replace(/\s+/g, '');
    if (transform === 'upper') return String(raw).toUpperCase();
    if (transform === 'digits-only') return String(raw).replace(/\D+/g, '');
    return raw;
  }

  async function fillFields(token, recipe, profile) {
    let filled = 0;
    let missingRequired = 0;
    let aiAssisted = 0;
    const missingLabels = [];

    for (const field of recipe.fields) {
      const value = applyTransform(profile[field.profileKey] || '', field.transform);
      if (!value) {
        if (!field.optional) missingRequired++;
        continue;
      }
      let found = findElement(field.selectors);
      if (!found) {
        const aiSelector = await askMapper(token, recipe.docId, field, field.selectors);
        if (aiSelector) {
          found = findElement([aiSelector]);
          if (found) aiAssisted++;
        }
      }
      if (found) {
        try {
          setNativeValue(found.el, value);
          filled++;
        } catch (_) {}
      } else if (!field.optional) {
        missingLabels.push(field.label);
      }
    }
    return { filled, missingRequired, aiAssisted, missingLabels };
  }

  async function run() {
    const token = getToken();
    if (!token) {
      toast('PropAfterCare Smart Fill\nKein Token gefunden. Bitte zuerst auf der PropAfterCare-Detailseite den "Smart Pre-Fill aktivieren"-Button klicken.', 'warn');
      return;
    }
    try {
      const url = new URL(PAC_API + '/api/recipes/match');
      url.searchParams.set('host', location.hostname);
      url.searchParams.set('path', location.pathname);
      url.searchParams.set('token', token);
      const res = await fetch(url.toString(), { mode: 'cors' });
      if (res.status === 401) {
        toast('PropAfterCare Smart Fill\nDein Smart-Fill-Token ist abgelaufen. Komm zurück zur App und klick erneut "Smart Pre-Fill aktivieren".', 'warn');
        try { localStorage.removeItem(TOKEN_KEY); } catch (_) {}
        return;
      }
      if (res.status === 404) {
        toast('PropAfterCare Smart Fill\nFür diese Seite (' + location.hostname + ') ist noch kein Recipe hinterlegt. Wir nehmen es als Mitkurations-Vorschlag auf.', 'warn');
        return;
      }
      if (!res.ok) {
        toast('PropAfterCare Smart Fill\nKonnte das Recipe nicht laden (HTTP ' + res.status + ').', 'error');
        return;
      }
      const data = await res.json();
      const result = await fillFields(token, data.recipe, data.profile);
      const parts = [
        '✓ PropAfterCare Smart Fill',
        result.filled + ' Felder ausgefüllt' + (result.aiAssisted ? ' (' + result.aiAssisted + ' per KI ergänzt)' : ''),
        result.missingLabels.length ? 'Manuell prüfen: ' + result.missingLabels.join(', ') : '',
        'Bitte prüfe alle Werte und sende dann selbst ab.'
      ].filter(Boolean);
      toast(parts.join('\n'), result.missingRequired ? 'warn' : 'ok');
    } catch (err) {
      toast('PropAfterCare Smart Fill\nFehler beim Laden: ' + (err && err.message ? err.message : 'unbekannt'), 'error');
    }
  }

  run();
})();
