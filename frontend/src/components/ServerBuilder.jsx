import { useEffect, useState } from 'react';
import { Plus, Send, Trash2, Edit2, Shield, Hash, Volume2, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { Presets } from './Presets';
import { LogChannelCard } from './LogChannelCard';
import { EditRoleModal } from './EditRoleModal';
import { EditChannelModal } from './EditChannelModal';
import { EditCategoryModal } from './EditCategoryModal';
import { PermissionModal } from './PermissionModal';
import { BulkDeleteModal } from './BulkDeleteModal';
import { useSetupStore } from '../store/useSetupStore';

export function ServerBuilder({ onExecute, loading }) {
  const {
    guildId,
    guildInfo,
    builderEnabled,
    setBuilderEnabled,
    guildMessages,
    availableTextChannels,
    isSyncingGuild,
    lastGuildError,
    roles,
    categories,
    guildRoles,
    guildCategories,
    setGuildId,
    addRole,
    updateRole,
    removeRole,
    clearAllBuilderRoles,
    addCategory,
    updateCategory,
    removeCategory,
    clearAllBuilderCategories,
    addChannel,
    updateChannel,
    removeChannel,
    syncGuildData,
    deleteGuildRole,
    updateGuildRole,
    deleteGuildChannel,
    updateGuildChannel,
    deleteGuildCategory,
    updateGuildCategory,
    createGuildChannelInCategory,
    bulkDeleteChannels,
    bulkDeleteRoles,
    bulkDeleteCategories,
    purgeMessages
  } = useSetupStore();

  const [editingRole, setEditingRole] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [permModalConfig, setPermModalConfig] = useState(null);

  useEffect(() => {
    if (!guildId || !guildId.trim()) {
      return undefined;
    }

    const timer = setTimeout(() => {
      syncGuildData(guildId);
    }, 400);

    return () => clearTimeout(timer);
  }, [guildId, syncGuildData]);



  const handleDeleteRole = async (roleId, roleName) => {
    const confirmed = window.confirm(`Hapus role "${roleName}" dari guild ini?`);
    if (!confirmed) return;

    const res = await deleteGuildRole(roleId);
    if (!res.success) {
      window.alert(res.message || 'Gagal menghapus role.');
    }
  };

  const handleDeleteChannel = async (channelId, channelName) => {
    const confirmed = window.confirm(`Hapus channel "${channelName}" dari guild ini?`);
    if (!confirmed) return;

    const res = await deleteGuildChannel(channelId);
    if (!res.success) {
      window.alert(res.message || 'Gagal menghapus channel.');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmed = window.confirm(
      `PERINGATAN: Menghapus category "${categoryName}" akan MENGHAPUS SEMUA CHANNEL di dalam category tersebut secara permanen!\n\nLanjutkan penghapusan?`
    );
    if (!confirmed) return;

    const res = await deleteGuildCategory(categoryId);
    if (!res.success) {
      window.alert(res.message || 'Gagal menghapus category.');
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Server Builder</p>
          <h2>Setup & Manajemen Server</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {guildInfo.name && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  if (guildId && guildId.trim()) {
                    syncGuildData(guildId);
                  }
                }}
                disabled={isSyncingGuild}
                title="Refresh Data Server"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 12px'
                }}
              >
                <RefreshCw size={15} className={isSyncingGuild ? 'spin-animation' : ''} />
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowBulkDeleteModal(true)}
                title="Buka menu bulk delete masal"
                style={{ display: 'inline-flex', alignItems: 'center', borderColor: 'rgba(248, 113, 113, 0.3)' }}
              >
                <Trash2 size={15} style={{ marginRight: 6, color: '#f87171' }} />
                Bulk Delete Tools
              </button>
              
            </div>
          )}
          <button
            type="button"
            className="primary-button"
            onClick={onExecute}
            disabled={loading}
          >
            <Send size={16} style={{ marginRight: 8 }} />
            {loading ? 'Executing...' : builderEnabled ? 'Execute Auto Setup' : 'Sinkronisasi Selesai'}
          </button>
        </div>
      </div>

      {builderEnabled && <Presets />}

      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="guild-id">Target Guild ID</label>
          <input
            id="guild-id"
            type="text"
            value={guildId}
            onChange={(event) => setGuildId(event.target.value)}
            placeholder="Masukkan Server/Guild ID Discord"
          />
        </div>

        {guildId && (
          <div className="field-group">
            <label>Guild Status</label>
            {isSyncingGuild ? (
              <div className="status-chip info">Mengecek role & channel dari Discord...</div>
            ) : lastGuildError ? (
              <div className="status-chip error">{lastGuildError}</div>
            ) : guildInfo.name ? (
              <div className="status-chip success">
                {guildInfo.name} · {guildInfo.memberCount} members
              </div>
            ) : (
              <div className="status-chip">Belum ada data guild.</div>
            )}
          </div>
        )}

        {guildInfo.name && (
          <div className="guild-overview">
            {/* Optional Discord Log Channel Component */}
            <LogChannelCard />

            <div className="guild-section">
              <div className="section-title-bar">
                <div>
                  <h3>Role yang ada di server ({guildRoles.length})</h3>
                  <small className="muted-text">
                    Klik ikon pensil untuk mengubah nama, warna, atau mengatur permissions role.
                  </small>
                </div>
              </div>

              <div className="tag-list" style={{ marginTop: 12 }}>
                {guildRoles.length === 0 ? (
                  <small className="muted-text">Belum ada role terdeteksi dari server.</small>
                ) : null}
                {guildRoles.map((role) => (
                  <div
                    key={role.id}
                    className="tag-item"
                    style={{
                      background: `${role.color}1c`,
                      color: role.color,
                      borderColor: `${role.color}44`
                    }}
                  >
                    <span className="role-color-dot" style={{ background: role.color }} />
                    <span className="tag-role-name">{role.name}</span>

                    <button
                      type="button"
                      className="mini-action edit"
                      onClick={() => setEditingRole(role)}
                      title={`Edit role & permissions: ${role.name}`}
                    >
                      <Edit2 size={11} />
                    </button>

                    {!role.isEveryone && !role.managed && (
                      <button
                        type="button"
                        className="mini-action delete"
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        title={`Hapus role ${role.name}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="guild-section">
              <div className="section-title-bar">
                <div>
                  <h3>Channel yang ada di server</h3>
                  <small className="muted-text">
                    Menghapus category akan otomatis menghapus seluruh channel di dalamnya.
                  </small>
                </div>
              </div>

              <div className="channel-tree" style={{ marginTop: 12 }}>
                {guildCategories.length === 0 ? (
                  <small className="muted-text">Belum ada channel terdeteksi dari server.</small>
                ) : null}
                {guildCategories.map((category) => (
                  <div key={category.id} className="channel-tree-item">
                    <div className="category-header-row">
                      <div className="category-title-wrap">
                        <span className="cat-icon">📁</span>
                        <strong>{category.name}</strong>
                        <span className="badge-count">({category.channels?.length || 0})</span>
                      </div>

                      {category.id !== 'uncategorized' && (
                        <div className="action-buttons-wrap">
                          <button
                            type="button"
                            className="mini-action edit"
                            onClick={() => setEditingCategory(category)}
                            title={`Edit category ${category.name}`}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            className="mini-action delete"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            title={`Hapus category ${category.name} beserta seluruh channel di dalamnya`}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <ul>
                      {category.channels?.map((channel) => (
                        <li key={channel.id}>
                          <div className="channel-entry-row">
                            <span className="channel-label-item">
                              {channel.type === 'voice' ? (
                                <Volume2 size={14} className="channel-type-icon voice" />
                              ) : (
                                <Hash size={14} className="channel-type-icon text" />
                              )}
                              {channel.name}
                            </span>

                            <div className="action-buttons-wrap">
                              <button
                                type="button"
                                className="mini-action edit"
                                onClick={() => setEditingChannel(channel)}
                                title={`Edit channel ${channel.name}`}
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                type="button"
                                className="mini-action delete"
                                onClick={() => handleDeleteChannel(channel.id, channel.name)}
                                title={`Hapus channel ${channel.name}`}
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {guildMessages[channel.id]?.length ? (
                            <small className="channel-message-snippet">
                              {guildMessages[channel.id][0].content.slice(0, 60)}
                              {guildMessages[channel.id][0].content.length > 60 ? '...' : ''}
                            </small>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="builder-toggle-card">
          <div className="builder-toggle-info">
            <div className="builder-toggle-title-row">
              <Layers size={18} className="builder-toggle-icon" />
              <div>
                <h4>Fitur Server Builder (Create Role & Channel)</h4>
                <p className="builder-toggle-desc">
                  {builderEnabled
                    ? 'Builder Aktif: Bot akan membuat role, category, dan channel baru saat dieksekusi.'
                    : 'Builder Nonaktif: Bot TIDAK akan membuat role atau channel baru. Server hanya digunakan untuk edit, pantau, dan bulk delete.'}
                </p>
              </div>
            </div>
          </div>
          <label className="switch-toggle">
            <input
              type="checkbox"
              checked={builderEnabled}
              onChange={(e) => setBuilderEnabled(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {builderEnabled && (
          <>

        <div>
          <div className="panel-header" style={{ marginBottom: 12 }}>
            <h3>Builder: Roles Baru ({roles.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {roles.length > 0 && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={clearAllBuilderRoles}
                  style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} />
                  Hapus Semua Role
                </button>
              )}
              <button type="button" className="ghost-button" onClick={addRole}>
                <Plus size={14} style={{ marginRight: 6 }} />
                Add Role
              </button>
            </div>
          </div>

          <div className="role-list">
            {roles.length === 0 ? (
              <div className="status-chip" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                Tidak ada role yang akan dibuat. Klik &quot;Add Role&quot; jika ingin menambahkan.
              </div>
            ) : null}
            {roles.map((role) => (
              <div key={role.id} className="role-item">
                <div className="role-item-grid">
                  <div className="field-group">
                    <label>Role Name</label>
                    <input
                      type="text"
                      value={role.name}
                      onChange={(event) => updateRole(role.id, 'name', event.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label>Color</label>
                    <input
                      type="color"
                      value={role.color || '#99AAB5'}
                      onChange={(event) => updateRole(role.id, 'color', event.target.value)}
                    />
                  </div>

                  <label className="inline-toggle" style={{ alignSelf: 'center' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(role.hoist)}
                      onChange={(event) => updateRole(role.id, 'hoist', event.target.checked)}
                    />
                    Hoist
                  </label>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() =>
                      setPermModalConfig({
                        title: `Setting Permissions: Role ${role.name}`,
                        subtitle: 'Pilih izin Discord yang akan diberikan ke role ini saat dibuat',
                        initialPermissions: role.permissions || [],
                        mode: 'role',
                        onSave: (newPerms) => updateRole(role.id, 'permissions', newPerms)
                      })
                    }
                    title="Atur Permissions Role ini"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderColor: (role.permissions?.length || 0) > 0 ? 'rgba(139, 92, 246, 0.6)' : undefined,
                      color: (role.permissions?.length || 0) > 0 ? '#c4b5fd' : undefined
                    }}
                  >
                    <Shield size={13} style={{ marginRight: 4 }} />
                    Izin ({(role.permissions || []).length})
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => removeRole(role.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="panel-header" style={{ marginBottom: 12 }}>
            <h3>Builder: Categories & Channels Baru ({categories.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {categories.length > 0 && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={clearAllBuilderCategories}
                  style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.3)' }}
                >
                  <Trash2 size={14} style={{ marginRight: 6 }} />
                  Hapus Semua Kategori
                </button>
              )}
              <button type="button" className="ghost-button" onClick={addCategory}>
                <Plus size={14} style={{ marginRight: 6 }} />
                Add Category
              </button>
            </div>
          </div>

          <div className="category-list">
            {categories.length === 0 ? (
              <div className="status-chip" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                Tidak ada category / channel yang akan dibuat. Klik &quot;Add Category&quot; jika ingin menambahkan.
              </div>
            ) : null}
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                <div className="category-top">
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label>Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(event) =>
                        updateCategory(category.id, 'name', event.target.value)
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() =>
                        setPermModalConfig({
                          title: `Setting Permissions: Kategori ${category.name}`,
                          subtitle: 'Pilih izin channel default (@everyone) untuk kategori ini saat dibuat',
                          initialPermissions: category.permissions || [],
                          mode: 'channel',
                          onSave: (newPerms) => updateCategory(category.id, 'permissions', newPerms)
                        })
                      }
                      title="Atur Permissions Kategori ini"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderColor: (category.permissions?.length || 0) > 0 ? 'rgba(139, 92, 246, 0.6)' : undefined,
                        color: (category.permissions?.length || 0) > 0 ? '#c4b5fd' : undefined
                      }}
                    >
                      <Shield size={13} style={{ marginRight: 4 }} />
                      Izin ({(category.permissions || []).length})
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => removeCategory(category.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="channel-list">
                  {category.channels?.map((channel) => (
                    <div key={channel.id} className="channel-item">
                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Channel</label>
                        <input
                          type="text"
                          value={channel.name}
                          onChange={(event) =>
                            updateChannel(category.id, channel.id, 'name', event.target.value)
                          }
                        />
                      </div>

                      <div className="field-group" style={{ marginBottom: 0 }}>
                        <label>Type</label>
                        <select
                          value={channel.type}
                          onChange={(event) =>
                            updateChannel(category.id, channel.id, 'type', event.target.value)
                          }
                        >
                          <option value="text">Text</option>
                          <option value="voice">Voice</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          setPermModalConfig({
                            title: `Setting Permissions: Channel #${channel.name}`,
                            subtitle: 'Pilih izin override khusus untuk channel ini saat dibuat',
                            initialPermissions: channel.permissions || [],
                            mode: 'channel',
                            onSave: (newPerms) => updateChannel(category.id, channel.id, 'permissions', newPerms)
                          })
                        }
                        title="Atur Permissions Channel ini"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderColor: (channel.permissions?.length || 0) > 0 ? 'rgba(139, 92, 246, 0.6)' : undefined,
                          color: (channel.permissions?.length || 0) > 0 ? '#c4b5fd' : undefined
                        }}
                      >
                        <Shield size={13} style={{ marginRight: 4 }} />
                        Izin ({(channel.permissions || []).length})
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => removeChannel(category.id, channel.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => addChannel(category.id, 'text')}
                  >
                    <Plus size={14} style={{ marginRight: 6 }} />
                    Text Channel
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => addChannel(category.id, 'voice')}
                    style={{ marginLeft: 8 }}
                  >
                    <Plus size={14} style={{ marginRight: 6 }} />
                    Voice Channel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modals */}
      {editingRole && (
        <EditRoleModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSave={updateGuildRole}
        />
      )}

      {editingChannel && (
        <EditChannelModal
          channel={editingChannel}
          categories={guildCategories}
          guildRoles={guildRoles}
          onClose={() => setEditingChannel(null)}
          onSave={updateGuildChannel}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaveCategory={updateGuildCategory}
          onDeleteCategory={deleteGuildCategory}
          onCreateChannel={createGuildChannelInCategory}
          onEditChannel={(ch) => setEditingChannel(ch)}
          onDeleteChannel={deleteGuildChannel}
        />
      )}

      {permModalConfig && (
        <PermissionModal
          title={permModalConfig.title}
          subtitle={permModalConfig.subtitle}
          initialPermissions={permModalConfig.initialPermissions}
          mode={permModalConfig.mode || 'role'}
          onClose={() => setPermModalConfig(null)}
          onSave={permModalConfig.onSave}
        />
      )}

      {showBulkDeleteModal && (
        <BulkDeleteModal
          categories={guildCategories}
          roles={guildRoles}
          textChannels={availableTextChannels}
          onClose={() => setShowBulkDeleteModal(false)}
          onBulkDeleteChannels={bulkDeleteChannels}
          onBulkDeleteRoles={bulkDeleteRoles}
          onBulkDeleteCategories={bulkDeleteCategories}
          onPurgeMessages={purgeMessages}
        />
      )}
    </section>
  );
}