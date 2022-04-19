import type monaco from 'monaco-editor';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import type { TModule } from '$lib/modules';

export type TMonaco = typeof monaco;
export type TContext = Window & typeof globalThis;
let Monaco: TMonaco;

const filePrefix = "file:///";
const fileName = "main";
const fileExtension = ".ts";
const fullFileName = `${filePrefix}${fileName}${fileExtension}`;

const setupEditor = async (context: TContext): Promise<TMonaco> => {
  context['MonacoEnvironment'] = {
    getWorker: function (_moduleId: any, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    }
  };

  Monaco = await import('monaco-editor');

  Monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: Monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true
  });
  return Monaco;
}

export type TEditorHandle = { editor: monaco.editor.IStandaloneCodeEditor, dispose: () => void };

export const createEditor = async (context: TContext, starterCode: string, containerDiv: HTMLDivElement, modulesToInclude?: TModule[]): Promise<TEditorHandle> => {
  await setupEditor(context);
  modulesToInclude?.forEach((module) => {
    Monaco.languages.typescript.typescriptDefaults.addExtraLib(
      module.code,
      `${filePrefix}${module.path}`
    );
  });

  const model = Monaco.editor.createModel(
    starterCode,
    'typescript',
    Monaco.Uri.parse(fullFileName)
  );

  const editor = Monaco.editor.create(containerDiv, { model });

  return {
    editor,
    dispose: () => {
      editor.dispose();
    }
  }
}

export const compileEditorToJs = async (): Promise<TModule> => {
  const model = Monaco.editor.getModel(Monaco.Uri.parse(fullFileName));
  const worker = await Monaco.languages.typescript
    .getTypeScriptWorker()
    .then((p) => p(model.uri));
  const result = await worker.getEmitOutput(model.uri.toString());
  const { text } = result.outputFiles.find((o) => o.name.endsWith('.js') || o.name.endsWith('.jsx'));
  return {
    path: fileName,
    code: text,
    isEntry: true
  };
}