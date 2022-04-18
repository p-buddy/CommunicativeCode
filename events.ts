import type IEnqueuedInstructable from "./types/IEnqueuedInstructable";
import type { TMemberMethodNames, TMemberMethodParams, TMemberMethodReturns } from "./types/memberTypes";
import type { TResolved } from "./types/utilityTypes";
import ask from "./ask";
import { currentMechanism, ESubscriptionPeriod } from "./SubscriptionMechanism";

export const before = <T, TName extends TMemberMethodNames<T>>(obj: T, methodName: TName) => ({
  ask<TSubscriber>(sub: TSubscriber): IEnqueuedInstructable<TSubscriber> {
    return {
      to<TName extends TMemberMethodNames<TSubscriber>>(subMethod: TName, ...params: TMemberMethodParams<TSubscriber>[TName]): void {
        currentMechanism.add(obj, methodName, ESubscriptionPeriod.Before, () => ask(sub).to(subMethod, ...params))
      }
    };
  },
  first(callback: (...params: TMemberMethodParams<T>[TName]) => void): void {
    currentMechanism.add(obj, methodName, ESubscriptionPeriod.Before, callback);
  }
});

export const after = <T, TName extends TMemberMethodNames<T>>(obj: T, methodName: TName) => ({
  ask<TSubscriber>(sub: TSubscriber): IEnqueuedInstructable<TSubscriber> {
    return {
      to<TName extends TMemberMethodNames<TSubscriber>>(subMethod: TName, ...params: TMemberMethodParams<TSubscriber>[TName]): void {
        currentMechanism.add(obj, methodName, ESubscriptionPeriod.After, () => ask(sub).to(subMethod, ...params));
      }
    };
  },
  finally(callback: (result: TResolved<TMemberMethodReturns<T>[TName]> | Awaited<TMemberMethodReturns<T>[TName]>, ...params: TMemberMethodParams<T>[TName]) => void): void {
    currentMechanism.add(obj, methodName, ESubscriptionPeriod.After, callback);
  }
});

export const when = <T, TName extends TMemberMethodNames<T>>(obj: T, methodName: TName) => ({
  ask<TSubscriber>(sub: TSubscriber): IEnqueuedInstructable<TSubscriber> {
    return {
      to<TName extends TMemberMethodNames<TSubscriber>>(subMethod: TName, ...params: TMemberMethodParams<TSubscriber>[TName]): void {
        currentMechanism.add(obj, methodName, ESubscriptionPeriod.Concurrent, () => ask(sub).to(subMethod, ...params))
      }
    };
  },
  also(callback: (...params: TMemberMethodParams<T>[TName]) => void): void {
    currentMechanism.add(obj, methodName, ESubscriptionPeriod.Concurrent, callback);
  }
});