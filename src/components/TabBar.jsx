import { useLayoutEffect, useRef, useState } from 'react';
import { HomeIcon, InsightsIcon, AddIcon, HistoryIcon, ProfileIcon } from './Icons';

export default function TabBar({ current, onNavigate, onAdd }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [pillStyle, setPillStyle] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const btn = tabRefs.current[current];
      const container = containerRef.current;
      if (!btn || !container) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const inset = 9;
      setPillStyle({
        width: btnRect.width - inset * 2,
        transform: `translateX(${btnRect.left - containerRect.left + inset}px)`,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [current]);

  const setTabRef = (id) => (el) => {
    tabRefs.current[id] = el;
  };

  return (
    <div className="tabbar" ref={containerRef}>
      {pillStyle && <div className="tab-pill" style={pillStyle} />}
      <button ref={setTabRef('home')} className={`tab ${current === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
        <HomeIcon active={current === 'home'} />
        <span>Home</span>
      </button>
      <button ref={setTabRef('insights')} className={`tab ${current === 'insights' ? 'active' : ''}`} onClick={() => onNavigate('insights')}>
        <InsightsIcon active={current === 'insights'} />
        <span>Insights</span>
      </button>
      <button className="tab" onClick={onAdd}>
        <AddIcon />
        <span style={{ color: 'var(--blue)' }}>Add</span>
      </button>
      <button ref={setTabRef('history')} className={`tab ${current === 'history' ? 'active' : ''}`} onClick={() => onNavigate('history')}>
        <HistoryIcon active={current === 'history'} />
        <span>History</span>
      </button>
      <button ref={setTabRef('profile')} className={`tab ${current === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>
        <ProfileIcon active={current === 'profile'} />
        <span>Profile</span>
      </button>
    </div>
  );
}
