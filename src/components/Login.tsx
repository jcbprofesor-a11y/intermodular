import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ShieldAlert, BookOpen, Sparkles, User, Shield, Users } from 'lucide-react';
import { setLocalMode, setLocalActiveUser, getLocalUsers } from '../lib/dbService';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  const handleDemoLogin = (userEmail: string) => {
    setLocalMode(true);
    const localUsers = getLocalUsers();
    const matchedUser = localUsers.find(u => u.email === userEmail);
    if (matchedUser) {
      setLocalActiveUser(matchedUser);
    }
    onLogin();
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

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Acceder con Google
          </button>
        </div>

        {/* Sandbox Local Access Fallback */}
        <div className="pt-2 border-t border-dashed border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Acceso Rápido Sandbox / Modo Demostración
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => handleDemoLogin('juan.codina@murciaeduca.es')}
              className="flex items-center gap-3 px-3.5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold transition-all border border-orange-200/50"
            >
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Entrar como Administrador (Juan Codina)</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('m.rodriguez@facultad.es')}
              className="flex items-center gap-3 px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold transition-all border border-sky-200/50"
            >
              <Users className="w-4 h-4 text-sky-500" />
              <span>Entrar como Profesor (María Rodríguez)</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('j.sanchez92@university.edu')}
              className="flex items-center gap-3 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200/50"
            >
              <User className="w-4 h-4 text-emerald-500" />
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
