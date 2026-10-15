import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { ServerBuilder } from './components/ServerBuilder';
import { useSetupStore } from './store/useSetupStore';

function App() {
  const { guildId, roles, categories, logChannelId, builderEnabled } = useSetupStore();
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!guildId.trim()) {
      setStatus({
        type: 'error',
        message: 'Masukkan Guild ID target terlebih dahulu.'
      });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Mengirim payload ke backend...' });

    try {
      const response = await fetch('http://localhost:5000/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-log-channel-id': logChannelId || ''
        },
        body: JSON.stringify({
          guildId,
          builderEnabled,
          roles: builderEnabled ? roles : [],
          categories: builderEnabled ? categories : [],
          logChannelId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Setup gagal.');
      }

      setStatus({ type: 'success', message: result.message });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Terjadi error saat mengirim request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Discord automation suite</p>
          <h1>Discord Auto Setup Server Builder</h1>
        </div>
        <div className="topbar-badge">
          <Sparkles size={16} />
          Zero DB / Direct Bot Execution
        </div>
      </header>

      <main className="layout full-width">
        <ServerBuilder onExecute={handleExecute} loading={loading} status={status} />
      </main>

      <footer className="summary-bar">
        <div className="summary-item">
          <span>Guild ID</span>
          <strong>{guildId || 'Belum diisi'}</strong>
        </div>
        <div className="summary-item">
          <span>Roles Builder</span>
          <strong>{roles.length}</strong>
        </div>
        <div className="summary-item">
          <span>Categories Builder</span>
          <strong>{categories.length}</strong>
        </div>
      </footer>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.type === 'success' && <CheckCircle2 size={18} />}
          {status.type === 'error' && <AlertTriangle size={18} />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
