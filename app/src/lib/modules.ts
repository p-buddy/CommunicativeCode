export const enum EModuleType {
  Typescript,
  Javascript,
  SourceMap
}

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

const matchesType = (file: string, type: EModuleType): boolean => file.endsWith(fileEndings[type]);

const getFileType = (file: string): EModuleType => {
  if (matchesType(file, EModuleType.Typescript)) return EModuleType.Typescript;
  if (matchesType(file, EModuleType.Javascript)) return EModuleType.Javascript;
  if (matchesType(file, EModuleType.SourceMap)) return EModuleType.SourceMap;
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

const getFilesToInclude = async (): Promise<string[]> => {
  const includeFileLocation = 'include.txt';

  const splitOnNewLines = (text: string): string[] => text.split(/\r?\n/);
  const isNotWhitespace = (text: string): boolean => text.trim() !== '';
  const filterOutWhiteSpace = (strings: string[]): string[] => strings.filter(isNotWhitespace)
  const isRelevant = (file: string) => file.endsWith(fileEndings[EModuleType.Javascript]) ||
    file.endsWith(fileEndings[EModuleType.Typescript]) ||
    file.endsWith(fileEndings[EModuleType.SourceMap]);
  const filterOutIrrelevant = (strings: string[]): string[] => strings.filter(isRelevant)


  return await fetch(includeFileLocation, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .then((r) => r.text())
    .then(splitOnNewLines)
    .then(filterOutWhiteSpace)
    .then(filterOutIrrelevant);
}

const getCodeContent = async (location: string): Promise<string> => {
  return await fetch(location, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/javascript'
    }
  }).then((r) => r.text());
};

export const getModules = async (): Promise<TModuleMap> => {
  if (Object.keys(moduleMap).length > 0) return moduleMap;

  const files = await getFilesToInclude();

  const rootDir = 'base/';
  const modules: TModule[] = await Promise.all(
    files.map((path) => getCodeContent(path).then((code) => ({
      path: path.replace(rootDir, ''),
      code,
      isEntry: false,
    }))
    )
  );

  modules.forEach(module => {
    const type: EModuleType = getFileType(module.path);
    const name: TModuleName = getModuleName(module.path, type);
    name in moduleMap ? moduleMap[name][type] = module : moduleMap[name] = { ...emptyCompiledModule, [type]: module };
  });

  return moduleMap;
}

export const getModulesOfType = async (type: EModuleType): Promise<TModule[]> => {
  const map = await getModules();
  const modules = [];
  for (const key in map) {
    if (map[key][type] !== undefined) modules.push(map[key][type]);
  }
  return modules;
}