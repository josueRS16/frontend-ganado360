import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import type { PerfilUsuario } from '../../types/api';

interface PerfilUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  Nombre: string;
  Correo: string;
  newPassword: string;
  confirmPassword: string;
}

export function PerfilUsuarioModal({ isOpen, onClose }: PerfilUsuarioModalProps) {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [userData, setUserData] = useState<PerfilUsuario | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    Nombre: '',
    Correo: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Cargar datos del usuario actual usando el endpoint de perfil
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen) {
        try {
          const response = await authApi.getProfile();
          setUserData(response.data);
          setFormData(prev => ({
            ...prev,
            Nombre: response.data.Nombre,
            Correo: response.data.Correo,
          }));
        } catch {
          showToast('Error al cargar datos del usuario', 'error');
        }
      }
    };

    fetchUserData();
  }, [isOpen, showToast]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setChangePassword(false);
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      setChangePassword(false);
      setFormData({
        Nombre: '',
        Correo: '',
        newPassword: '',
        confirmPassword: '',
      });
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      showToast('No se pudo cargar la información del usuario', 'error');
      return;
    }

    // Validaciones
    if (changePassword) {
      if (!formData.newPassword || formData.newPassword.length < 6) {
        showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para actualizar usando el endpoint de perfil
      const updateData: { Nombre: string; Correo: string; Contraseña?: string } = {
        Nombre: formData.Nombre.trim(),
        Correo: formData.Correo.trim(),
      };

      // Solo incluir contraseña si se está cambiando
      if (changePassword && formData.newPassword) {
        updateData.Contraseña = formData.newPassword;
      }

      const response = await authApi.updateProfile(updateData);
      
      // Actualizar el contexto de autenticación con los nuevos datos
      login({
        ...user,
        ID_Usuario: response.data.ID_Usuario,
        Nombre: response.data.Nombre,
        Correo: response.data.Correo,
        RolID: response.data.RolID,
        RolNombre: response.data.RolNombre,
      });

      showToast('Perfil actualizado exitosamente', 'success');
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-person-circle me-2"></i>
              Mi Perfil
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Cerrar modal"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Información Básica */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Información Personal
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          placeholder="Nombre completo"
                          value={formData.Nombre}
                          onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                          disabled={isSubmitting}
                          required
                        />
                        <label htmlFor="nombre">Nombre Completo</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="correo"
                          placeholder="Correo electrónico"
                          value={formData.Correo}
                          onChange={(e) => setFormData({ ...formData, Correo: e.target.value })}
                          disabled={isSubmitting}
                        />
                        <label htmlFor="correo">Correo Electrónico</label>
                      </div>
                    </div>
                    {userData && (
                      <div className="col-12">
                        <div className="alert alert-light border-0" style={{ backgroundColor: 'var(--color-sage-gray)' }}>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-shield-check me-2" style={{ color: 'var(--color-base-green)' }}></i>
                            <div>
                              <small><strong>Rol:</strong> {userData.RolNombre}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cambio de Contraseña */}
              <div className="card border-0 shadow-sm">
                <div className="card-header" style={{ background: 'var(--color-tint1)', color: 'white' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0 d-flex align-items-center">
                      <i className="bi bi-key-fill me-2"></i>
                      Cambiar Contraseña
                    </h6>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="changePasswordToggle"
                        checked={changePassword}
                        onChange={(e) => setChangePassword(e.target.checked)}
                        disabled={isSubmitting}
                        style={{ cursor: 'pointer' }}
                      />
                      <label className="form-check-label text-white" htmlFor="changePasswordToggle" style={{ cursor: 'pointer' }}>
                        {changePassword ? 'Activado' : 'Desactivado'}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {!changePassword ? (
                    <div className="text-center py-3">
                      <i className="bi bi-lock text-muted fs-1"></i>
                      <p className="text-muted mb-0 mt-2">
                        Active el cambio de contraseña para modificarla
                      </p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            placeholder="Nueva contraseña"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            disabled={isSubmitting}
                            required={changePassword}
                            minLength={6}
                            autoComplete="new-password"
                          />
                          <label htmlFor="newPassword">Nueva Contraseña</label>
                        </div>
                        <div className="form-text">
                          <i className="bi bi-shield-lock me-1"></i>
                          Mínimo 6 caracteres
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating">
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Confirmar contraseña"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            disabled={isSubmitting}
                            required={changePassword}
                            autoComplete="new-password"
                          />
                          <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        </div>
                        {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                          <div className="form-text text-danger">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            Las contraseñas no coinciden
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 p-3">
              <div className="d-flex justify-content-end gap-2 w-100">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-apply"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

