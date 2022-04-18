import { currentMechanism } from "./SubscriptionMechanism";
import type IInstructable from "./types/IInstructable";
import type { TMemberMethodNames, TMemberMethodParams, TMemberMethodReturns, TMemberMethods, TMemberPropertyNames } from "./types/memberTypes";

const ask = <T,>(obj: T): IInstructable<T> => ({
  to<TName extends TMemberMethodNames<T>>(methodName: TName, ...params: TMemberMethodParams<T>[TName]): TMemberMethodReturns<T>[TName] {
    return currentMechanism.process<TMemberMethodReturns<T>[TName]>(obj, methodName, () => (obj[methodName] as TMemberMethods<T>[TName])(...params as []), params);
  },
  whatIsIts<TName extends TMemberPropertyNames<T>>(propertyName: TName): T[TName] {
    return obj[propertyName];
  }
});

export default ask;