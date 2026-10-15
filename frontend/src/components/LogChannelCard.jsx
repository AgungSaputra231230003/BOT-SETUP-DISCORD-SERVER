import { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useSetupStore } from '../store/useSetupStore';

export function LogChannelCard() {
  const {
    guildId,
    logChannelId,
    availableTextChannels,
    setLogChannelId,
    saveLogChannelSettings,
    testLogChannel
  } = useSetupStore();

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [customIdMode, setCustomIdMode] = useState(false);

  const handleSave = async (channelIdToSave) => {
    const targetId = channelIdToSave !== undefined ? channelIdToSave : logChannelId;
    setSaving(true);
    setFeedback(null);

    const res = await saveLogChannelSettings(guildId, targetId);
    setSaving(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleTest = async () => {
    if (!logChannelId) {
      setFeedback({ type: 'error', text: 'Pilih atau masukkan channel log terlebih dahulu.' });
      return;
    }

    setTesting(true);
    setFeedback(null);

    const res = await testLogChannel(guildId, logChannelId);
    setTesting(false);

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleChannelSelectChange = (e) => {
    const val = e.target.value;
    setLogChannelId(val);
    handleSave(val);
  };

  const activeChannelObj = availableTextChannels.find((c) => c.id === logChannelId);

  return (
    <div className="log-channel-card">
      <div className="log-card-header">
        <div className="log-title-area">
          <div className="log-icon-badge">
            <Bell size={18} />
          </div>
          <div>
            <div className="title-with-pill">
              <h4>Discord Log Channel</h4>
              <span className="optional-tag">Opsional</span>
              {logChannelId ? (
                <span className="log-status-pill active">
                  <ShieldCheck size={12} style={{ marginRight: 4 }} />
                  Aktif {activeChannelObj ? `(#${activeChannelObj.name})` : ''}
                </span>
              ) : (
                <span className="log-status-pill inactive">Nonaktif (Tanpa Log)</span>
              )}
            </div>
            <p className="log-description">
              Bot akan otomatis mengirim pesan notifikasi ke channel ini saat Anda menghapus atau mengedit role, channel, category, atau melakukan bulk delete. Jika tidak diisi, bot tidak akan mengirim notifikasi.
            </p>
          </div>
        </div>
      </div>

      <div className="log-card-body">
        <div className="log-control-row">
          {!customIdMode ? (
            <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
              <select
                value={logChannelId}
                onChange={handleChannelSelectChange}
                disabled={saving}
              >
                <option value="">(Nonaktifkan / Tanpa Channel Log)</option>
                {availableTextChannels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name} — {ch.categoryName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Masukkan Channel ID Discord..."
                value={logChannelId}
                onChange={(e) => setLogChannelId(e.target.value)}
                disabled={saving}
              />
            </div>
          )}

          <button
            type="button"
            className="ghost-button"
            onClick={() => setCustomIdMode(!customIdMode)}
            title="Ganti antara daftar channel atau input ID manual"
            style={{ fontSize: '0.8rem' }}
          >
            {customIdMode ? 'Pilih dari List' : 'Input ID Manual'}
          </button>

          {customIdMode && (
            <button
              type="button"
              className="primary-button"
              onClick={() => handleSave()}
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan ID'}
            </button>
          )}

          <button
            type="button"
            className="test-log-button"
            onClick={handleTest}
            disabled={testing || !logChannelId}
            title="Kirim pesan test embed ke channel terpilih"
          >
            <Send size={14} style={{ marginRight: 6 }} />
            {testing ? 'Mengirim Test...' : 'Test Log'}
          </button>
        </div>

        {feedback && (
          <div className={`status-message ${feedback.type}`} style={{ marginTop: 12, padding: '8px 12px' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span style={{ fontSize: '0.84rem' }}>{feedback.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
