import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, db, isFirebaseConfigured } from '../config/firebase'
import type { Rsvp } from '../types/rsvp'
import {
  normalizeName,
  formatDisplayName,
  sanitizeGuestName,
  validateGuestName,
} from '../utils/formatters'

const COLLECTION_NAME = 'rsvps'
const LOCAL_STORAGE_KEY = 'wedding_rsvps_preview'

function getLocalRsvps(): Rsvp[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Rsvp[]
  } catch {
    return []
  }
}

function saveLocalRsvps(list: Rsvp[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  } catch {
    //
  }
}

export async function submitRsvp(rawName: string): Promise<Rsvp> {
  const sanitized = sanitizeGuestName(rawName)
  const validationError = validateGuestName(sanitized)
  if (validationError) {
    throw new Error(validationError)
  }

  const normalized = normalizeName(sanitized)
  const formatted = formatDisplayName(sanitized)
  const timestamp = Date.now()

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      name: formatted,
      normalizedName: normalized,
      createdAt: timestamp,
    })

    return {
      id: docRef.id,
      name: formatted,
      normalizedName: normalized,
      createdAt: timestamp,
    }
  }

  const localId = 'local_' + Math.random().toString(36).substring(2, 9)
  const newRsvp: Rsvp = {
    id: localId,
    name: formatted,
    normalizedName: normalized,
    createdAt: timestamp,
  }

  const existing = getLocalRsvps()
  saveLocalRsvps([newRsvp, ...existing])
  return newRsvp
}

export async function fetchRsvps(): Promise<Rsvp[]> {
  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((item) => {
      const data = item.data()
      return {
        id: item.id,
        name: String(data.name || ''),
        normalizedName: String(data.normalizedName || ''),
        createdAt: Number(data.createdAt || Date.now()),
      }
    })
  }

  return getLocalRsvps()
}

export async function loginAdmin(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Serviço de autenticação não configurado.')
  }
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return credential.user
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth)
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback)
  }
  callback(null)
  return () => {}
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null
}
