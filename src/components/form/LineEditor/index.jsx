import React from 'react'
import EditorJS from '@editorjs/editorjs'
import { useEffect, useRef } from 'react'

// 段落 文本
import Paragraph from '@editorjs/paragraph'
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

// 自定义组件
import { ImageTool, VideoTool } from './tools'

export const LineEditor = ({
  value,
  onChange,
  placeholder = '请输入',
  disabled
}) => {

  const dom = useRef(null)

  const editor = useRef(null)

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const currentValue = useRef('')

  useEffect(() => {
    editor.current = new EditorJS({
      holder: dom.current,
      placeholder,
      onChange: (api, event) => {
        editor.current.save().then(outputData => {
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
          class: Paragraph,
          config: {
            placeholder: placeholder
          },
          // inlineToolbar: false,
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
        messages: {
          /**
           * Other below: translation of different UI components of the editor.js core
           */
          ui: {
            'blockTunes': {
              'toggler': {
                'Click to tune': '单击操作',
                'or drag to move': '或者拖动到此处'
              },
            },
            'inlineToolbar': {
              'converter': {
                'Convert to': '转换为'
              }
            },
            'toolbar': {
              'toolbox': {
                'Add': '添加',
              }
            },
            popover: {
              'Filter': '筛选',
              'Nothing found': '没有结果'
            }
          },

          /**
           * Section for translation Tool Names: both block and inline tools
           */
          toolNames: {
            'Text': '段落',
            'Heading': '标题'
          },

          /**
           * Section for passing translations to the external tools classes
           */
          tools: {
            /**
             * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
             * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
             */
            warning: { // <-- 'Warning' tool will accept this dictionary section
              'Title': '标题',
              'Message': '消息',
            },

            /**
             * Link is the internal Inline Tool
             */
            link: {
              'Add a link': '添加链接'
            },
            /**
             * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
             */
            stub: {
              'The block can not be displayed correctly.': '无法正确显示'
            },
            header: {
              'Heading 1': '一级标题',
              'Heading 2': '二级标题',
              'Heading 3': '三级标题',
              'Heading 4': '四级标题',
              'Heading 5': '五级标题',
              'Heading 6': '六级标题'
            }
          },

          /**
           * Section allows to translate Block Tunes
           */
          blockTunes: {
            /**
             * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
             * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
             *
             * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
             */
            'delete': {
              'Delete': '删除'
            },
            'moveUp': {
              'Move up': '上移'
            },
            'moveDown': {
              'Move down': '下移'
            }
          },
        }
      }
    })
    // console.log(editor)
    return () => {
      editor.current.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (value && currentValue.current !== value) {
      try {
        const _value = JSON.parse(value)
        if (_value.blocks && _value.time && _value.version) {
          editor.current.render(_value)
        } else {
          throw '不是此编辑器保存的数据，无法编辑：' + _value
        }
      } catch (error) {
        console.log('不是正确的编辑器JSON数据', error)
      }

    }
  }, [value])

  return <div ref={dom}>

  </div>
}