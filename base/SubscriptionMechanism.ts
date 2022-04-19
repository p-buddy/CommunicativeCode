import type { TFunction, TIndexer } from "./types/utilityTypes";

type TEvent = Record<ESubscriptionPeriod, TFunction[]>;

type TSubscription = {
  topic: any;
  events: { [k: TIndexer]: TEvent };
}

export const enum ESubscriptionPeriod {
  Before,
  Concurrent,
  After
}

export class SubscribtionMechanism {
  subscriptions: TSubscription[];

  constructor() {
    this.subscriptions = [];
  }

  static ObjectIdentifier = "object";
  static FunctionIdentifier = "function";

  static isPromise(returnValue: any): boolean {
    return typeof returnValue === SubscribtionMechanism.ObjectIdentifier &&
      typeof returnValue?.then === SubscribtionMechanism.FunctionIdentifier
  };


  getSubscriptions(obj: any): TSubscription | undefined {
    return this.subscriptions.find(s => s.topic === obj);
  }

  getEvent(obj: any, eventName: TIndexer): TEvent | undefined {
    return this.getSubscriptions(obj)?.events[eventName];
  }

  getOrAddSubscriptions(obj: any): TSubscription {
    const subs = this.getSubscriptions(obj);
    if (subs !== undefined) return subs;
    const newEntry: TSubscription = { topic: obj, events: {} };
    this.subscriptions.push(newEntry);
    return newEntry;
  }

  getOrAddEvent(obj: any, eventName: TIndexer): TEvent {
    const subs = this.getOrAddSubscriptions(obj);
    const event = subs.events[eventName];
    if (event !== undefined) return event;
    const newEntry: TEvent = {
      [ESubscriptionPeriod.Before]: [],
      [ESubscriptionPeriod.Concurrent]: [],
      [ESubscriptionPeriod.After]: [],
    };
    subs.events[eventName] = newEntry;
    return newEntry;
  }

  process<TResult>(obj: any, name: TIndexer, callback: TFunction, params: []): TResult {
    const event = this.getEvent(obj, name);
    if (!event) return callback();

    event[ESubscriptionPeriod.Before]?.forEach(f => f(...params));

    const result = callback();
    event[ESubscriptionPeriod.Concurrent]?.forEach(f => f(...params));

    if (SubscribtionMechanism.isPromise(result)) {
      (result as Promise<any>).then((resolved) => event[ESubscriptionPeriod.After].forEach(f => f(resolved, ...params)));
    } else {
      event[ESubscriptionPeriod.After].forEach(f => f(result, ...params));
    }
    return result;
  }

  add(obj: any, name: TIndexer, period: ESubscriptionPeriod, callback: TFunction) {
    this.getOrAddEvent(obj, name)[period].push(callback);
  }
}

export const currentMechanism = new SubscribtionMechanism();