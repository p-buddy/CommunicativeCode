import type { TMemberMethodNames, TMemberMethodParams, TMemberMethodReturns, TMemberPropertyNames } from "./memberTypes";

interface IInstructable<T> {
  to<TName extends TMemberMethodNames<T>>(methodName: TName, ...params: TMemberMethodParams<T>[TName]): TMemberMethodReturns<T>[TName];
  whatIsIts<TName extends TMemberPropertyNames<T>>(propertyName: TName): T[TName];
}

export default IInstructable;