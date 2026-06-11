(function () {
  'use strict';

  const PAC_API = (window.__PAC_API_BASE__ || 'http://localhost:3000').replace(/\/$/, '');
  const TOKEN_KEY = 'pac:smart-fill:token';
  const SIDEPANEL_ID = 'pac-sidepanel';
  const HIGHLIGHT_RING_ID = 'pac-submit-ring';
  const KEYFRAMES_ID = 'pac-keyframes';

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

  const SENSITIVE_KEYS = new Set(['iban', 'steuerId']);
  function redactValue(profileKey, value) {
    if (!value || !SENSITIVE_KEYS.has(profileKey)) return value;
    const compact = String(value).replace(/\s+/g, '');
    if (compact.length <= 6) return '•••';
    return compact.slice(0, 4) + ' ••• ' + compact.slice(-2);
  }

  function injectKeyframes() {
    if (document.getElementById(KEYFRAMES_ID)) return;
    const style = document.createElement('style');
    style.id = KEYFRAMES_ID;
    style.textContent =
      '@keyframes pac-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); } ' +
      '50% { box-shadow: 0 0 0 12px rgba(16,185,129,0); } }' +
      '@keyframes pac-fade-out { from { outline-color: #10b981; } to { outline-color: transparent; } }';
    document.head.appendChild(style);
  }

  function flashOutline(el) {
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {}
    const prev = el.style.outline;
    const prevOffset = el.style.outlineOffset;
    el.style.outline = '3px solid #10b981';
    el.style.outlineOffset = '2px';
    el.style.transition = 'outline-color 1.6s ease-out';
    setTimeout(() => { el.style.outlineColor = 'transparent'; }, 400);
    setTimeout(() => {
      el.style.outline = prev;
      el.style.outlineOffset = prevOffset;
    }, 2200);
  }

  function findSubmitButton() {
    const directSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[name*="submit" i]',
      'button[id*="submit" i]',
      'button[class*="submit" i]'
    ];
    for (const sel of directSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el && isVisible(el)) return el;
      } catch (_) {}
    }
    const textCandidates = ['absenden', 'senden', 'übermitteln', 'anmelden', 'speichern', 'weiter', 'jetzt anmelden'];
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], a[role="button"]'));
    for (const btn of buttons) {
      const text = ((btn.textContent || btn.value || '') + '').toLowerCase().trim();
      if (!text) continue;
      if (textCandidates.some(c => text.includes(c)) && isVisible(btn)) return btn;
    }
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function highlightSubmitButton() {
    const existing = document.getElementById(HIGHLIGHT_RING_ID);
    if (existing) existing.remove();
    const btn = findSubmitButton();
    if (!btn) return null;
    injectKeyframes();
    const prevOutline = btn.style.outline;
    const prevOffset = btn.style.outlineOffset;
    const prevAnimation = btn.style.animation;
    btn.style.outline = '3px solid #10b981';
    btn.style.outlineOffset = '3px';
    btn.style.borderRadius = btn.style.borderRadius || '8px';
    btn.style.animation = 'pac-pulse 2s infinite';
    btn.setAttribute('data-pac-highlighted', '1');
    return btn;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function sourceBadge(source) {
    if (source === 'ai') return { label: 'KI', bg: '#f3e8ff', fg: '#6b21a8' };
    if (source === 'failed') return { label: 'Manuell', bg: '#fef3c7', fg: '#92400e' };
    return { label: 'Recipe', bg: '#d1fae5', fg: '#065f46' };
  }

  function renderSidepanel(audit, summary, hasSubmitHighlight) {
    const existing = document.getElementById(SIDEPANEL_ID);
    if (existing) existing.remove();

    injectKeyframes();
    const panel = document.createElement('div');
    panel.id = SIDEPANEL_ID;
    panel.style.cssText = [
      'position:fixed', 'top:16px', 'right:16px', 'bottom:16px', 'width:340px',
      'z-index:2147483646', 'display:flex', 'flex-direction:column',
      'background:#ffffff', 'border:1px solid #e2e8f0', 'border-radius:14px',
      'box-shadow:0 12px 36px rgba(15,23,42,0.18)',
      'font:13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif',
      'color:#0f172a', 'overflow:hidden'
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#ecfdf5;display:flex;align-items:center;gap:10px;';
    header.innerHTML =
      '<div style="font-weight:700;color:#065f46;flex:1;">PropAfterCare · Smart-Fill</div>' +
      '<button id="pac-sidepanel-close" type="button" aria-label="Schließen" style="background:transparent;border:0;font-size:20px;color:#065f46;cursor:pointer;padding:0 4px;">×</button>';

    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = 'padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;';
    const summaryParts = [];
    summaryParts.push('<strong>' + summary.filled + ' von ' + summary.total + '</strong> Feldern ausgefüllt');
    if (summary.aiAssisted) summaryParts.push(summary.aiAssisted + ' per KI');
    if (summary.missingRequired) summaryParts.push('<span style="color:#b45309;">' + summary.missingRequired + ' manuell</span>');
    summaryBox.innerHTML = summaryParts.join(' · ');

    const list = document.createElement('div');
    list.style.cssText = 'flex:1;overflow-y:auto;padding:6px 0;';
    if (audit.length === 0) {
      list.innerHTML = '<div style="padding:24px 16px;text-align:center;color:#64748b;font-size:12px;">Keine Felder ausgefüllt.</div>';
    } else {
      audit.forEach((entry, idx) => {
        const badge = sourceBadge(entry.source);
        const row = document.createElement('button');
        row.type = 'button';
        row.setAttribute('data-pac-entry', String(idx));
        row.style.cssText = 'width:100%;text-align:left;padding:10px 16px;background:transparent;border:0;border-bottom:1px solid #f1f5f9;cursor:pointer;display:block;font:inherit;color:inherit;';
        row.onmouseover = () => { row.style.background = '#f8fafc'; };
        row.onmouseout = () => { row.style.background = 'transparent'; };
        row.innerHTML =
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">' +
            '<span style="font-weight:600;font-size:12px;color:#0f172a;flex:1;">' + escapeHtml(entry.label) + '</span>' +
            '<span style="font-size:10px;padding:2px 6px;border-radius:8px;background:' + badge.bg + ';color:' + badge.fg + ';font-weight:600;">' + badge.label + '</span>' +
          '</div>' +
          '<div style="font-size:12px;color:#334155;word-break:break-word;">' + escapeHtml(entry.displayValue || entry.value || '—') + '</div>' +
          (entry.selector ? '<div style="font:10px/1.3 ui-monospace,Menlo,Consolas,monospace;color:#94a3b8;margin-top:2px;word-break:break-all;">' + escapeHtml(entry.selector) + '</div>' : '');
        list.appendChild(row);
      });
    }

    const footer = document.createElement('div');
    footer.id = 'pac-sidepanel-footer';
    footer.style.cssText = 'padding:12px 16px;border-top:1px solid #e2e8f0;background:#f0fdf4;font-size:12px;color:#065f46;';
    footer.innerHTML = hasSubmitHighlight
      ? '<strong>Drück DU den Absenden-Knopf</strong> — wir haben ihn grün umrandet. Quittung liegt danach in deinen <em>Meinen Formularen</em>.'
      : '<strong>Bitte prüfe alle Werte</strong> und drück den Absenden-Knopf selbst (meistens unten). Quittung liegt danach in <em>Meinen Formularen</em>.';

    panel.appendChild(header);
    panel.appendChild(summaryBox);
    panel.appendChild(list);
    panel.appendChild(footer);
    document.body.appendChild(panel);

    document.getElementById('pac-sidepanel-close').addEventListener('click', () => {
      panel.remove();
      const ring = document.querySelector('[data-pac-highlighted="1"]');
      if (ring) {
        ring.style.animation = '';
        ring.style.outline = '';
        ring.style.outlineOffset = '';
        ring.removeAttribute('data-pac-highlighted');
      }
    });

    list.querySelectorAll('[data-pac-entry]').forEach(row => {
      row.addEventListener('click', () => {
        const idx = Number(row.getAttribute('data-pac-entry'));
        const entry = audit[idx];
        if (entry && entry.element) flashOutline(entry.element);
      });
    });

    return panel;
  }

  function updateFooter(text) {
    const f = document.getElementById('pac-sidepanel-footer');
    if (!f) return;
    f.innerHTML = (f.innerHTML || '') + '<div style="margin-top:6px;font-size:11px;color:#0f5132;">' + text + '</div>';
  }

  async function fillFields(token, recipe, profile) {
    const audit = [];
    let filled = 0;
    let missingRequired = 0;
    let aiAssisted = 0;

    for (const field of recipe.fields) {
      const value = applyTransform(profile[field.profileKey] || '', field.transform);
      if (!value) {
        if (!field.optional) {
          missingRequired++;
          audit.push({
            label: field.label,
            profileKey: field.profileKey,
            value: '',
            displayValue: '(kein Profilwert)',
            selector: '',
            source: 'failed',
            occurredAt: new Date().toISOString(),
            element: null
          });
        }
        continue;
      }
      let found = findElement(field.selectors);
      let source = 'recipe';
      if (!found) {
        const aiSelector = await askMapper(token, recipe.docId, field, field.selectors);
        if (aiSelector) {
          found = findElement([aiSelector]);
          if (found) {
            aiAssisted++;
            source = 'ai';
          }
        }
      }
      if (found) {
        try {
          setNativeValue(found.el, value);
          filled++;
          audit.push({
            label: field.label,
            profileKey: field.profileKey,
            value: value,
            displayValue: redactValue(field.profileKey, value),
            selector: found.selector,
            source: source,
            occurredAt: new Date().toISOString(),
            element: found.el
          });
        } catch (_) {
          audit.push({
            label: field.label,
            profileKey: field.profileKey,
            value: '',
            displayValue: '(Schreib-Fehler)',
            selector: found.selector || '',
            source: 'failed',
            occurredAt: new Date().toISOString(),
            element: found.el
          });
          if (!field.optional) missingRequired++;
        }
      } else {
        audit.push({
          label: field.label,
          profileKey: field.profileKey,
          value: '',
          displayValue: '(Feld nicht gefunden)',
          selector: (field.selectors && field.selectors[0]) || '',
          source: 'failed',
          occurredAt: new Date().toISOString(),
          element: null
        });
        if (!field.optional) missingRequired++;
      }
    }

    return {
      audit,
      summary: {
        filled,
        missingRequired,
        aiAssisted,
        total: recipe.fields.length
      }
    };
  }

  async function sendFillReceipt(token, clientReceiptId, audit, summary) {
    if (!clientReceiptId) return false;
    const payload = audit.map(e => ({
      label: e.label,
      profileKey: e.profileKey,
      value: e.displayValue || e.value || '',
      selector: e.selector,
      source: e.source,
      occurredAt: e.occurredAt
    }));
    try {
      const res = await fetch(PAC_API + '/api/submissions/fill-receipt', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          clientReceiptId,
          fillAudit: payload,
          fillSummary: summary
        })
      });
      return res.ok;
    } catch (_) {
      return false;
    }
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
      const submitBtn = highlightSubmitButton();
      renderSidepanel(result.audit, result.summary, !!submitBtn);

      const clientReceiptId = data.clientReceiptId || '';
      const persisted = await sendFillReceipt(token, clientReceiptId, result.audit, result.summary);
      if (persisted) {
        updateFooter('✓ Quittung gespeichert · einsehbar in „Meine Formulare"');
      } else if (clientReceiptId) {
        updateFooter('⚠ Quittung konnte nicht gespeichert werden. Versuch es später erneut.');
      }
    } catch (err) {
      toast('PropAfterCare Smart Fill\nFehler beim Laden: ' + (err && err.message ? err.message : 'unbekannt'), 'error');
    }
  }

  run();
})();
