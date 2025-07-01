"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export default function FacebookPixel() {
  useEffect(() => {
    fetch('/api/main/integration')
      .then(res => res.json())
      .then(data => {
        const pixelId = data.integration?.facebookPixelId || null;
        if (pixelId && typeof window !== 'undefined' && !window.fbq) {
          (function(f: any, b: any, e: any, v: any) {
            if (f.fbq) return;
            const n = function(this: any) {
              (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
            };
            (n as any).push = n;
            (n as any).loaded = !0;
            (n as any).version = '2.0';
            (n as any).queue = [];
            f.fbq = n;
            const t = b.createElement(e);
            t.async = !0;
            t.src = v;
            const s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          if (typeof window.fbq === 'function') {
            (window.fbq as (...args: any[]) => void)('init', pixelId);
            (window.fbq as (...args: any[]) => void)('track', 'PageView');
          }
        }
      });
  }, []);
  return null;
} 