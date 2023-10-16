import * as React from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useState } from 'react';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser';
import { CloseAction, ErrorAction, MonacoLanguageClient } from 'monaco-languageclient';

import type { MessageTransports } from 'monaco-languageclient';

loader.config({ monaco });

const worker = new Worker(
  new URL('../worker.ts', import.meta.url),
  { type: 'module' },
);
const reader = new BrowserMessageReader(worker);
const writer = new BrowserMessageWriter(worker);

function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'Language Client',
    clientOptions: {
      documentSelector: ['yaml', 'json'],
      errorHandler: {
        error: () => {
          console.error('Error happened');
          return { action: ErrorAction.Continue };
        },
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    connectionProvider: {
      get: () => Promise.resolve(transports),
    },
  });
}

export function CodeEditor() {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
  };

  React.useEffect(() => {
    if (!isEditorReady || !editorRef.current) {
      return;
    }

    const languageClient = createLanguageClient({ reader, writer });

    languageClient.start();

    reader.onClose(() => {
      return languageClient.stop();
    });
  }, [isEditorReady]);

  return <Editor
    height="100vh"
    defaultLanguage="yaml"
    onMount={onMount}
    defaultValue=""
  />;
}