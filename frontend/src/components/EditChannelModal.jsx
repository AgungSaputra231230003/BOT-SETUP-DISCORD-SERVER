import { useState } from 'react';
import { X, Check, AlertTriangle, Hash, Volume2, Shield, Layers } from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function EditChannelModal({ channel, categories = [], onClose, onSave }) {
  const [name, setName] = useState(channel?.name || '');
  const [topic, setTopic] = useState(channel?.topic || '');
  const [parentId, setParentId] = useState(channel?.parentId || '');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'permissions'
  const [permissions, setPermissions] = useState(
    Array.isArray(channel?.permissions) ? [...channel.permissions] : []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!channel) return null;

  const isVoice = channel.type === 'voice';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama channel tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await onSave(channel.id, {
        name: name.trim(),
        topic: isVoice ? undefined : topic.trim(),
        parentId: parentId || null,
        permissions
      });

      if (result && !result.success) {
        throw new Error(result.message || 'Gagal mengubah channel.');
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan channel.');
    } finally {
      setIsSaving(false);
    }
  };

  const validCategories = categories.filter((c) => c.id !== 'uncategorized');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="channel-icon-pill">
              {isVoice ? <Volume2 size={18} /> : <Hash size={18} />}
            </div>
            <div>
              <h3>Edit Channel & Permissions</h3>
              <p className="modal-subtitle">
                Mengubah properti & hak izin channel <strong>#{channel.name}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
            padding: '0 24px',
            background: 'rgba(15, 23, 42, 0.4)'
          }}
        >
          <button
            type="button"
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 0, borderBottom: activeTab === 'general' ? '2px solid #a855f7' : '2px solid transparent' }}
          >
            <Layers size={15} />
            Pengaturan Umum
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 0, borderBottom: activeTab === 'permissions' ? '2px solid #a855f7' : '2px solid transparent' }}
          >
            <Shield size={15} />
            Permissions ({permissions.length})
          </button>
        </div>

        <div className="modal-body-scrollable">
          {errorMessage && (
            <div className="status-message error" style={{ marginBottom: 16 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="edit-channel-name">Nama Channel</label>
                <input
                  id="edit-channel-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="nama-channel"
                />
                {!isVoice && (
                  <small className="help-text">
                    Spasi pada nama text channel akan otomatis diubah menjadi tanda minus (-).
                  </small>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="edit-channel-category">Kategori Induk</label>
                <select
                  id="edit-channel-category"
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value)}
                >
                  <option value="">(Tanpa Kategori / Uncategorized)</option>
                  {validCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {!isVoice && (
                <div className="field-group">
                  <label htmlFor="edit-channel-topic">Deskripsi / Topic Channel (Opsional)</label>
                  <textarea
                    id="edit-channel-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topik pembahasan channel ini..."
                    rows={3}
                    style={{ minHeight: 80 }}
                  />
                </div>
              )}

              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving}
                >
                  <Check size={16} style={{ marginRight: 6 }} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div>
              <PermissionsSelector
                permissions={permissions}
                onChange={setPermissions}
                title={`Hak Izin Override #${channel.name}`}
                mode="channel"
              />

              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  <Check size={16} style={{ marginRight: 6 }} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan & Izin'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
