/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import AdminPanel from './components/AdminPanel';
import ProfessorView from './components/ProfessorView';
import StudentView from './components/StudentView';
import Login from './components/Login';
import { UserRole, UserProfile } from './types';
import { isLocalMode, setLocalMode, getLocalActiveUser, setLocalActiveUser, getLocalUsers } from './lib/dbService';
import { Shield, Users, User, Eye } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [adminPerspective, setAdminPerspective] = useState<UserRole | null>(null);

  useEffect(() => {
    if (profile && profile.email === 'juan.codina@murciaeduca.es') {
      if (!adminPerspective) {
        setAdminPerspective(UserRole.ADMIN);
      }
    } else {
      setAdminPerspective(null);
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      if (isLocalMode()) {
        setLocalMode(false);
        setLocalActiveUser(null);
        setUser(null);
        setProfile(null);
        setError(null);
      } else {
        await signOut(auth);
        setError(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateLocalMode = () => {
    setLocalMode(true);
    // Log in as Juan Codina Admin by default
    const adminUser = getLocalUsers().find(u => u.email === 'juan.codina@murciaeduca.es') || {
      uid: 'juan-codina-admin',
      email: 'juan.codina@murciaeduca.es',
      displayName: 'Juan Codina',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: UserRole.ADMIN,
      approved: true
    };
    setLocalActiveUser(adminUser);
    setUser({ uid: adminUser.uid, email: adminUser.email, displayName: adminUser.displayName });
    setProfile(adminUser);
    setError(null);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isLocalMode()) {
      const activeUser = getLocalActiveUser();
      if (activeUser) {
        setUser({ uid: activeUser.uid, email: activeUser.email, displayName: activeUser.displayName });
        setProfile(activeUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          const isAdmin = currentUser.email === 'juan.codina@murciaeduca.es';

          if (isAdmin) {
            // Automatic and absolute override for Juan Codina as Admin
            const adminProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: userDoc.exists() ? (userDoc.data().displayName || currentUser.displayName || 'Juan Codina') : (currentUser.displayName || 'Juan Codina'),
              photoURL: userDoc.exists() ? (userDoc.data().photoURL || currentUser.photoURL || '') : (currentUser.photoURL || ''),
              role: UserRole.ADMIN,
              approved: true,
            };
            await setDoc(userDocRef, adminProfile, { merge: true });
            setProfile(adminProfile);
          } else if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              uid: currentUser.uid,
              email: data.email || currentUser.email || '',
              displayName: data.displayName || currentUser.displayName || 'Nuevo Usuario',
              photoURL: data.photoURL || currentUser.photoURL || '',
              role: data.role as UserRole,
              approved: data.approved,
            });
          } else {
            // New student user registration, pending approval
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Nuevo Alumno',
              photoURL: currentUser.photoURL || '',
              role: UserRole.STUDENT,
              approved: false,
            };

            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err: any) {
          console.error("Firestore loading error:", err);
          setError(err.message || "No se ha podido conectar con el servidor. Verifica tu conexión de red o vuelve a intentarlo.");
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [retryTrigger]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4 border border-red-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error de Conexión</h2>
          <p className="text-slate-500 text-sm mb-6">
            {error.includes("offline") ? "No se pudo establecer conexión con la base de datos de Firebase porque estás sin conexión o la base de datos se está iniciando." : error}
          </p>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleActivateLocalMode} 
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Activar Modo Demostración Local (Bypass)</span>
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleLogout} 
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Cerrar Sesión
              </button>
              <button 
                onClick={() => setRetryTrigger(prev => prev + 1)} 
                className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md transition-all"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium">Cargando plataforma...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login onLogin={() => {}} />;
  }

  if (!profile.approved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Pendiente de Aprobación</h2>
          <p className="text-slate-500 text-sm mb-6">
            Hola <span className="font-semibold text-slate-700">{profile.displayName}</span> ({profile.email}). Tu solicitud de acceso está siendo revisada por un administrador.
          </p>
          <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-500 mb-6">
            ESTADO: PENDIENTE_APROBACION_L1
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Reload handler helper to pass down
  const reloadProfile = async () => {
    if (isLocalMode()) {
      const activeUser = getLocalActiveUser();
      if (activeUser) {
        setProfile(activeUser);
      }
      return;
    }
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setProfile({
        uid: auth.currentUser.uid,
        email: data.email || '',
        displayName: data.displayName || '',
        photoURL: data.photoURL || '',
        role: data.role as UserRole,
        approved: data.approved,
      });
    }
  };

  const currentViewRole = (profile.email === 'juan.codina@murciaeduca.es' && adminPerspective) 
    ? adminPerspective 
    : profile.role;

  const currentViewProfile = {
    ...profile,
    role: currentViewRole
  };

  const renderContent = () => {
    switch (currentViewRole) {
      case UserRole.ADMIN: 
        return <AdminPanel currentProfile={currentViewProfile} onLogout={handleLogout} onProfileUpdate={reloadProfile} />;
      case UserRole.PROFESSOR: 
        return <ProfessorView currentProfile={currentViewProfile} onLogout={handleLogout} onProfileUpdate={reloadProfile} />;
      case UserRole.STUDENT: 
        return <StudentView currentProfile={currentViewProfile} onLogout={handleLogout} onProfileUpdate={reloadProfile} />;
      default: 
        return (
          <div className="p-6 text-center">
            <p className="text-red-500 font-bold">Rol no reconocido</p>
            <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded">Cerrar Sesión</button>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen">
      {profile.email === 'juan.codina@murciaeduca.es' && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-orange-400 border-r border-slate-800 pr-3 mr-1">
            <Eye className="w-4 h-4 animate-pulse" />
            <span className="tracking-wider uppercase font-extrabold text-[10px]">Modo de Vista</span>
          </div>
          <button
            onClick={() => setAdminPerspective(UserRole.ADMIN)}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentViewRole === UserRole.ADMIN 
                ? 'bg-orange-500 text-white shadow-md font-bold' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            onClick={() => setAdminPerspective(UserRole.PROFESSOR)}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentViewRole === UserRole.PROFESSOR 
                ? 'bg-sky-500 text-white shadow-md font-bold' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Profesor
          </button>
          <button
            onClick={() => setAdminPerspective(UserRole.STUDENT)}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentViewRole === UserRole.STUDENT 
                ? 'bg-emerald-500 text-white shadow-md font-bold' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Alumno
          </button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
