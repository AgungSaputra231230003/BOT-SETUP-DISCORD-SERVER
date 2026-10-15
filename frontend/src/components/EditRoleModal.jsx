import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, AlertTriangle } from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function EditRoleModal({ role, onClose, onSave }) {
  const [name, setName] = useState(role?.name || '');
  const [color, setColor] = useState(role?.color || '#99AAB5');
  const [hoist, setHoist] = useState(Boolean(role?.hoist));
  const [permissions, setPermissions] = useState(Array.isArray(role?.permissions) ? [...role.permissions] : []);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!role) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama role tidak boleh kosong.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await onSave(role.id, {
        name: name.trim(),
        color,
        hoist,
        permissions
      });

      if (result && !result.success) {
        throw new Error(result.message || 'Gagal menyimpan role.');
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan role.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="role-color-preview" style={{ background: color }} />
            <div>
              <h3>Edit Role & Permissions</h3>
              <p className="modal-subtitle">
                Mengubah role <strong>{role.name}</strong> di server Discord
              </p>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-scrollable">
          {errorMessage && (
            <div className="status-message error" style={{ marginBottom: 16 }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="role-meta-grid">
            <div className="field-group">
              <label htmlFor="role-edit-name">Nama Role</label>
              <input
                id="role-edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Admin, Moderator, VIP"
                disabled={role.isEveryone}
              />
              {role.isEveryone && (
                <small className="help-text">Role @everyone tidak dapat diubah namanya.</small>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="role-edit-color">Warna Role</label>
              <div className="color-input-wrapper">
                <input
                  id="role-edit-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-text-input"
                  placeholder="#99AAB5"
                />
              </div>
            </div>

            <div className="field-group" style={{ justifyContent: 'center' }}>
              <label className="inline-toggle" style={{ marginTop: 22 }}>
                <input
                  type="checkbox"
                  checked={hoist}
                  onChange={(e) => setHoist(e.target.checked)}
                />
                <span>Tampilkan terpisah dari online (Hoist)</span>
              </label>
            </div>
          </div>

          <PermissionsSelector
            permissions={permissions}
            onChange={setPermissions}
            title="Hak Izin Role"
          />

          <div className="modal-footer">
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
              {isSaving ? 'Menyimpan Role...' : 'Simpan Perubahan Role'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}