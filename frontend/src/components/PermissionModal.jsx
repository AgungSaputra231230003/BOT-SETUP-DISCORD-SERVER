import { useState } from 'react';
import { X, Check, AlertTriangle, Shield } from 'lucide-react';
import { PermissionsSelector } from './PermissionsSelector';

export function PermissionModal({
  title,
  subtitle,
  initialPermissions = [],
  mode = 'role',
  onClose,
  onSave
}) {
  const [permissions, setPermissions] = useState([...initialPermissions]);

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  return (
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
    </div>
  );
}
