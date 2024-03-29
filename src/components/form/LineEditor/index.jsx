import React, { useState } from 'react'
import EditorJS from '@editorjs/editorjs'
import { useEffect, useRef } from 'react'

// 段落 文本
// import Paragraph from '@editorjs/paragraph'
// 标题
import Header from '@editorjs/header'
// 文本颜色
import ColorPlugin from 'editorjs-text-color-plugin'
// 删除线
import Strikethrough from '@sotaproject/strikethrough'
// 下划线
import Underline from '@editorjs/underline'
// 对齐工具
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune'

// 拖拽插件
import DragDrop from 'editorjs-drag-drop'
// 撤销插件
// import Undo from 'editorjs-undo'

// 自定义组件
import { ImageTool, VideoTool } from './tools'

import cn from './cn'

import './index.scss'

export const LineEditor = ({
  value,
  onChange,
  placeholder = '请输入',
  disabled
}) => {

  const [isReady, setIsReady] = useState(false)

  const dom = useRef(null)

  const editor = useRef(null)

  // const undo = useRef(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const currentValue = useRef('')

  useEffect(() => {
    editor.current = new EditorJS({
      holder: dom.current,
      placeholder,
      onReady: () => {
        // undo.current = new Undo({ editor: editor.current })
        new DragDrop(editor.current)
        setIsReady(true)
      },
      onChange: (api, event) => {
        editor.current.save().then(outputData => {
          // console.log('saveData', outputData)
          currentValue.current = JSON.stringify(outputData)
          if (onChangeRef.current) {
            onChangeRef.current(currentValue.current)
          }
        }).catch((error) => {
          // console.log('Saving failed: ', error)
        });
      },
      inlineToolbar: ['bold', 'italic', 'Color', 'strikethrough', 'underline'],
      // readOnly: disabled,
      tools: {
        paragraph: {
          config: {
            placeholder: placeholder
          },
          tunes: ['AlignmentTuneTool']
        },
        header: {
          class: Header,
          config: {
            placeholder: placeholder
          },
          tunes: ['AlignmentTuneTool']
        },
        image: {
          class: ImageTool,
        },
        video: {
          class: VideoTool
        },
        Color: {
          class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
          config: {
            colorCollections: ['#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
            defaultColor: '#FF1300',
            type: 'text',
            customPicker: true // add a button to allow selecting any colour  
          }
        },
        Marker: {
          class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
          config: {
            defaultColor: '#FFBF00',
            type: 'marker',
            icon: '<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>'
          }
        },
        strikethrough: Strikethrough,
        underline: Underline,
        AlignmentTuneTool: {
          class: AlignmentTuneTool,
        }
      },
      i18n: {
        messages: cn
      }
    })
    // console.log(editor)
    return () => {
      editor.current?.destroy?.()
      editor.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isReady || !editor.current) {
      return
    }
    if (value && currentValue.current !== value) {
      try {
        const _value = JSON.parse(value)
        if (_value.blocks?.length && _value.time && _value.version) {
          editor.current.render(_value)
          // undo.initialize(_value)
        } else {
          throw '不是此编辑器保存的数据，无法编辑：' + _value
        }
      } catch (error) {
        console.log('不是正确的编辑器JSON数据', error)
      }

    }
  }, [value, isReady])

  return <div ref={dom} className='LineEditor'></div>
}