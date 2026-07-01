import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { isLocalMode, getLocalUsers, saveLocalUsers, setLocalActiveUser } from '../lib/dbService';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

interface ProfileEditSectionProps {
  profile: UserProfile;
  onUpdate: () => void;
}

export default function ProfileEditSection({ profile, onUpdate }: ProfileEditSectionProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [photoURL, setPhotoURL] = useState(profile.photoURL);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      if (isLocalMode()) {
        const updatedProfile = { ...profile, displayName, photoURL };
        setLocalActiveUser(updatedProfile);
        
        const local = getLocalUsers();
        const updated = local.map(u => u.uid === profile.uid ? updatedProfile : u);
        saveLocalUsers(updated);
        
        setSuccess(true);
        onUpdate();
        setTimeout(() => setSuccess(false), 3000);
        return;
      }
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
      });
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Editar Perfil</h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
          <input 
            type="text" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Introduce tu nombre"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Foto de Perfil</label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <img 
                src={photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Profile preview" 
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                referrerPolicy="no-referrer"
              />
              <input 
                type="text" 
                value={photoURL} 
                onChange={(e) => setPhotoURL(e.target.value)} 
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Pegar URL de imagen"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium">O elige un avatar preestablecido:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => setPhotoURL(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 ${photoURL === url ? 'border-indigo-600 scale-105 shadow-sm' : 'border-transparent hover:scale-105'}`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {success && (
            <span className="text-emerald-600 text-xs font-semibold animate-pulse">
              ¡Guardado correctamente!
            </span>
          )}
          <button 
            type="button" 
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
