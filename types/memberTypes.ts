import { TAsyncFunction, TFunction, TKeysMatching, TKeysNotMatching } from "./utilityTypes";

export type TMemberMethodNames<TBase> = TKeysMatching<TBase, TFunction>;
export type TMemberAsyncMethodNames<TBase> = TKeysMatching<TBase, TAsyncFunction> & TMemberMethodNames<TBase>;
export type TMemberPropertyNames<TBase> = TKeysNotMatching<TBase, TFunction>;
export type TMemberMethods<TBase> = { [Key in keyof TBase]: TBase[Key] extends TFunction ? TBase[Key] : never };
export type TMemberMethodParams<TBase> = { [Key in keyof TBase]: TBase[Key] extends TFunction ? Parameters<TBase[Key]> : never };
export type TMemberMethodReturns<TBase> = { [Key in keyof TBase]: TBase[Key] extends TFunction ? ReturnType<TBase[Key]> : never };