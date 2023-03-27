export const asyncTimeOut = time => {
  let resolveFunc
  let rejectFunc
  const pro = new Promise((resolve, reject) => {
    resolveFunc = resolve
    rejectFunc = reject
  })
  const timer = setTimeout(() => resolveFunc({ code: 200, message: '倒计时结束', type: 'timeout' }), time)
  pro.clear = () => {
    clearTimeout(timer)
    rejectFunc({ code: 500, message: '清除倒计时' })
  }
  return pro
}

export const noop = () => undefined

export const loadScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src

    script.addEventListener('load', () => {
      resolve()
    })

    script.addEventListener('error', (error) => {
      reject(error);
    })

    document.body.appendChild(script)
  })
}