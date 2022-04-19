import type rollup from 'rollup';
import type { TModule } from '$lib/modules';
import { loadExternalSrcipt } from '$lib/jsUtils';

export type TRollup = typeof rollup;
let bundler: TRollup;

export async function loadRollup(): Promise<TRollup> {
  if (bundler) return bundler;
  bundler = await loadExternalSrcipt('https://unpkg.com/rollup/dist/rollup.browser.js', 'rollup');
  return bundler;
}

export const bundle = async (modules: TModule[]): Promise<string> => {
  const moduleById: { [k: string]: TModule } = {};

  modules.forEach((module) => {
    moduleById[module.path] = module;
  });

  const inputOptions: rollup.RollupOptions = {
    input: modules.filter((module) => module.isEntry).map((module) => module.path),
    plugins: [
      {
        name: 'custom',
        resolveId(importee, importer) {
          if (!importer) return importee;
          if (importee[0] !== '.') return false;

          let resolved = importee.replace(/^\.\//, '');
          if (resolved in moduleById) return resolved;

          resolved += '.js';
          if (resolved in moduleById) return resolved;
          throw new Error(`Could not resolve '${importee}' (${resolved}) from '${importer}'`);
        },
        load: function (id) {
          return moduleById[id].code;
        }
      }
    ],
    onwarn(warning) {
      console.group(warning.loc ? warning.loc.file : '');
      console.warn(warning.message);
      if (warning.frame) {
        console.log(warning.frame);
      }
      if (warning.url) {
        console.log(`See ${warning.url} for more information`);
      }
      console.groupEnd();
    }
  };

  const sourceMapUrlPrefix = "//# sourceMappingURL=";

  return await loadRollup()
    .then(roller => roller.rollup(inputOptions))
    .then(build => build.generate({ sourcemap: 'inline' }))
    .then(output => output.output[0])
    .then(chunk => [chunk.code, `${sourceMapUrlPrefix}${chunk.map.toUrl()}`].join("\n"));
};