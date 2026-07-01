import { useState } from 'react';
import { User, LogOut, BookOpen, Award, Shield, Clock } from 'lucide-react';
import { UserProfile } from '../types';
import ProfileEditSection from './ProfileEditSection';

interface StudentViewProps {
  currentProfile: UserProfile;
  onLogout: () => Promise<void>;
  onProfileUpdate: () => void;
}

export default function StudentView({ currentProfile, onLogout, onProfileUpdate }: StudentViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-white font-bold">A</div>
            <span className="text-lg font-bold tracking-tight text-slate-800">EduCentral Alumno</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-4 h-4" />
            Mi Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-4 h-4" />
            Editar Perfil
          </button>
          
          <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3">Seguridad</div>
          <div className="flex items-center gap-3 px-3 py-2 text-slate-600 font-mono text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Nivel Alumno
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
              <p className="text-[10px] text-emerald-400 font-mono truncate">{currentProfile.email}</p>
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
              {activeTab === 'dashboard' ? 'Mi Espacio Académico' : 'Ajustes del Perfil'}
            </h1>
            <p className="text-slate-500 text-sm">
              {activeTab === 'dashboard' ? 'Consulta tus datos, cursos y calificaciones' : 'Actualiza tus datos públicos y de contacto'}
            </p>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="p-8 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Académico</p>
                  <p className="text-lg font-black text-slate-800">Regular</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asignaturas Matriculadas</p>
                  <p className="text-2xl font-black text-slate-800">5 Cursos</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Última Conexión</p>
                  <p className="text-sm font-bold text-slate-800 font-mono">Hoy, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
              </div>
            </div>

            {/* Main content split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Mis Calificaciones</h3>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: 'Desarrollo Web Frontend', score: '9.2', status: 'Excelente' },
                    { name: 'Bases de Datos Relacionales', score: '8.5', status: 'Sobresaliente' },
                    { name: 'Metodologías Ágiles', score: '7.8', status: 'Notable' },
                    { name: 'Programación en TypeScript', score: '9.5', status: 'Excelente' },
                  ].map((course, i) => (
                    <div key={i} className="py-3.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{course.name}</p>
                        <p className="text-xs text-slate-400">Primer Trimestre</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded border border-emerald-100">{course.status}</span>
                        <span className="text-lg font-black text-slate-800">{course.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
                  <img 
                    src={currentProfile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt="Avatar Large" 
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-50"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{currentProfile.displayName}</h4>
                    <p className="text-xs text-slate-500 font-mono">{currentProfile.email}</p>
                  </div>
                  <div className="bg-slate-50 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Estudiante Certificado
                  </div>
                </div>
              </div>
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
