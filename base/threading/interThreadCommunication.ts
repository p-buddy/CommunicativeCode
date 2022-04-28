const enum ECommunicationType {
  MainToWorkerDispatch,
  ResponseFromWorker,
  WorkerToMainDispatch,
  ResponseFromMain,
  Last
}

type RequireKey<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X]
} & {
    [P in K]-?: T[P]
  }

type TDispatcher = ECommunicationType.MainToWorkerDispatch | ECommunicationType.WorkerToMainDispatch;
type TResponder = ECommunicationType.ResponseFromMain | ECommunicationType.ResponseFromWorker;

type TMessage<TEvent extends number, TCommunication extends ECommunicationType, TData, TResponseData = void> = {
  communication: TCommunication,
  event: TEvent,
  payload: TData,
  responseId?: TMessage<TEvent, TCommunication, TData, TResponseData>['communication'] extends TResponder ? number : never,
  onResponse?: TMessage<TEvent, TCommunication, TData, TResponseData>['communication'] extends TDispatcher ? TResponseData extends void ? void : (resonse: TResponseData) => void : void,
}

type TDispatch<TEvent extends number, TData, TResponse = void> = TMessage<TEvent, TDispatcher, TData, TResponse>;
type TDispatchForResponse<TEvent extends number, TData, TResponse> = RequireKey<TDispatch<TEvent, TData, TResponse>, "onResponse">;
type TResponse<TDispatched extends TDispatchForResponse<any, any, any>> = RequireKey<TMessage<TDispatched['event'], TResponder, Parameters<TDispatched['onResponse']>[0]>, "responseId">;

const Ge: TDispatchForResponse<1, { x: number }, number> = {
  communication: 0,
  payload: { x: 3 },
  event: 1,
  onResponse: (x: number) => { }
}

const GeResponse: TResponse<TDispatchForResponse<1, { x: number }, number>> = {
  communication: ECommunicationType.ResponseFromWorker,
  payload: 3,
  event: 1,
  responseId: 4,
}


export const dispatch = (msg: TMessage<any, any, any>) => {
  const { communication, event, payload, onResponse, responseId } = msg;
  if (onResponse) {
    const id = registerCallback(msg.event, onResponse);
    postMessage({ communication, event, payload, responseId: id });
    return;
  }

  if (responseId) {
    postMessage({ communication, event, payload, responseId });
  }

  postMessage({ communication, event, payload });
}


export const registerCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  callbacks[on] ? callbacks[on]?.push(callback) : callbacks[on] = [callback];
}

export const unRegisterCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  const index = callbacks[on]?.indexOf(callback) ?? -1;
  if (index < 0) return;
  callbacks[on]?.splice(index, 1);
}
