export async function waitForCondition(condition: () => boolean, delay = 100): Promise<void> {
  let timeout: NodeJS.Timeout;
  while (!condition()) {
    await new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(resolve, delay);
    });
  }
  clearTimeout(timeout);
};

export async function waitForObject<T>(getter: () => T, delay = 100): Promise<T> {
  await waitForCondition(() => getter() !== undefined, delay);
  return getter();
}

export const loadExternalSrcipt = async <TScriptObjectType>(url: string, scriptObjectName: string): TScriptObjectType => {
  const script = document.createElement('script');
  script.src = url;
  let object: TScriptObjectType = undefined;
  script.onload = () => (object = window[scriptObjectName]);
  script.onerror = (e) => { throw new Error(`Could not load rollup: ${e}`) };
  document.querySelector('head').appendChild(script);
  await waitForObject<TScriptObjectType>(() => object);
  return object;
}

export const convertCodeToUrl = (code: string): { url: string, revoke: () => void } => {
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}