'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Loads YouTube's IFrame Player API once and shares it.
let loading: Promise<any> | null = null;

export function loadYT(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as any;
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(w.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { loading = null; reject(new Error('YouTube blocked')); };
    document.head.appendChild(s);
  });
  return loading;
}
