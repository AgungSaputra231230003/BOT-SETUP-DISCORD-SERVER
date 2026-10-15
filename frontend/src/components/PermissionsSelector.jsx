import { useState } from 'react';
import {
  PERMISSION_GROUPS,
  PERMISSION_PRESETS,
  CHANNEL_PERMISSION_GROUPS,
  CHANNEL_PERMISSION_PRESETS
} from '../data/permissionsData';

export function PermissionsSelector({
  permissions = [],
  onChange,
  title = 'Hak Izin (Permissions)',
  mode = 'role' // 'role' | 'channel'
}) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const groups = mode === 'channel' ? CHANNEL_PERMISSION_GROUPS : PERMISSION_GROUPS;
  const presets = mode === 'channel' ? CHANNEL_PERMISSION_PRESETS : PERMISSION_PRESETS;

  const togglePermission = (permId) => {
    if (permissions.includes(permId)) {
      onChange(permissions.filter((p) => p !== permId));
    } else {
      onChange([...permissions, permId]);
    }
  };

  const applyPreset = (presetName) => {
    const preset = presets[presetName] || [];
    onChange([...preset]);
  };

  const handleSelectAllInView = (permsToSelect) => {
    const set = new Set([...permissions, ...permsToSelect]);
    onChange(Array.from(set));
  };

  const handleClearAllInView = (permsToClear) => {
    const clearSet = new Set(permsToClear);
    onChange(permissions.filter((p) => !clearSet.has(p)));
  };

  // Filter permissions by category tab & search keyword
  const filteredGroups = groups
    .map((group) => {
      if (activeTab !== 'Semua' && group.category !== activeTab) {
        return null;
      }
      const filteredPerms = group.permissions.filter(
        (perm) =>
          perm.label.toLowerCase().includes(search.toLowerCase()) ||
          perm.id.toLowerCase().includes(search.toLowerCase()) ||
          perm.desc.toLowerCase().includes(search.toLowerCase())
      );
      return filteredPerms.length > 0 ? { ...group, permissions: filteredPerms } : null;
    })
    .filter(Boolean);

  const allVisiblePermIds = filteredGroups.flatMap((g) => g.permissions.map((p) => p.id));

  // Menambahkan kategori 'Aplikasi & Aktivitas (Apps)' agar tab filternya sinkron dengan permissionsData
  const availableTabs = [
    'Semua',
    ...(mode === 'channel'
      ? ['Akses & Visibilitas', 'Pesan & Obrolan (Text)', 'Suara & Video (Voice)', 'Aplikasi & Aktivitas (Apps)']
      : ['Administrasi & Server', 'Keanggotaan & Moderasi', 'Pesan & Obrolan (Text)', 'Suara & Video (Voice)', 'Aplikasi & Aktivitas (Apps)'])
  ];

  return (
    <div className="permissions-section">
      <div className="permissions-header">
        <div>
          <h4>{title}</h4>
          <p className="permissions-summary">{permissions.length} izin aktif</p>
        </div>

        <div className="preset-buttons">
          <span className="preset-label">Preset:</span>
          {mode === 'channel' ? (
            <>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('member')}
                title="Izin standar anggota (lihat, chat, voice)"
              >
                Publik (Member)
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('readOnly')}
                title="Hanya bisa baca / lihat tanpa bisa kirim pesan"
              >
                Read-Only
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('moderator')}
                title="Izin moderasi channel (kelola pesan & voice)"
              >
                Moderator
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('private')}
                title="Kunci channel dari @everyone (Private)"
              >
                Private (Terkunci)
              </button>
              <button
                type="button"
                className="chip-btn danger"
                onClick={() => applyPreset('none')}
                title="Kosongkan Semua Izin"
              >
                Kosongkan
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('admin')}
                title="Preset Administrator"
              >
                Admin
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('moderator')}
                title="Preset Moderator"
              >
                Moderator
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('member')}
                title="Preset Member Biasa"
              >
                Member
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => applyPreset('readOnly')}
                title="Preset Read-Only"
              >
                Read-Only
              </button>
              <button
                type="button"
                className="chip-btn danger"
                onClick={() => applyPreset('none')}
                title="Kosongkan Semua Izin"
              >
                Kosongkan
              </button>
            </>
          )}
        </div>
      </div>

      <div className="permissions-filter-bar">
        <input
          type="text"
          placeholder="Cari izin Discord (misal: kirim pesan, suara, invite)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="permission-search"
        />

        <div className="permission-tabs">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Administrasi & Server'
                ? 'Admin'
                : tab === 'Keanggotaan & Moderasi'
                ? 'Moderasi'
                : tab === 'Akses & Visibilitas'
                ? 'Akses'
                : tab === 'Pesan & Obrolan (Text)'
                ? 'Teks'
                : tab === 'Suara & Video (Voice)'
                ? 'Suara'
                : tab === 'Aplikasi & Aktivitas (Apps)'
                ? 'Apps'
                : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="perm-batch-actions">
        <button
          type="button"
          className="link-action-btn"
          onClick={() => handleSelectAllInView(allVisiblePermIds)}
        >
          Pilih Semua yang Tampil
        </button>
        <button
          type="button"
          className="link-action-btn"
          onClick={() => handleClearAllInView(allVisiblePermIds)}
        >
          Hapus Centang yang Tampil
        </button>
      </div>

      <div className="permissions-list">
        {filteredGroups.length === 0 ? (
          <div className="empty-perms">Tidak ada izin yang sesuai pencarian "{search}".</div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.category} className="perm-group-card">
              <h5 className="perm-group-title">{group.category}</h5>
              <div className="perm-items-grid">
                {group.permissions.map((perm) => {
                  const isChecked = permissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`perm-checkbox-item ${isChecked ? 'active' : ''} ${
                        perm.dangerous ? 'dangerous' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <div className="perm-info">
                        <span className="perm-label">
                          {perm.label}
                          {perm.dangerous && <span className="danger-badge">ADMIN</span>}
                        </span>
                        <span className="perm-desc">{perm.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}