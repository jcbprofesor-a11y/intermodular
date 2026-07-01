import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { Users, UserCheck, Shield, LogOut, UserPlus, RefreshCw, Trash2, Edit } from 'lucide-react';
import ProfileEditSection from './ProfileEditSection';

interface AdminPanelProps {
  currentProfile: UserProfile;
  onLogout: () => Promise<void>;
  onProfileUpdate: () => void;
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-orange-500 text-white',
    [UserRole.PROFESSOR]: 'bg-sky-400 text-white',
    [UserRole.STUDENT]: 'bg-emerald-400 text-white',
  };
  
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'ADMINISTRADOR',
    [UserRole.PROFESSOR]: 'PROFESOR',
    [UserRole.STUDENT]: 'ALUMNO',
  };

  return (
    <span className={`px-2.5 py-1 rounded text-xs font-black tracking-wider ${styles[role] || 'bg-slate-200 text-slate-800'}`}>
      {labels[role] || role}
    </span>
  );
};

export default function AdminPanel({ currentProfile, onLogout, onProfileUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'profile'>('pending');
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('approved', '==', false));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(docSnapshot => ({ uid: docSnapshot.id, ...docSnapshot.data() } as UserProfile));
      setPendingUsers(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('approved', '==', true));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(docSnapshot => ({ uid: docSnapshot.id, ...docSnapshot.data() } as UserProfile));
      setAllUsers(users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPending();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    }
  }, [activeTab]);

  const approveUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { approved: true });
      setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      console.error(err);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      setEditingUid(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (uid: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        setAllUsers(prev => prev.filter(u => u.uid !== uid));
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">A</div>
            <span className="text-lg font-bold tracking-tight text-slate-800">EduCentral Admin</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'pending' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" />
              Solicitudes Pendientes
            </div>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">{pendingUsers.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'users' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            Todos los Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'profile' ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Shield className="w-4 h-4" />
            Mi Perfil Admin
          </button>
          
          <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3">Niveles de Seguridad</div>
          <div className="space-y-1 px-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> L3 - Administrador
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div> L2 - Profesor
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> L1 - Alumno
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-900 m-4 rounded-xl text-white">
          <p className="text-xs opacity-70 mb-2">Conectado como</p>
          <div className="flex items-center gap-3 mb-3 overflow-hidden">
            <img 
              src={currentProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{currentProfile.displayName}</p>
              <p className="text-[10px] text-orange-400 font-mono truncate">{currentProfile.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-1.5 bg-slate-800 hover:bg-red-950 text-red-400 hover:text-red-300 rounded text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'pending' ? 'Cola de Aprobación Manual' : activeTab === 'users' ? 'Gestión de Usuarios' : 'Ajustes de Administrador'}
            </h1>
            <p className="text-slate-500 text-sm">
              {activeTab === 'pending' ? 'Revisa y autoriza las nuevas solicitudes de registro en la plataforma' : activeTab === 'users' ? 'Gestiona roles y accesos de los usuarios registrados' : 'Actualiza tus datos públicos de Administrador'}
            </p>
          </div>
          <button 
            onClick={() => {
              if (activeTab === 'pending') fetchPending();
              else if (activeTab === 'users') fetchAllUsers();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all"
            title="Refrescar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </header>

        {activeTab === 'pending' ? (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Solicitudes por Aprobar ({pendingUsers.length})</h3>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-slate-500">Cargando cola de solicitudes...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay nuevas solicitudes de registro pendientes. ¡Todo al día!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Solicitante</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol Solicitado</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingUsers.map(user => (
                        <tr key={user.uid}>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img 
                              src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="Avatar" 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-slate-700">{user.displayName || 'Nuevo Usuario'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-mono">{user.email}</td>
                          <td className="px-6 py-4">
                            <RoleBadge role={user.role || UserRole.STUDENT} />
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => deleteUser(user.uid)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                              title="Rechazar y Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => approveUser(user.uid)} 
                              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                            >
                              Aprobar Acceso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Usuarios Activos ({allUsers.length})</h3>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-slate-500">Cargando usuarios activos...</div>
              ) : allUsers.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay usuarios activos registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol Asignado</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allUsers.map(user => (
                        <tr key={user.uid}>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img 
                              src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="Avatar" 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-slate-700">{user.displayName}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-mono">{user.email}</td>
                          <td className="px-6 py-4">
                            {editingUid === user.uid ? (
                              <select 
                                value={user.role} 
                                onChange={(e) => updateUserRole(user.uid, e.target.value as UserRole)}
                                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              >
                                <option value={UserRole.STUDENT}>Alumno</option>
                                <option value={UserRole.PROFESSOR}>Profesor</option>
                                <option value={UserRole.ADMIN}>Administrador</option>
                              </select>
                            ) : (
                              <RoleBadge role={user.role} />
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {user.email !== 'juan.codina@murciaeduca.es' && (
                              <>
                                <button 
                                  onClick={() => setEditingUid(editingUid === user.uid ? null : user.uid)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-all"
                                  title="Editar Rol"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.uid)}
                                  className="p-1.5 text-red-400 hover:text-red-600 rounded transition-all"
                                  title="Eliminar Cuenta"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-2xl">
            <ProfileEditSection profile={currentProfile} onUpdate={onProfileUpdate} />
          </div>
        )}
      </main>
    </div>
  );
}
