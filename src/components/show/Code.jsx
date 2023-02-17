import React, { useEffect, useState } from 'react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark as darkTheme, coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {useThemeDark} from "../../utils";

export function Code({children, language}) {
  const [dark] = useThemeDark()
  return (
    <SyntaxHighlighter language={language} style={dark ?darkTheme : lightTheme} className="border border-color-2 rounded !p-4">
      {children}
    </SyntaxHighlighter>
  )
}
