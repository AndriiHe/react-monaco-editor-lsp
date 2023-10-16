import {
  createConnection,
  BrowserMessageReader,
  BrowserMessageWriter,
  TextDocumentSyncKind,
} from 'vscode-languageserver/browser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver';

import type {
  InitializeParams,
  InitializedParams,
  InitializeResult,
  ServerCapabilities,
  TextDocumentChangeEvent,
  CompletionItem,
  CompletionParams,
} from 'vscode-languageserver';

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

const connection = createConnection(messageReader, messageWriter);
const documents = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  console.log('onInitialize', _params);
  const capabilities: ServerCapabilities = {
    completionProvider: {
      resolveProvider: true,
      triggerCharacters: [' ', '\n', '\\', '/', '"', "'"],
    },
    textDocumentSync: TextDocumentSyncKind.Incremental,
  };
  return { capabilities };
});

connection.onInitialized(async (params: InitializedParams) => {
  console.log('onInitialized', params);
});

connection.onCompletion((params: CompletionParams) => {
  console.log('onCompletion', params);
  return [];
});
connection.onCompletionResolve((item: CompletionItem) => {
  console.log('onCompletionResolve', item);
  return item;
});

documents.onDidChangeContent((event: TextDocumentChangeEvent<TextDocument>) => {
  console.log('onDidChangeContent', event);
});

documents.onDidOpen((event: TextDocumentChangeEvent<TextDocument>) => {
  console.log('onDidOpen', event);
});

documents.onDidClose((event: TextDocumentChangeEvent<TextDocument>) => {
  console.log('onDidClose', event);
  connection.sendDiagnostics({
    uri: event.document.uri,
    diagnostics: [],
  });
});

documents.listen(connection);
connection.listen();
