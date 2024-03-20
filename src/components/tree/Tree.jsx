import React, { useEffect, useState } from 'react'
import { Tree, Input, Message } from '@arco-design/web-react'
import { request } from '../../utils'

export function UrlTree({ url, ...props }) {
  const [treeData, setTreeData] = useState([]);
  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    request({
      url: url,
      method: 'GET'
    })
      .then(res => {
        setTreeData(res?.list || [])
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [url])

  return <div className={'h-full'}>
    <Input.Search
      style={{
        marginBottom: 8,
      }}
      onChange={setInputValue}
    />
    {!!treeData.length && <Tree
      className={'overflow-y-auto h-9/10'}
      treeData={treeData}
      autoExpandParent
      renderTitle={({ title }) => {
        if (inputValue) {
          const index = title.toLowerCase().indexOf(inputValue.toLowerCase());
          if (index === -1) {
            return title;
          }
          const prefix = title.substr(0, index);
          const suffix = title.substr(index + inputValue.length);
          return (
            <span>
              {prefix}
              <span style={{ color: 'var(--color-primary-light-4)' }}>
                {title.substr(index, inputValue.length)}
              </span>
              {suffix}
            </span>
          );
        }
        return title
      }}
      {...props}
    />}
  </div>
}
