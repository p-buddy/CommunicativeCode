export const enum EModuleType {
  Typescript,
  Javascript,
  SourceMap
}

const allModuleTypes: EModuleType[] = [
  EModuleType.Javascript,
  EModuleType.Typescript,
  EModuleType.SourceMap
];

export type TModule = {
  path: string;
  code: string;
  isEntry: boolean;
};

export type TModuleName = string;

const fileEndings: Record<EModuleType, string> = {
  [EModuleType.Typescript]: ".ts",
  [EModuleType.Javascript]: ".js",
  [EModuleType.SourceMap]: ".js.map"
}

const getFileType = (file: string): EModuleType => {
  for (const type of allModuleTypes) {
    if (file.endsWith(fileEndings[type])) return type;
  }
  throw new Error(`Unknown file type: ${file}`);
}

const getModuleName = (file: string, type: EModuleType): TModuleName => file.replace(fileEndings[type], "");

export type TCompiledModule = Record<EModuleType, TModule>;

const emptyCompiledModule: TCompiledModule = {
  [EModuleType.Typescript]: undefined,
  [EModuleType.Javascript]: undefined,
  [EModuleType.SourceMap]: undefined,
}

export type TModuleMap = { [key: TModuleName]: TCompiledModule };

const moduleMap: TModuleMap = {};

const modulesByType: Record<EModuleType, TModule[]> = {
  [EModuleType.Typescript]: [],
  [EModuleType.Javascript]: [],
  [EModuleType.SourceMap]: [],
}

const splitOnNewLines = (text: string): string[] => text.split(/\r?\n/);
const isNotWhitespace = (text: string): boolean => text.trim() !== '';
const filterOutWhiteSpace = (strings: string[]): string[] => strings.filter(isNotWhitespace)

let availableFiles: string[];
const getAvailableFiles = async () => {
  if (availableFiles) return availableFiles;
  availableFiles = await fetch(includeFileLocation, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .then((r) => r.text())
    .then(splitOnNewLines)
    .then(filterOutWhiteSpace);
  return availableFiles;
}

const codeLocation = 'base/';
const exampleIdentifier = "example_";
const isSupportedFile = (file): boolean => allModuleTypes.some(type => file.endsWith(fileEndings[type]));
const isExampleFile = (file: string) => file.includes(exampleIdentifier);
const includeFileLocation = 'include.txt';

const getMatchingIncludedFiles = async (match: (file: string) => boolean): Promise<string[]> => {
  const filterOutIrrelevant = (strings: string[]): string[] => strings.filter(match);
  return await getAvailableFiles().then(filterOutIrrelevant);
}

const getCodeContent = async (location: string): Promise<string> => {
  return await fetch(location, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/javascript'
    }
  }).then((r) => r.text());
};

const getContentAsModule = async (path: string): Promise<TModule> => getCodeContent(path).then((code) => ({
  path: path.replace(codeLocation, ''),
  isEntry: false,
  code,
}));

const retrieveModules = async (files: string[]): Promise<TModule[]> => Promise.all(files.map(getContentAsModule));

export const getExampleModules = async (): Promise<TModule[]> => {
  const matchExampleModule = (file: string) => isExampleFile(file) && file.endsWith(fileEndings[EModuleType.Typescript])
  const files = await getMatchingIncludedFiles(matchExampleModule);
  const removeExampleIdentifier = (mods: TModule[]) => mods.map(mod => ({
    ...mod,
    path: mod.path.replace(exampleIdentifier, '')
  }));
  return retrieveModules(files).then(removeExampleIdentifier);
}

export const getRequiredModules = async (): Promise<TModuleMap> => {
  if (Object.keys(moduleMap).length > 0) return moduleMap;

  const matchRequiredModule = (file: string) => !isExampleFile(file) && isSupportedFile(file);
  const files = await getMatchingIncludedFiles(matchRequiredModule);
  const modules: TModule[] = await retrieveModules(files);

  modules.forEach(module => {
    const type: EModuleType = getFileType(module.path);
    const name: TModuleName = getModuleName(module.path, type);
    name in moduleMap ?
      moduleMap[name][type] = module :
      moduleMap[name] = { ...emptyCompiledModule, [type]: module };
  });

  for (const key in moduleMap) {
    allModuleTypes.forEach(type => modulesByType[type].push(moduleMap[key][type]));
  }

  return moduleMap;
}

export const getRequiredModulesOfType = async (type: EModuleType): Promise<TModule[]> => {
  await getRequiredModules();
  return modulesByType[type];
}