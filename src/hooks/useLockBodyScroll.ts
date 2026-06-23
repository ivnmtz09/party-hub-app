import { useEffect } from 'react'

export default function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.height = 'auto'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.height = 'auto'
    }
  }, [isLocked])
}
