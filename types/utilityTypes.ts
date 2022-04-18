export type TIndexer = string | number | symbol;
export type TFunction = Function & ((...args: any) => any);
export type TAsyncFunction = Function & ((...args: any) => Promise<any>);
export type TResolved<T> = T extends Promise<any> ? Awaited<T> : T;

export type TKeysMatching<TBase, TDesiredType> = { [K in keyof TBase]-?: TBase[K] extends TDesiredType ? K : never }[keyof TBase];
export type TKeysNotMatching<TBase, TDesiredType> = { [K in keyof TBase]-?: TBase[K] extends TDesiredType ? never : K }[keyof TBase];