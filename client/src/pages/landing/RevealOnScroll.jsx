import { useRef, useState, useEffect } from 'react';

const VARIANTS = {
  up:    { h: 'translateY(44px)',                              v: 'translateY(0)' },
  down:  { h: 'translateY(-44px)',                             v: 'translateY(0)' },
  left:  { h: 'translateX(-72px)',                             v: 'translateX(0)' },
  right: { h: 'translateX(72px)',                              v: 'translateX(0)' },
  scale: { h: 'scale(0.86)',                                   v: 'scale(1)' },
  flip:  { h: 'perspective(900px) rotateX(-30deg) scale(0.96)', v: 'perspective(900px) rotateX(0deg) scale(1)' },
  'flip-right': { h: 'perspective(900px) rotateY(-24deg) translateX(-40px)', v: 'perspective(900px) rotateY(0deg) translateX(0)' },
  'flip-left':  { h: 'perspective(900px) rotateY(24deg) translateX(40px)',   v: 'perspective(900px) rotateY(0deg) translateX(0)' },
  zoom:  { h: 'scale(0.78) translateY(30px)',                  v: 'scale(1) translateY(0)' },
};

export default function RevealOnScroll({
  children,
  delay   = 0,
  className = '',
  variant = 'up',
  duration = 900,
}) {
  const r = useRef(null);
  const [vis, setVis] = useState(false);
  const vt = VARIANTS[variant] || VARIANTS.up;

  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={r}
      className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? vt.v : vt.h,
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${Math.round(duration * 1.04)}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: vis ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
