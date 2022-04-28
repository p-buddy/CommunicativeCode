const enum EToWorkerEvent {
  GetSound,
  PitchUp
}

const enum EFromWorkerEvent {
  GetSample
}

const enum ECommunicationType {
  MainToWorkerDispatch,
  ResponseFromWorker,
  WorkerToMainDispatch,
  ResponseFromMain
}

type TMessage<TData, TResponse = void> = {
  communication: ECommunicationType,
  event: number,
  payload: TData,
  onResponse?: (response: TResponse) => void
}

type TFromWorkerPaylod = {
  [EFromWorkerEvent.GetSample]: (sample: string) => number,
}

type TFromWorkerEvent<TEventType extends EFromWorkerEvent> = {
  type: TEventType,
  payload: Parameters<TFromWorkerPaylod[TEventType]>,
  response: ReturnType<TFromWorkerPaylod[TEventType]> extends void ? never : ReturnType<TFromWorkerPaylod[TEventType]>,
}

// Response
export const dispatch = <TData, TResponse = void>(msg: TMessage<TData, TResponse>) => {
  const { communication, event, payload, onResponse } = msg;
  if (onResponse) {
    const responseId = 1; // get response id
    postMessage({ communication, event, payload, responseId });
    return;
  }

  postMessage({ communication, event, payload });
}

dispatch({ communication: ECommunicationType.MainToWorkerDispatch, event: 0, payload: 0, onResponse: (x: number) => { } });

type TSetSoundIndex = (requestId: number, soundId: number) => void;

type TMainToWorkerCallbacks = {
  [EToWorkerEvent.GetSound]: TSetSoundIndex,
}
type TMainToWorkerData = { [key in keyof TMainToWorkerCallbacks]: Parameters<TMainToWorkerCallbacks[key]> };

const callbacks: Record<EToWorkerEvent, TMainToWorkerCallbacks[EToWorkerEvent.GetSound][] | undefined> = {
  [EToWorkerEvent.GetSound]: undefined,
  [EToWorkerEvent.PitchUp]: undefined
};

type TEventBase<TEventType extends EToWorkerEvent> = {
  type: TEventType,
  payload: TMainToWorkerData[TEventType],
  applicableIndex?: number,
}

export const registerCallback = <EventType extends EToWorkerEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  callbacks[on] ? callbacks[on]?.push(callback) : callbacks[on] = [callback];
}

export const unRegisterCallback = <EventType extends EToWorkerEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  const index = callbacks[on]?.indexOf(callback) ?? -1;
  if (index < 0) return;
  callbacks[on]?.splice(index, 1);
}


onmessage = function <TEvent extends EToWorkerEvent>(e: MessageEvent<TEventBase<TEvent>>) {
  const { type, payload, applicableIndex } = e.data;
  if (callbacks[type] === undefined || callbacks[type]?.length === 0) return;
  const funcs = callbacks[type] as TMainToWorkerCallbacks[EToWorkerEvent][];

  if (applicableIndex === undefined) {
    funcs?.forEach(func => {
      // @ts-ignore
      func(...payload);
    });
  } else if ((callbacks[type]?.length ?? 0) > applicableIndex) {
    const func = funcs[applicableIndex] as TMainToWorkerCallbacks[EToWorkerEvent];
    // @ts-ignore
    if (func) func(...payload);
  }
}