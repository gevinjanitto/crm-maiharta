import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export const BarongMascot = () => {
  const rig = useRef(null);
  const enabled = !useReducedMotionPreference();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const headX = useSpring(mx, { stiffness: 72, damping: 15, mass: 1.2 });
  const headY = useSpring(my, { stiffness: 68, damping: 16, mass: 1.2 });
  const eyeX = useSpring(mx, { stiffness: 260, damping: 22 });
  const eyeY = useSpring(my, { stiffness: 260, damping: 22 });
  const rotateY = useTransform(headX, [-1, 1], [-9, 9]);
  const rotateX = useTransform(headY, [-1, 1], [5, -5]);
  const rotateZ = useTransform(headX, [-1, 1], [-1.8, 1.8]);
  const x = useTransform(headX, [-1, 1], ['-1.2%', '1.2%']);
  const gazeX = useTransform(eyeX, [-1, 1], ['-10%', '10%']);
  const gazeY = useTransform(eyeY, [-1, 1], ['-8%', '8%']);

  useEffect(() => {
    let resetTimer;
    const reset = () => { mx.set(0); my.set(0); };
    reset();
    if (!enabled) { headX.jump(0); headY.jump(0); eyeX.jump(0); eyeY.jump(0); return; }
    const follow = event => {
      if (!rig.current || document.hidden) return;
      clearTimeout(resetTimer);
      const rect = rig.current.getBoundingClientRect();
      const clamp = n => Math.max(-1, Math.min(1, n));
      mx.set(clamp((event.clientX - rect.left - rect.width / 2) / Math.max(rect.width, 200)));
      my.set(clamp((event.clientY - rect.top - rect.height * .53) / Math.max(rect.height * .6, 180)));
      if (event.pointerType === 'touch') resetTimer = setTimeout(reset, 1400);
    };
    window.addEventListener('pointermove', follow, { passive: true });
    window.addEventListener('pointerdown', follow, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('pointerleave', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      clearTimeout(resetTimer);
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('pointerdown', follow);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [enabled, mx, my, headX, headY, eyeX, eyeY]);

  return <div className="barong-mascot-stage" data-testid="barong-mascot-stage">
    <div className="barong-backdrop" data-testid="barong-backdrop" aria-hidden="true" />
    <div className={`barong-breath ${enabled ? 'is-alive' : ''}`}>
      <motion.div ref={rig} className="barong-rig" data-testid="barong-rig"
        style={{ rotateY, rotateX, rotateZ, x }}>
        <img src="/assets/barong-gaze-base.webp" className="barong-restored" data-testid="barong-image"
          alt="Barong biru MaiHarta dengan mahkota utuh" draggable="false" fetchPriority="high" />
        {['left', 'right'].map(side => <div className={`barong-eye eye-${side}`} key={side} aria-hidden="true">
          <motion.img src={`/assets/barong-eye-${side}.webp`} alt="" draggable="false"
            data-testid={`barong-pupil-${side}`} style={{ x: gazeX, y: gazeY }} />
        </div>)}
      </motion.div>
    </div>
  </div>;
};