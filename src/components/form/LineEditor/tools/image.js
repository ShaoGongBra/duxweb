import { upload } from '../../../../utils'

const icons = {
  image: '<svg t="1689930477958" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2544" width="64" height="64"><path d="M938.666667 553.92V768c0 64.8-52.533333 117.333333-117.333334 117.333333H202.666667c-64.8 0-117.333333-52.533333-117.333334-117.333333V256c0-64.8 52.533333-117.333333 117.333334-117.333333h618.666666c64.8 0 117.333333 52.533333 117.333334 117.333333v297.92z m-64-74.624V256a53.333333 53.333333 0 0 0-53.333334-53.333333H202.666667a53.333333 53.333333 0 0 0-53.333334 53.333333v344.48A290.090667 290.090667 0 0 1 192 597.333333a286.88 286.88 0 0 1 183.296 65.845334C427.029333 528.384 556.906667 437.333333 704 437.333333c65.706667 0 126.997333 16.778667 170.666667 41.962667z m0 82.24c-5.333333-8.32-21.130667-21.653333-43.648-32.917333C796.768 511.488 753.045333 501.333333 704 501.333333c-121.770667 0-229.130667 76.266667-270.432 188.693334-2.730667 7.445333-7.402667 20.32-13.994667 38.581333-7.68 21.301333-34.453333 28.106667-51.370666 13.056-16.437333-14.634667-28.554667-25.066667-36.138667-31.146667A222.890667 222.890667 0 0 0 192 661.333333c-14.464 0-28.725333 1.365333-42.666667 4.053334V768a53.333333 53.333333 0 0 0 53.333334 53.333333h618.666666a53.333333 53.333333 0 0 0 53.333334-53.333333V561.525333zM320 480a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0-64a32 32 0 1 0 0-64 32 32 0 0 0 0 64z" fill="#000000" p-id="2545"></path></svg>'
}

export class ImageTool {
  static get toolbox() {
    return {
      title: '图片',
      icon: icons.image,
    }
  }

  constructor({ data }) {
    this.data = data
  }

  _render(container, src) {
    if (src) {
      const img = document.createElement('img')
      img.setAttribute('src', this.data?.src)
      img.setAttribute('style', 'width: 100%;')
      container.innerHTML = ''
      container.appendChild(img)
    } else {
      const add = document.createElement('div')
      add.innerText = '上传图片'
      add.setAttribute('style', 'font-size: 14px;color: #333;padding: 15px 0;text-align: center;border: 1px solid #e2e2e2;')
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
      ...this.data
    }
  }

  upload() {
    upload({
      // capture,
      accept: 'image/*',
      isImage: true,
      quality: 0.8,
    }).then(res => {
      this.data.src = res[0]
      this._render(this.container, res[0])
    })
  }

  /**
   * 添加之后出发
   *
   * @public
   */
  appendCallback() {
    this.upload()
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