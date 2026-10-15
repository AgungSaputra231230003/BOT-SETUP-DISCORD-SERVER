import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Shield } from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function PermissionModal({
  title,
  subtitle,
  initialPermissions = [],
  mode = 'role',
  onClose,
  onSave
}) {
  const normalizePermissions = (perms) => {
    if (Array.isArray(perms)) {
      if (perms.length > 0 && typeof perms[0] === 'string') {
        return perms;
      }
      return perms.map(p => p.key || p.name).filter(Boolean);
    }
    if (perms && typeof perms === 'object') {
      return Object.entries(perms)
        .filter(([_, val]) => val === true || (typeof val === 'object' && val.value === true))
        .map(([key]) => key);
    }
    return [];
  };

  const [permissions, setPermissions] = useState(() => normalizePermissions(initialPermissions));

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="channel-icon-pill">
              <Shield size={18} />
            </div>
            <div>
              <h3>{title || 'Setting Permissions'}</h3>
              <p className="modal-subtitle">
                {subtitle || 'Atur hak izin yang diinginkan'}
              </p>
            </div>
          </div>
          <button type="button" className="icon-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-scrollable">
          <PermissionsSelector
            permissions={permissions}
            onChange={setPermissions}
            title="Hak Izin"
            mode={mode}
          />

          <div className="modal-footer">
            <button type="button" className="ghost-button" onClick={onClose}>
              Batal
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              <Check size={16} style={{ marginRight: 6 }} />
              Simpan Izin ({permissions.length})
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}