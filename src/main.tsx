import React from 'react'
import { render } from 'react-dom'
import './index.css'
import { CodeEditor } from './components/CodeEditor.tsx';

render(
  <React.StrictMode>
    <CodeEditor />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement,
);
