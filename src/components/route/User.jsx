import React, { useEffect, useMemo, memo, useCallback, useState } from 'react'
import { user } from '../../utils'

export default memo(({ children, system }) => {
  const { UserLogin, force, isLogin } = useMemo(() => {
    return { ...user.getCurrentConfig(system), isLogin: user.isLogin() }
  }, [system])

  const [showLogin, setShowLogin] = useState(!isLogin)

  useEffect(() => {
    const { remove } = user.onLoginStatus(status => {
      // 退出登录
      if (!status) {
        setShowLogin(true)
      }
    })
    return () => remove()
  }, [])

  const login = useCallback(info => {
    user.setInfo(info)
    user.setLoginStatus(true, 'account')
    setShowLogin(false)
  }, [])

  return (
    <>
      {force ? (
        <>{showLogin ? <UserLogin onLogin={login} /> : children}</>
      ) : (
        <>
          {children}
          <div>
            <UserLogin onLogin={login} />
          </div>
        </>
      )}
    </>
  )
})
