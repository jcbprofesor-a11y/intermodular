import { db, auth } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { UserRole, UserProfile } from '../types';

// Let's check if the user preferred Local Mode
const LOCAL_STORAGE_KEY = 'educentral_mode';
const USERS_STORAGE_KEY = 'educentral_local_users';

export function isLocalMode(): boolean {
  return localStorage.getItem(LOCAL_STORAGE_KEY) === 'local';
}

export function setLocalMode(active: boolean) {
  if (active) {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'local');
    initializeLocalData();
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

const DEFAULT_LOCAL_USERS: UserProfile[] = [
  {
    uid: 'juan-codina-admin',
    email: 'juan.codina@murciaeduca.es',
    displayName: 'Juan Codina',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: UserRole.ADMIN,
    approved: true
  },
  {
    uid: 'm-rodriguez-prof',
    email: 'm.rodriguez@facultad.es',
    displayName: 'Prof. María Rodríguez',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: UserRole.PROFESSOR,
    approved: true
  },
  {
    uid: 'j-sanchez-stud',
    email: 'j.sanchez92@university.edu',
    displayName: 'Javier Sánchez',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: UserRole.STUDENT,
    approved: true
  },
  {
    uid: 'a-martinez-stud-pending',
    email: 'amartinez@outlook.com',
    displayName: 'Alex Martínez',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    role: UserRole.STUDENT,
    approved: false
  },
  {
    uid: 'l-garcia-stud-pending',
    email: 'lgarcia@campus.edu',
    displayName: 'Lucía García',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: UserRole.STUDENT,
    approved: false
  }
];

function initializeLocalData() {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_LOCAL_USERS));
  }
}

export function getLocalUsers(): UserProfile[] {
  initializeLocalData();
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Global active user in local mode
const ACTIVE_USER_KEY = 'educentral_active_user';

export function getLocalActiveUser(): UserProfile | null {
  const data = localStorage.getItem(ACTIVE_USER_KEY);
  if (!data) return null;
  const user = JSON.parse(data);
  // sync with latest status in the users list
  const users = getLocalUsers();
  const matched = users.find(u => u.uid === user.uid || u.email === user.email);
  return matched || user;
}

export function setLocalActiveUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}
