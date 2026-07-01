import { useState, useEffect } from 'react';
import { User, LogOut, BookOpen, Users, Shield, Award, Edit3, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import ProfileEditSection from './ProfileEditSection';

interface ProfessorViewProps {
  currentProfile: UserProfile;
  onLogout: () => Promise<void>;
  onProfileUpdate: () => void;
}

export default function ProfessorView({ currentProfile, onLogout, onProfileUpdate }: ProfessorViewProps) {
  const [activeTab, setActiveTab] = useState<'students' | 'profile'>('students');
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'), 
          where('role', '==', UserRole.STUDENT),
          where('approved', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setStudents(list);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab]);

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-white font-bold">P</div>
            <span className="text-lg font-bold tracking-tight text-slate-800">EduCentral Profesor</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'students' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            Gestión de Alumnos
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${activeTab === 'profile' ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </button>
          
          <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3">Seguridad</div>
          <div className="flex items-center gap-3 px-3 py-2 text-slate-600 font-mono text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div> Nivel Profesor (L2)
          </div>
        </div>
        
        <div className="p-4 bg-slate-900 m-4 rounded-xl text-white">
          <p className="text-xs opacity-70 mb-2">Conectado como</p>
          <div className="flex items-center gap-3 mb-3 overflow-hidden">
            <img 
              src={currentProfile.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{currentProfile.displayName}</p>
              <p className="text-[10px] text-sky-400 font-mono truncate">{currentProfile.email}</p>
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
              {activeTab === 'students' ? 'Listado de Alumnos' : 'Ajustes del Perfil'}
            </h1>
            <p className="text-slate-500 text-sm">
              {activeTab === 'students' ? 'Visualiza y gestiona las fichas de tus estudiantes matriculados' : 'Actualiza tus datos públicos y de contacto'}
            </p>
          </div>
        </header>

        {activeTab === 'students' ? (
          <div className="p-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Alumnos Activos</p>
                  <p className="text-3xl font-black text-slate-800">{students.length}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rendimiento Medio</p>
                  <p className="text-lg font-black text-slate-800">8.75 / 10</p>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Alumnos Autorizados</h3>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-slate-500">Cargando alumnos...</div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No hay alumnos autorizados todavía.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estudiante</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nivel de Acceso</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => (
                        <tr key={student.uid}>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img 
                              src={student.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="Avatar" 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-slate-700">{student.displayName}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm font-mono">{student.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
                              L1 - Alumno
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                              <CheckCircle className="w-4 h-4" /> Activo
                            </span>
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
