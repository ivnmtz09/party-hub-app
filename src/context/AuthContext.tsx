import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'
import {
  getUserProfile,
  updateUserProfile as updateProfileService,
  actualizarMiembroEnGrupos,
} from '../firebase/services'

export interface UserProfile {
  nickname: string
  avatar: string
}

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (data: UserProfile) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (uid: string) => {
    const profile = await getUserProfile(uid)
    if (profile) {
      setUserProfile(profile)
    }
  }, [])

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setUser(result.user)
          if (result.user) {
            loadProfile(result.user.uid)
          }
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        loadProfile(firebaseUser.uid)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [loadProfile])

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch {
      console.warn('signOut fallo, forzando recarga')
    } finally {
      window.location.reload()
    }
  }

  const handleUpdateProfile = async (data: UserProfile) => {
    if (!user) return
    await updateProfileService(user.uid, data)
    setUserProfile(data)
    await actualizarMiembroEnGrupos(user.uid, data)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        logout,
        updateUserProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
