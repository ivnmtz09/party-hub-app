import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import GameHeader from '../../../components/GameHeader'
import UserAvatar, { AVATAR_COLORS, type AvatarType } from '../../../components/UserAvatar'
import { Save, Check } from 'lucide-react'

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useAuth()
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('#fbbf24')
  const [avatarType, setAvatarType] = useState<AvatarType>('letter')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setNickname(userProfile.nickname)
      setAvatar(userProfile.avatar || '#fbbf24')
      setAvatarType(userProfile.avatarType || 'letter')
    }
  }, [userProfile])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateUserProfile({ nickname: nickname.trim(), avatar, avatarType })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // error silencioso
    } finally {
      setSaving(false)
    }
  }

  const displayName = nickname?.trim() || '?'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="MI PERFIL" backTo="/" />
      </div>

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6">

          <div className="flex flex-col items-center gap-4">
            <UserAvatar
              name={displayName}
              color={avatar}
              type={avatarType}
              size={80}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Nombre de Jugador (Nickname)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              placeholder="TU NICKNAME"
              className="w-full py-4 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-wider text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {nickname.length}/12 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Tipo de Avatar
            </label>
            <div className="flex gap-3">
              {([
                { key: 'letter' as const, label: 'INICIAL' },
                { key: 'marble' as const, label: 'FIGURA' },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAvatarType(opt.key)}
                  className={`flex-1 py-3 border-4 border-black dark:border-white font-black uppercase tracking-wider text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    avatarType === opt.key
                      ? 'bg-yellow-400 dark:bg-yellow-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                      : 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-none'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatar(color)}
                  className={`w-full aspect-square border-4 border-black dark:border-white flex items-center justify-center transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    avatar === color
                      ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]'
                      : 'shadow-none'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {avatar === color && (
                    <Check size={20} strokeWidth={3} className="text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !nickname.trim()}
          className="w-full flex items-center justify-center gap-2 py-5 border-4 border-black dark:border-white bg-yellow-400 dark:bg-yellow-500 text-black font-black uppercase tracking-wider text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="animate-pulse">GUARDANDO...</span>
          ) : saved ? (
            <>
              <Check size={24} strokeWidth={3} />
              GUARDADO
            </>
          ) : (
            <>
              <Save size={24} strokeWidth={2.5} />
              GUARDAR PERFIL
            </>
          )}
        </button>
      </div>
    </div>
  )
}
