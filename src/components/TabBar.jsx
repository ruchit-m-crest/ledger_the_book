import { HomeIcon, InsightsIcon, AddIcon, HistoryIcon, ProfileIcon } from './Icons';

export default function TabBar({ current, onNavigate, onAdd }) {
  return (
    <div className="tabbar">
      <button className={`tab ${current === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
        <HomeIcon active={current === 'home'} />
        <span>Home</span>
      </button>
      <button className={`tab ${current === 'insights' ? 'active' : ''}`} onClick={() => onNavigate('insights')}>
        <InsightsIcon active={current === 'insights'} />
        <span>Insights</span>
      </button>
      <button className="tab" onClick={onAdd}>
        <AddIcon />
        <span style={{ color: 'var(--blue)' }}>Add</span>
      </button>
      <button className={`tab ${current === 'history' ? 'active' : ''}`} onClick={() => onNavigate('history')}>
        <HistoryIcon active={current === 'history'} />
        <span>History</span>
      </button>
      <button className={`tab ${current === 'profile' ? 'active' : ''}`} onClick={() => onNavigate('profile')}>
        <ProfileIcon active={current === 'profile'} />
        <span>Profile</span>
      </button>
    </div>
  );
}
