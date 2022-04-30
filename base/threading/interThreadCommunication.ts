export const enum ECommunicationType {
  MainToWorkerDispatch,
  ResponseFromWorker,
  WorkerToMainDispatch,
  ResponseFromMain,
  Last
}

type TDispatchAndResponse = {
  [ECommunicationType.MainToWorkerDispatch]: ECommunicationType.ResponseFromWorker,
  [ECommunicationType.WorkerToMainDispatch]: ECommunicationType.ResponseFromMain
}

export type PayloadType<T> = { payload: T };
export type ResponseType<T> = { response: T };

type TMessageConfig = PayloadType<any> | (PayloadType<any> & ResponseType<any>);

export type TMessageStructure = { communication: keyof TDispatchAndResponse } & { [k: number]: TMessageConfig }
export type TDefineMessageStructure<
  TCommunication extends keyof TDispatchAndResponse,
  TEvents extends number,
  T extends TMessageStructure & { communication: TCommunication } & Record<TEvents, TMessageConfig>
  > = T;

// [comm-type] [event] [callbacks]
const callbacks: Function[][][] = new Array(ECommunicationType.Last);

type TConditionalHandler<
  TStructure extends TMessageStructure,
  TKey extends keyof TStructure & number>
  = TStructure[TKey] extends ResponseType<any>
  ? (payload: TStructure[TKey]['payload']) => TStructure[TKey]['response']
  : (payload: TStructure[TKey]['payload']) => void;

// commtype
// event
// index
export const handle = <
  TStructure extends TMessageStructure,
  TEventKey extends keyof TStructure & number>(
    communication: TStructure['communication'],
    event: TEventKey,
    handler: TConditionalHandler<TStructure, TEventKey>
  ) => {
  if (callbacks[communication] !== undefined) {

    callbacks[communication]?.length - 1 < event
  }
  callbacks[communication] ? callbacks[communication]?.push(handler) : callbacks[communication] = [handler];
}


export const registerCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  callbacks[on] ? callbacks[on]?.push(callback) : callbacks[on] = [callback];
}

export const unRegisterCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  const index = callbacks[on]?.indexOf(callback) ?? -1;
  if (index < 0) return;
  callbacks[on]?.splice(index, 1);
}
