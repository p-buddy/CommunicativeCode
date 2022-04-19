import type monaco from 'monaco-editor';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import type { TModule } from '$lib/modules';
import * as diff from 'diff';
import { mode } from '$app/env';

export type TMonaco = typeof monaco;
export type TContext = Window & typeof globalThis;
let Monaco: TMonaco;

const filePrefix = "file:///";
const fileName = "main";
const fileExtension = ".ts";
const fullFileName = `${filePrefix}${fileName}${fileExtension}`;

const setupEditor = async (context: TContext, modulesToInclude?: TModule[]): Promise<TMonaco> => {
  if (!context['MonacoEnvironment']) {
    context['MonacoEnvironment'] = {
      getWorker: function (_moduleId: any, label: string) {
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker();
        }
        return new editorWorker();
      }
    };
  }

  if (Monaco) return;

  Monaco = await import('monaco-editor');

  Monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: Monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    sourceMap: true,
    inlineSourceMap: true,
  });

  modulesToInclude?.forEach((module) => {
    Monaco.languages.typescript.typescriptDefaults.addExtraLib(
      module.code,
      `${filePrefix}${module.path}`
    );
  });

  return Monaco;
}


export const createEditor = async (context: TContext, starterCode: string, containerDiv: HTMLDivElement, modulesToInclude?: TModule[], filename?: string): Promise<monaco.editor.IStandaloneCodeEditor> => {
  await setupEditor(context, modulesToInclude);

  const model = Monaco.editor.createModel(
    starterCode,
    'typescript',
    filename ? Monaco.Uri.parse(filename) : Monaco.Uri.parse(fullFileName)
  );

  return Monaco.editor.create(containerDiv, { model });
}

const getJsFromRaw = async (raw: string): Promise<string> => {
  const linePreservingComment = "// <preserve line>";
  const newlinesReplacedWithComments = raw.split(/\r?\n/).map((line) => line.trim() === '' ? linePreservingComment : line).join("\n");
  const model = Monaco.editor.createModel(newlinesReplacedWithComments, 'typescript');
  const worker = await Monaco.languages.typescript
    .getTypeScriptWorker()
    .then((p) => p(model.uri));
  const result = await worker.getEmitOutput(model.uri.toString());
  model.dispose();
  const { text } = result.outputFiles.find((o) => o.name.endsWith('.js') || o.name.endsWith('.jsx'));
  return text.split(/\r?\n/).map((line) => line.replace(linePreservingComment, '')).join("\n");
}

export const compileEditorToJs = async (): Promise<TModule> => {
  const { uri } = Monaco.editor.getModel(Monaco.Uri.parse(fullFileName));

  const worker = await Monaco.languages.typescript
    .getTypeScriptWorker()
    .then((p) => p(uri));

  const raw = await worker.getScriptText(uri.toString());
  const code = await getJsFromRaw(raw);
  return { path: fileName, code, isEntry: true };
}
