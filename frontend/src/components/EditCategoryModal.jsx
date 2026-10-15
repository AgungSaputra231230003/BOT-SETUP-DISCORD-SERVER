import { useState } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Folder,
  Plus,
  Trash2,
  Edit2,
  Hash,
  Volume2,
  Shield,
  Layers
} from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function EditCategoryModal({
  category,
  onClose,
  onSaveCategory,
  onDeleteCategory,
  onCreateChannel,
  onEditChannel,
  onDeleteChannel
}) {
  const [name, setName] = useState(category?.name || '');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'channels' | 'permissions'
  const [permissions, setPermissions] = useState(
    Array.isArray(category?.permissions) ? [...category.permissions] : []
  );

  // New channel form state inside this category
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState('text');
  const [newChannelTopic, setNewChannelTopic] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!category) return null;

  const handleSaveGeneralAndPermissions = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama category tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await onSaveCategory(category.id, {
        name: name.trim(),
        permissions
      });

      if (result && !result.success) {
        throw new Error(result.message || 'Gagal mengubah category.');
      }
      setSuccessMessage('Perubahan category & permissions berhasil disimpan!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateChannelSubmit = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      setErrorMessage('Nama channel tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await onCreateChannel(category.id, {
        name: newChannelName.trim(),
        type: newChannelType,
        topic: newChannelTopic.trim()
      });

      if (result && !result.success) {
        throw new Error(result.message || 'Gagal membuat channel.');
      }

      setSuccessMessage(`Channel #${newChannelName.trim()} berhasil dibuat!`);
      setNewChannelName('');
      setNewChannelTopic('');
      setShowAddChannel(false);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat membuat channel.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategoryClick = async () => {
    const confirmed = window.confirm(
      `PERINGATAN: Menghapus category "${category.name}" akan MENGHAPUS SEMUA CHANNEL di dalamnya secara permanen!\n\nLanjutkan penghapusan?`
    );
    if (!confirmed) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await onDeleteCategory(category.id, category.name);
      if (result && !result.success) {
        throw new Error(result.message || 'Gagal menghapus category.');
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus category.');
      setIsSaving(false);
    }
  };

  const handleDeleteChannelClick = async (channelId, channelName) => {
    const confirmed = window.confirm(`Hapus channel "${channelName}" dari category ini?`);
    if (!confirmed) return;

    try {
      const result = await onDeleteChannel(channelId, channelName);
      if (result && !result.success) {
        throw new Error(result.message || 'Gagal menghapus channel.');
      }
      setSuccessMessage(`Channel #${channelName} berhasil dihapus.`);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus channel.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="channel-icon-pill">
              <Folder size={18} />
            </div>
            <div>
              <h3>Kelola & Edit Category: {category.name}</h3>
              <p className="modal-subtitle">
                Atur nama category, kelola daftar channel (CRUD), dan konfigurasi permissions
              </p>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs-header">
          <button
            type="button"
            className={`modal-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <Folder size={15} style={{ marginRight: 6 }} />
            Umum (Nama)
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            <Layers size={15} style={{ marginRight: 6 }} />
            Kelola Channel ({category.channels?.length || 0})
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <Shield size={15} style={{ marginRight: 6 }} />
            Hak Izin Category ({permissions.length})
          </button>
        </div>

        <div className="modal-body-scrollable">
          {errorMessage && (
            <div className="status-message error" style={{ marginBottom: 16 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="status-message success" style={{ marginBottom: 16 }}>
              <Check size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div>
              <div className="field-group">
                <label htmlFor="edit-category-name">Nama Category</label>
                <input
                  id="edit-category-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="📢 INFORMASI"
                  autoFocus
                />
              </div>

              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  background: 'rgba(248, 113, 113, 0.08)'
                }}
              >
                <h4 style={{ margin: '0 0 6px', color: '#fca5a5', fontSize: '0.92rem' }}>
                  Hapus Category Ini
                </h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Menghapus category ini akan otomatis menghapus seluruh channel di dalamnya secara masal.
                </p>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDeleteCategoryClick}
                  disabled={isSaving}
                  style={{ fontWeight: 600 }}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} />
                  Hapus Category Beserta Seluruh Channel
                </button>
              </div>

              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSaveGeneralAndPermissions}
                  disabled={isSaving}
                >
                  <Check size={16} style={{ marginRight: 6 }} />
                  {isSaving ? 'Menyimpan...' : 'Simpan Nama Category'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHANNELS CRUD */}
          {activeTab === 'channels' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                  Daftar Channel ({category.channels?.length || 0})
                </span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowAddChannel(!showAddChannel)}
                  style={{
                    borderColor: showAddChannel ? 'rgba(139, 92, 246, 0.5)' : undefined,
                    background: showAddChannel ? 'rgba(139, 92, 246, 0.2)' : undefined
                  }}
                >
                  <Plus size={14} style={{ marginRight: 6 }} />
                  {showAddChannel ? 'Batal Tambah Channel' : 'Tambah Channel Baru'}
                </button>
              </div>

              {/* Form Create Channel in this Category */}
              {showAddChannel && (
                <form
                  onSubmit={handleCreateChannelSubmit}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    marginBottom: 18,
                    display: 'grid',
                    gap: 12
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#c4b5fd' }}>
                    Buat Channel Baru di Kategori "{category.name}"
                  </h4>

                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Nama Channel</label>
                    <input
                      type="text"
                      placeholder="nama-channel-baru"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Tipe Channel</label>
                    <select
                      value={newChannelType}
                      onChange={(e) => setNewChannelType(e.target.value)}
                    >
                      <option value="text">Text Channel (#)</option>
                      <option value="voice">Voice Channel (🔊)</option>
                    </select>
                  </div>

                  {newChannelType === 'text' && (
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label>Deskripsi / Topik Channel (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Deskripsi topik obrolan channel ini..."
                        value={newChannelTopic}
                        onChange={(e) => setNewChannelTopic(e.target.value)}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => setShowAddChannel(false)}
                      disabled={isSaving}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isSaving}
                    >
                      <Plus size={14} style={{ marginRight: 6 }} />
                      {isSaving ? 'Membuat...' : 'Buat Channel Sekarang'}
                    </button>
                  </div>
                </form>
              )}

              {/* Channel list inside this category */}
              <div style={{ display: 'grid', gap: 8 }}>
                {(!category.channels || category.channels.length === 0) ? (
                  <div
                    className="status-chip"
                    style={{ width: '100%', justifyContent: 'center', padding: 16 }}
                  >
                    Belum ada channel di dalam category ini.
                  </div>
                ) : (
                  category.channels.map((ch) => (
                    <div
                      key={ch.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(148, 163, 184, 0.12)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {ch.type === 'voice' ? (
                          <Volume2 size={16} className="channel-type-icon voice" />
                        ) : (
                          <Hash size={16} className="channel-type-icon text" />
                        )}
                        <strong style={{ fontSize: '0.86rem', color: '#f1f5f9' }}>{ch.name}</strong>
                        {ch.topic && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            — {ch.topic}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="mini-action edit"
                          onClick={() => onEditChannel(ch)}
                          title={`Edit channel #${ch.name}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          className="mini-action delete"
                          onClick={() => handleDeleteChannelClick(ch.id, ch.name)}
                          title={`Hapus channel #${ch.name}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-footer" style={{ marginTop: 24 }}>
                <button type="button" className="ghost-button" onClick={onClose}>
                  Tutup
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div>
              <PermissionsSelector
                permissions={permissions}
                onChange={setPermissions}
                title={`Hak Izin Default Kategori (${category.name})`}
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
                  onClick={handleSaveGeneralAndPermissions}
                  disabled={isSaving}
                >
                  <Check size={16} style={{ marginRight: 6 }} />
                  {isSaving ? 'Menyimpan...' : `Simpan Permissions Category (${permissions.length})`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
