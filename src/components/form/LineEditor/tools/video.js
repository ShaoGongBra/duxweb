import { upload } from '../../../../utils'
import './common.css'

const icons = {
  image: '<svg t="1689930424722" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1514" width="64" height="64"><path d="M853.333333 195.047619a73.142857 73.142857 0 0 1 73.142857 73.142857v487.619048a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667a73.142857 73.142857 0 0 1-73.142857-73.142857V268.190476a73.142857 73.142857 0 0 1 73.142857-73.142857h682.666666z m0 73.142857H170.666667v487.619048h682.666666V268.190476z m-414.086095 84.406857a48.761905 48.761905 0 0 1 24.185905 6.412191l194.291809 111.030857a48.761905 48.761905 0 0 1 0 84.675048l-194.31619 111.006476a48.761905 48.761905 0 0 1-72.923429-42.325334v-222.037333a48.761905 48.761905 0 0 1 48.761905-48.761905z m24.380952 90.745905v138.020572l120.758858-68.998096-120.734477-68.998095z" p-id="1515"></path></svg>'
}

export class VideoTool {
  static get toolbox() {
    return {
      title: '视频',
      icon: icons.image,
    }
  }

  constructor({ data }) {
    this.data = data
  }

  _render(container, src) {
    if (typeof src === 'number') {
      // 上传进度
      const add = document.createElement('div')
      add.innerHTML = `<div class="upload-loading"></div><span>${(Math.min(src * 100, 100)).toFixed(1)}%</span>`
      add.classList.add('upload-box')
      container.innerHTML = ''
      container.appendChild(add)
    } else if (src) {
      const video = document.createElement('video')
      video.setAttribute('src', this.data?.src)
      video.setAttribute('style', 'width: 100%;height: 360px;background-color: #000;')
      video.setAttribute('controls', 'controls')
      container.innerHTML = ''
      container.appendChild(video)
    } else {
      const add = document.createElement('div')
      add.innerHTML = '上传视频'
      add.classList.add('upload-box')
      add.addEventListener('click', () => {
        this.upload()
      })
      container.innerHTML = ''
      container.appendChild(add)
    }
  }

  render() {
    const container = document.createElement('div')
    this._render(container, this.data?.src)
    this.container = container
    return container
  }

  save(blockContent) {
    return {
      ...this.data,
      // src: blockContent.src
    }
  }

  /**
   * 添加之后出发
   *
   * @public
   */
  appendCallback() {
    this.upload()
  }

  upload() {
    upload({
      accept: 'video/*',
      uploadType: 'drive'
    }).start(() => {
      this._render(this.container, 0)
    }).progress(progress => {
      this._render(this.container, progress)
    }).then(res => {
      this.data.src = res[0]
      this._render(this.container, res[0])
    }).catch(err => {
      this._render(this.container, this.data.src)
    })
  }

  renderSettings() {
    return [
      {
        label: '上传替换',
        icon: icons.image,
        closeOnActivate: true,
        onActivate: () => this.upload()
      }
    ]
  }
}