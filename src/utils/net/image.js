
export const imageAction = (() => {
  const getObjectURL = file => {
    if (typeof file === 'string') {
      return file
    }
    let url = null
    // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已
    if (window.createObjectURL != undefined) { // basic
      url = window.createObjectURL(file)
    } else if (window.URL != undefined) { // mozilla(firefox)
      url = window.URL.createObjectURL(file)
    } else if (window.webkitURL != undefined) { // webkit or chrome
      url = window.webkitURL.createObjectURL(file)
    }
    return url
  }

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const getImage = url => {
    return new Promise((resolve => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = getObjectURL(url)
      img.onload = () => {
        resolve(img)
      }
    }))
  }
  return async (file, {
    // 宽度
    width,
    // 高度
    height,
    mode = 'aspectFill',
    // 压缩质量
    quality = 0.8,
    // 添加logo
    logo,
    // logo位置
    logoPosition = 5,
    // 水印
    watermark
  } = {}) => {
    if (file.type === 'image/gif' || (!width && !height && !logo && (file.type === 'image/png' || quality === 1))) {
      return file
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = await getImage(file)

    if (!width && height) {
      width = img.width / img.height * height
    } else if (!height && width) {
      height = img.height / img.width * width
    } else if (!width || !height) {
      width = img.width
      height = img.height
    }
    canvas.width = width
    canvas.height = height

    // 填满图片
    if (mode === 'scale') {
      // 缩放
      ctx.drawImage(img, 0, 0, width, height)
    } else if (mode === 'aspectFit') {
      // 缩放 使图片的长边能完整显示出来 也就是能把图片完整显示出来
      const scale = [width / height, img.width / img.height]
      if (scale[0] > scale[1]) {
        ctx.drawImage(
          img,
          (width - (scale[1] * height)) / 2,
          0,
          scale[1] * height,
          height
        )
      } else {
        ctx.drawImage(
          img,
          0,
          (height - (width / scale[1])) / 2,
          width,
          width / scale[1]
        )
      }
    } else if (mode === 'aspectFill') {
      // 缩放 使图片的短边能完整显示出来 也就是图片长边会被裁剪
      const scale = [width / height, img.width / img.height]
      if (scale[0] < scale[1]) {
        ctx.drawImage(
          img,
          (width - scale[1] * height) / 2,
          0,
          scale[1] * height,
          height
        )
      } else {
        ctx.drawImage(
          img,
          0,
          -(width / scale[1] - height) / 2,
          width,
          width / scale[1]
        )
      }
    }

    // 添加logo
    if (logo) {
      logo = await getImage(logo)
      ctx.drawImage(
        logo,
        width / 2 - logo.width / 2 + ((logoPosition - 1) % 3 - 1) * ((width - logo.width) / 2),
        height / 2 - logo.height / 2 + (((logoPosition - 1) / 3 | 0) - 1) * ((height - logo.height) / 2),
        logo.width,
        logo.height
      )
    }
    // 添加水印
    if (watermark) { /* empty */ }

    //调用
    return dataURLtoFile(canvas.toDataURL(file.type, quality), file.name)
  }
})()