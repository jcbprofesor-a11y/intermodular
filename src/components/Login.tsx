import { useState } from 'react';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldAlert, BookOpen, AlertCircle, Globe, ExternalLink, Sparkles, Shield, Users, User } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

export default function Login({ 
  onLogin, 
  onLocalBypass 
}: { 
  onLogin: () => void;
  onLocalBypass?: (profile: UserProfile) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [showDomains, setShowDomains] = useState(false);

  const handleGoogleLogin = async (useRedirect: boolean = false) => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        onLogin();
      }
    } catch (err: any) {
      console.error("Error logging in with Google:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Este dominio no está autorizado en tu consola de Firebase. Debes añadirlo a la lista de 'Dominios autorizados' en Firebase Authentication.");
        setShowDomains(true);
      } else if (err.code === 'auth/popup-blocked') {
        setError("El navegador ha bloqueado la ventana emergente de inicio de sesión. Por favor, intenta usar la opción de 'Redirección' o permite las ventanas emergentes.");
      } else {
        setError(err.message || "Ha ocurrido un error al iniciar sesión con Google.");
      }
    }
  };

  const handleDemoLogin = (userEmail: string) => {
    if (!onLocalBypass) return;
    
    let demoProfile: UserProfile;
    if (userEmail === 'juan.codina@murciaeduca.es') {
      demoProfile = {
        uid: 'demo-admin-uid',
        email: 'juan.codina@murciaeduca.es',
        displayName: 'Juan Codina',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: UserRole.ADMIN,
        approved: true
      };
    } else if (userEmail === 'm.rodriguez@facultad.es') {
      demoProfile = {
        uid: 'demo-prof-uid',
        email: 'm.rodriguez@facultad.es',
        displayName: 'María Rodríguez',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: UserRole.PROFESSOR,
        approved: true
      };
    } else {
      demoProfile = {
        uid: 'demo-stud-uid',
        email: 'j.sanchez92@university.edu',
        displayName: 'Javier Sánchez',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: UserRole.STUDENT,
        approved: true
      };
    }
    
    onLocalBypass(demoProfile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">EduCentral</h2>
          <p className="text-sm text-slate-500 font-medium">Plataforma de Gestión de Alumnos</p>
        </div>

        <div className="border-t border-slate-100 my-4"></div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 items-start animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 space-y-1">
              <p className="font-bold">Error de Acceso</p>
              <p className="leading-relaxed">{error}</p>
              <button 
                onClick={() => setShowDomains(!showDomains)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mt-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showDomains ? "Ocultar dominios a configurar" : "Ver dominios a configurar"}</span>
              </button>
            </div>
          </div>
        )}

        {showDomains && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-600">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Globe className="w-4 h-4 text-indigo-600" />
              Dominios a añadir en Firebase Console:
            </p>
            <p className="leading-relaxed">
              Ve a tu <strong>Consola de Firebase &gt; Authentication &gt; Configuración (Ajustes) &gt; Dominios autorizados</strong> y añade los siguientes dominios:
            </p>
            <div className="space-y-1.5 font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 select-all">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>localhost</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 pt-1">
                <span>intermodular-tau.vercel.app</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 pt-1">
                <span>ais-dev-zg74ugkfutcp25rifuslla-715102644462.europe-west2.run.app</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>ais-pre-zg74ugkfutcp25rifuslla-715102644462.europe-west2.run.app</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Nota: Si usas otros subdominios de Vercel, añádelos también allí.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={() => handleGoogleLogin(false)} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Acceder con Google (Ventana)
          </button>

          <button 
            onClick={() => handleGoogleLogin(true)} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#FFF"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#FFF" opacity="0.85"/>
            </svg>
            Acceder con Google (Redirección)
          </button>

          <button 
            onClick={() => setShowDomains(!showDomains)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver Dominios a Autorizar en Firebase</span>
          </button>
        </div>

        {/* Sandbox Local Access Fallback */}
        <div className="pt-2 border-t border-dashed border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Acceso Rápido Sandbox / Modo Demostración
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => handleDemoLogin('juan.codina@murciaeduca.es')}
              className="flex items-center gap-3 px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold transition-all border border-orange-200/50 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Entrar como Administrador (Juan Codina)</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('m.rodriguez@facultad.es')}
              className="flex items-center gap-3 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold transition-all border border-sky-200/50 cursor-pointer"
            >
              <Users className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Entrar como Profesor (María Rodríguez)</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('j.sanchez92@university.edu')}
              className="flex items-center gap-3 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200/50 cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Entrar como Alumno (Javier Sánchez)</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 leading-relaxed font-medium">
            <p className="font-bold text-slate-700 mb-1">Aprobación de Registro Manual</p>
            Al ingresar por primera vez, tu cuenta se registrará y quedará en espera de aprobación manual por un Administrador.
          </div>
        </div>

        <div className="text-[10px] text-center text-slate-400 font-mono">
          NIVEL DE SEGURIDAD REQUERIDO: L1, L2, L3
        </div>
      </div>
    </div>
  );
}
