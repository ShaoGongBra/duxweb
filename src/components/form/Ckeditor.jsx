import React, {Component} from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
export function Ckeditor({value, onChange}) {

  return (
    <CKEditor
      className='h-100'
      editor={ ClassicEditor }
      data={value}
      onReady={ editor => {
        // You can store the "editor" and use when it is needed.
        console.log( 'Editor is ready to use!', editor );
      } }
      onChange={ ( event, editor ) => {
        const data = editor.getData();
        onChange && onChange(data)
      } }
      onBlur={ ( event, editor ) => {
        console.log( 'Blur.', editor );
      } }
      onFocus={ ( event, editor ) => {
        console.log( 'Focus.', editor );
      } }
    />
  )
}
