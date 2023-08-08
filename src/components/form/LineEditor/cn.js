export default {
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
      'Delete': '删除',
      'Click to delete': '点击确认删除'
    },
    'moveUp': {
      'Move up': '上移'
    },
    'moveDown': {
      'Move down': '下移'
    }
  },
}