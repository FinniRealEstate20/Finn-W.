'use client';

import { useEffect } from 'react';

export function PromoVideo() {
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return;
      if ((e.data as { type?: string }).type === 'propaftercare:cta') {
        const target = document.getElementById('demo');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.location.hash = '#demo';
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-card">
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          src="/promo.html"
          title="PropAfterCare Werbeanimation"
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
