import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertTriangle, Hash, Volume2, Shield, Layers, Plus } from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function EditChannelModal({ channel, categories = [], guildRoles = [], onClose, onSave }) {
  const [name, setName] = useState(channel?.name || '');
  const [topic, setTopic] = useState(channel?.topic || '');
  const [parentId, setParentId] = useState(channel?.parentId || '');
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'permissions'

  const [showRolePicker, setShowRolePicker] = useState(false);

  useEffect(() => {
    console.log('[DEBUG EditChannelModal] guildRoles diterima:', guildRoles);
  }, [guildRoles]);

  // Inisialisasi daftar target: Hanya memuat role yang benar-benar tersimpan di overwrite channel
  const [targetList, setTargetList] = useState(() => {
    const customTargets = [];
    
    if (channel?.permissionOverwrites && Array.isArray(channel.permissionOverwrites)) {
      channel.permissionOverwrites.forEach(ow => {
        if (ow.id !== 'everyone') {
          const matchedRole = guildRoles.find(r => r.id === ow.id);
          customTargets.push({
            id: ow.id,
            name: matchedRole ? matchedRole.name : (ow.name || `Role ${ow.id.slice(0, 5)}`),
            color: matchedRole?.color || '#99aab5',
            type: ow.type || 'role'
          });
        }
      });
    }
    
    const everyoneTarget = { id: 'everyone', name: '@everyone', color: '#99aab5', type: 'role' };
    
    return [...customTargets, everyoneTarget];
  });

  const [selectedTargetId, setSelectedTargetId] = useState(() => {
    const custom = targetList.find(t => t.id !== 'everyone');
    return custom ? custom.id : 'everyone';
  });
  
  const [overrides, setOverrides] = useState(() => {
    const initialMap = {
      everyone: Array.isArray(channel?.permissions) ? [...channel.permissions] : []
    };
    if (channel?.permissionOverwrites && Array.isArray(channel.permissionOverwrites)) {
      channel.permissionOverwrites.forEach(ow => {
        initialMap[ow.id] = Array.isArray(ow.permissions) ? [...ow.permissions] : [];
      });
    }
    return initialMap;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!channel) return null;

  const isVoice = channel.type === 'voice';

  const handlePermissionsChange = (newPerms) => {
    setOverrides((prev) => ({
      ...prev,
      [selectedTargetId]: newPerms
    }));
  };

  const currentPermissions = overrides[selectedTargetId] || [];

  // Helper untuk langsung mengirim perubahan otomatis ke Discord (khusus untuk aksi + dan x)
  const saveChangesToDiscord = async (newTargetList, newOverrides) => {
    try {
      const formattedOverwrites = newTargetList.map(t => ({
        id: t.id,
        type: t.type,
        permissions: newOverrides[t.id] || []
      }));

      const result = await onSave(channel.id, {
        name: name.trim(),
        topic: isVoice ? undefined : topic.trim(),
        parentId: parentId || null,
        permissions: newOverrides['everyone'] || [],
        permissionOverwrites: formattedOverwrites
      });

      if (result && !result.success) {
        throw new Error(result.message || 'Gagal memperbarui izin channel.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan otomatis.');
    }
  };

  const handleSelectRoleToAdd = (role) => {
    if (!targetList.some(t => t.id === role.id)) {
      const updatedTargets = (() => {
        const everyone = targetList.find(t => t.id === 'everyone');
        const others = targetList.filter(t => t.id !== 'everyone');
        return [
          ...others,
          { id: role.id, name: role.name, color: role.color || '#99aab5', type: 'role' },
          everyone
        ];
      })();

      const updatedOverrides = {
        ...overrides,
        [role.id]: overrides[role.id] || []
      };

      setTargetList(updatedTargets);
      setOverrides(updatedOverrides);
      setSelectedTargetId(role.id);
      setShowRolePicker(false);

      saveChangesToDiscord(updatedTargets, updatedOverrides);
    } else {
      setSelectedTargetId(role.id);
      setShowRolePicker(false);
    }
  };

  const handleRemoveRole = (e, roleId) => {
    e.stopPropagation();
    
    const updatedTargets = targetList.filter(t => t.id !== roleId);
    setTargetList(updatedTargets);
    
    if (selectedTargetId === roleId) {
      setSelectedTargetId('everyone');
    }

    saveChangesToDiscord(updatedTargets, overrides);
  };

  // Tombol Simpan Utama
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama channel tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const formattedOverwrites = targetList.map(t => ({
        id: t.id,
        type: t.type,
        permissions: overrides[t.id] || []
      }));

      const result = await onSave(channel.id, {
        name: name.trim(),
        topic: isVoice ? undefined : topic.trim(),
        parentId: parentId || null,
        permissions: overrides['everyone'] || [],
        permissionOverwrites: formattedOverwrites
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
  const activeTargetObj = targetList.find(t => t.id === selectedTargetId);
  
  const availableGuildRoles = guildRoles.filter(r => r.id !== 'everyone' && r.name !== '@everyone' && !targetList.some(t => t.id === r.id));

  const customRolesList = targetList.filter(t => t.id !== 'everyone');
  const everyoneTarget = targetList.find(t => t.id === 'everyone');

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 920, position: 'relative' }}>
        
        {showRolePicker && (
          <div
            style={{
              position: 'absolute',
              top: 70,
              left: 40,
              width: 280,
              background: '#0f172a',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>Pilih Role Server</span>
              <button
                type="button"
                className="icon-close-btn"
                onClick={() => setShowRolePicker(false)}
                style={{ padding: 2 }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {availableGuildRoles.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '8px 0', textAlign: 'center' }}>
                  Semua role sudah ditambahkan.
                </div>
              ) : (
                availableGuildRoles.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRoleToAdd(role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: role.color || '#99aab5', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

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
            Permissions
          </button>
        </div>

        <div className="modal-body-scrollable">
          {errorMessage && (
            <div className="status-message error" style={{ marginBottom: 16 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

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

          {activeTab === 'permissions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, minHeight: 400 }}>
              {/* Sidebar Roles/Members */}
              <div style={{ borderRight: '1px solid rgba(148, 163, 184, 0.15)', paddingRight: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.755rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px' }}>
                      ROLES/MEMBERS ({targetList.length})
                    </span>
                    <button
                      type="button"
                      className="ghost-button"
                      title="Tambah Role dari Server"
                      style={{ padding: '4px 6px', borderRadius: 6 }}
                      onClick={() => setShowRolePicker(!showRolePicker)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
                    {customRolesList.map((target) => {
                      const isSelected = selectedTargetId === target.id;
                      return (
                        <button
                          key={target.id}
                          type="button"
                          onClick={() => setSelectedTargetId(target.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: 'none',
                            background: isSelected ? 'rgba(88, 101, 242, 0.35)' : 'transparent',
                            color: isSelected ? '#f8fafc' : '#cbd5e1',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: '0.88rem',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: target.color || '#99aab5',
                                flexShrink: 0
                              }}
                            />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {target.name}
                            </span>
                          </div>
                          
                          <span
                            onClick={(e) => handleRemoveRole(e, target.id)}
                            title={`Hapus role ${target.name}`}
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: '0.8rem',
                              color: '#94a3b8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s, color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                              e.currentTarget.style.color = '#f87171';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#94a3b8';
                            }}
                          >
                            ×
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {everyoneTarget && (
                  <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.12)', paddingTop: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTargetId('everyone')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: selectedTargetId === 'everyone' ? 'rgba(88, 101, 242, 0.35)' : 'transparent',
                        color: selectedTargetId === 'everyone' ? '#f8fafc' : '#cbd5e1',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: selectedTargetId === 'everyone' ? 600 : 400,
                        fontSize: '0.88rem'
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#99aab5',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @everyone
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Area Konten PermissionsSelector + Tombol Simpan */}
              <div>
                <PermissionsSelector
                  permissions={currentPermissions}
                  onChange={handlePermissionsChange}
                  title={`Hak Izin untuk ${activeTargetObj ? activeTargetObj.name : 'Role Terpilih'}`}
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}