import { useState } from 'react';
import { X, Trash2, Hash, Volume2, Shield, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function BulkDeleteModal({
  categories = [],
  roles = [],
  textChannels = [],
  onClose,
  onBulkDeleteChannels,
  onBulkDeleteRoles,
  onBulkDeleteCategories,
  onPurgeMessages
}) {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'roles' | 'purge'
  const [selectedChannelIds, setSelectedChannelIds] = useState(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [selectedRoleIds, setSelectedRoleIds] = useState(new Set());

  // Purge state
  const [purgeChannelId, setPurgeChannelId] = useState(textChannels[0]?.id || '');
  const [purgeAmount, setPurgeAmount] = useState(25);

  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract all channels
  const allChannels = categories.flatMap((cat) => cat.channels || []);

  // Filter deletable roles (no @everyone, no managed)
  const deletableRoles = roles.filter((r) => !r.isEveryone && !r.managed);

  // Toggle channel selection
  const toggleChannel = (id) => {
    setSelectedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle category selection
  const toggleCategory = (cat) => {
    const isSelected = selectedCategoryIds.has(cat.id);
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (isSelected) next.delete(cat.id);
      else next.add(cat.id);
      return next;
    });

    // When selecting a category, auto-select its inner channels too
    if (!isSelected && cat.channels?.length) {
      setSelectedChannelIds((prev) => {
        const next = new Set(prev);
        cat.channels.forEach((ch) => next.add(ch.id));
        return next;
      });
    }
  };

  // Select all channels
  const handleSelectAllChannels = () => {
    setSelectedChannelIds(new Set(allChannels.map((c) => c.id)));
    setSelectedCategoryIds(new Set(categories.filter((c) => c.id !== 'uncategorized').map((c) => c.id)));
  };

  const handleClearChannels = () => {
    setSelectedChannelIds(new Set());
    setSelectedCategoryIds(new Set());
  };

  // Toggle role selection
  const toggleRole = (id) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllRoles = () => {
    setSelectedRoleIds(new Set(deletableRoles.map((r) => r.id)));
  };

  const handleClearRoles = () => {
    setSelectedRoleIds(new Set());
  };

  // Execute Bulk Delete Channels & Categories
  const handleExecuteDeleteChannels = async () => {
    const catList = Array.from(selectedCategoryIds);
    const chList = Array.from(selectedChannelIds);

    if (catList.length === 0 && chList.length === 0) {
      setErrorMessage('Pilih minimal satu channel atau category untuk dihapus.');
      return;
    }

    const confirmText = catList.length > 0
      ? `PERINGATAN: Anda akan menghapus ${catList.length} category (dan seluruh channel di dalamnya) serta ${chList.length} channel. Tindakan ini tidak dapat dibatalkan. Lanjutkan?`
      : `Hapus ${chList.length} channel terpilih? Tindakan ini tidak dapat dibatalkan.`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    setErrorMessage('');
    setResultMessage(null);

    try {
      let msg = '';
      if (catList.length > 0) {
        const resCat = await onBulkDeleteCategories(catList);
        msg += resCat.message || `Berhasil menghapus ${catList.length} category. `;
      }

      // Channels that are not inside deleted categories
      const remainingChList = chList.filter((chId) => {
        const ch = allChannels.find((c) => c.id === chId);
        return !catList.includes(ch?.parentId);
      });

      if (remainingChList.length > 0) {
        const resCh = await onBulkDeleteChannels(remainingChList);
        msg += resCh.message || `Berhasil menghapus ${remainingChList.length} channel.`;
      }

      setResultMessage({ type: 'success', text: msg });
      setSelectedChannelIds(new Set());
      setSelectedCategoryIds(new Set());
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus channels.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Bulk Delete Roles
  const handleExecuteDeleteRoles = async () => {
    const roleList = Array.from(selectedRoleIds);
    if (roleList.length === 0) {
      setErrorMessage('Pilih minimal satu role untuk dihapus.');
      return;
    }

    if (!window.confirm(`Hapus ${roleList.length} role terpilih dari server? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResultMessage(null);

    try {
      const res = await onBulkDeleteRoles(roleList);
      setResultMessage({ type: 'success', text: res.message || `Berhasil menghapus ${roleList.length} role.` });
      setSelectedRoleIds(new Set());
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus roles.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Purge
  const handleExecutePurge = async () => {
    if (!purgeChannelId) {
      setErrorMessage('Pilih channel terlebih dahulu.');
      return;
    }

    if (!window.confirm(`Hapus ${purgeAmount} pesan terakhir di channel ini?`)) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setResultMessage(null);

    try {
      const res = await onPurgeMessages(purgeChannelId, purgeAmount);
      setResultMessage({ type: 'success', text: res.message || `Berhasil membersihkan pesan.` });
    } catch (err) {
      setErrorMessage(err.message || 'Gagal membersihkan pesan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="channel-icon-pill danger">
              <Trash2 size={18} />
            </div>
            <div>
              <h3>Bulk Delete Suite</h3>
              <p className="modal-subtitle">
                Hapus masal channel, category, role, atau bersihkan pesan Discord
              </p>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-tabs-header">
          <button
            type="button"
            className={`modal-tab ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('channels');
              setResultMessage(null);
              setErrorMessage('');
            }}
          >
            <Hash size={15} style={{ marginRight: 6 }} />
            Channel & Kategori ({selectedChannelIds.size + selectedCategoryIds.size})
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('roles');
              setResultMessage(null);
              setErrorMessage('');
            }}
          >
            <Shield size={15} style={{ marginRight: 6 }} />
            Role Server ({selectedRoleIds.size})
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'purge' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('purge');
              setResultMessage(null);
              setErrorMessage('');
            }}
          >
            <MessageSquare size={15} style={{ marginRight: 6 }} />
            Bersihkan Pesan (Purge)
          </button>
        </div>

        <div className="modal-body-scrollable">
          {errorMessage && (
            <div className="status-message error" style={{ marginBottom: 14 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {resultMessage && (
            <div className="status-message success" style={{ marginBottom: 14 }}>
              <CheckCircle2 size={18} />
              <span>{resultMessage.text}</span>
            </div>
          )}

          {activeTab === 'channels' && (
            <div>
              <div className="bulk-toolbar">
                <span className="bulk-counter">
                  {selectedChannelIds.size} channel & {selectedCategoryIds.size} category dipilih
                </span>
                <div className="bulk-buttons">
                  <button type="button" className="ghost-button" onClick={handleSelectAllChannels}>
                    Pilih Semua
                  </button>
                  <button type="button" className="ghost-button" onClick={handleClearChannels}>
                    Batal Pilihan
                  </button>
                </div>
              </div>

              <div className="alert-notice warning">
                <AlertTriangle size={16} />
                <span>
                  <strong>Perhatian:</strong> Menghapus Category otomatis akan menghapus seluruh channel di dalam category tersebut.
                </span>
              </div>

              <div className="bulk-tree-list">
                {categories.map((cat) => (
                  <div key={cat.id} className="bulk-tree-category">
                    {cat.id !== 'uncategorized' && (
                      <label className="bulk-category-label">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.has(cat.id)}
                          onChange={() => toggleCategory(cat)}
                        />
                        <span className="cat-name">📁 {cat.name}</span>
                        <span className="badge-count">({cat.channels?.length || 0} channel)</span>
                      </label>
                    )}
                    {cat.id === 'uncategorized' && (
                      <div className="bulk-category-label plain">
                        <span>📁 Tanpa Kategori</span>
                      </div>
                    )}

                    <div className="bulk-channel-grid">
                      {cat.channels?.map((channel) => (
                        <label
                          key={channel.id}
                          className={`bulk-channel-item ${selectedChannelIds.has(channel.id) ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedChannelIds.has(channel.id)}
                            onChange={() => toggleChannel(channel.id)}
                          />
                          <span className="ch-icon">
                            {channel.type === 'voice' ? <Volume2 size={14} /> : <Hash size={14} />}
                          </span>
                          <span className="ch-name">{channel.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button type="button" className="ghost-button" onClick={onClose} disabled={loading}>
                  Tutup
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleExecuteDeleteChannels}
                  disabled={loading || (selectedChannelIds.size === 0 && selectedCategoryIds.size === 0)}
                  style={{ fontWeight: 700, padding: '10px 18px' }}
                >
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  {loading
                    ? 'Menghapus...'
                    : `Hapus (${selectedChannelIds.size} Ch, ${selectedCategoryIds.size} Cat)`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div>
              <div className="bulk-toolbar">
                <span className="bulk-counter">{selectedRoleIds.size} role dipilih</span>
                <div className="bulk-buttons">
                  <button type="button" className="ghost-button" onClick={handleSelectAllRoles}>
                    Pilih Semua Role
                  </button>
                  <button type="button" className="ghost-button" onClick={handleClearRoles}>
                    Batal Pilihan
                  </button>
                </div>
              </div>

              <div className="alert-notice info">
                <span>
                  Role <code>@everyone</code> dan role integrasi bot dilindungi dan tidak dapat dihapus secara masal.
                </span>
              </div>

              <div className="bulk-roles-grid">
                {deletableRoles.map((role) => (
                  <label
                    key={role.id}
                    className={`bulk-role-card ${selectedRoleIds.has(role.id) ? 'selected' : ''}`}
                    style={{ borderColor: selectedRoleIds.has(role.id) ? role.color : undefined }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.has(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                    <div className="role-color-dot" style={{ background: role.color }} />
                    <span className="role-name">{role.name}</span>
                  </label>
                ))}
              </div>

              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button type="button" className="ghost-button" onClick={onClose} disabled={loading}>
                  Tutup
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleExecuteDeleteRoles}
                  disabled={loading || selectedRoleIds.size === 0}
                  style={{ fontWeight: 700, padding: '10px 18px' }}
                >
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  {loading ? 'Menghapus Role...' : `Hapus (${selectedRoleIds.size}) Role Terpilih`}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'purge' && (
            <div className="purge-box">
              <div className="field-group">
                <label htmlFor="purge-channel-select">Pilih Text Channel Target</label>
                <select
                  id="purge-channel-select"
                  value={purgeChannelId}
                  onChange={(e) => setPurgeChannelId(e.target.value)}
                >
                  {textChannels.length === 0 ? (
                    <option value="">Tidak ada text channel</option>
                  ) : (
                    textChannels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        #{ch.name} ({ch.categoryName})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="field-group">
                <label>Jumlah Pesan yang Dihapus (1 - 100)</label>
                <div className="quick-amount-row">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`chip-btn ${purgeAmount === amt ? 'active' : ''}`}
                      onClick={() => setPurgeAmount(amt)}
                    >
                      {amt} Pesan
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={purgeAmount}
                  onChange={(e) => setPurgeAmount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div className="alert-notice info">
                <span>
                  💡 <strong>Info Discord:</strong> Fitur bulk delete pesan Discord hanya dapat menghapus pesan yang dikirim dalam rentang 14 hari terakhir.
                </span>
              </div>

              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button type="button" className="ghost-button" onClick={onClose} disabled={loading}>
                  Tutup
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleExecutePurge}
                  disabled={loading || !purgeChannelId}
                  style={{ fontWeight: 700, padding: '10px 18px' }}
                >
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  {loading ? 'Membersihkan...' : `Bersihkan ${purgeAmount} Pesan`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
