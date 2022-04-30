export type TIndexer = string | number | symbol;
export type TFunction = ((...args: any) => any);
export type TAsyncFunction = ((...args: any) => Promise<any>);
export type TResolved<T> = T extends Promise<any> ? Awaited<T> : T;

export type TKeysMatching<TBase, TDesiredType> = { [K in keyof TBase]-?: TBase[K] extends TDesiredType ? K : never }[keyof TBase];
export type TKeysNotMatching<TBase, TDesiredType> = { [K in keyof TBase]-?: TBase[K] extends TDesiredType ? never : K }[keyof TBase];

export type RequireKey<T, K extends keyof T> =
  { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: T[P] }

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};