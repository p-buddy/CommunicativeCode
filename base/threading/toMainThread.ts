const enum EEvent {
  GetSound,
  PitchUp
}

type TSetSoundIndex = (requestId: number, soundId: number) => void;
type TSetter = () => void;

type TMainToWorkerCallbacks = {
  [EEvent.GetSound]: TSetSoundIndex,
  [EEvent.PitchUp]: TSetter
}
type TMainToWorkerData = { [key in keyof TMainToWorkerCallbacks]: Parameters<TMainToWorkerCallbacks[key]> };

const callbacks: Record<EEvent, TMainToWorkerCallbacks[EEvent.GetSound][] | undefined> = {
  [EEvent.GetSound]: undefined,
  [EEvent.PitchUp]: undefined
};

type TEventBase<TEventType extends EEvent> = {
  type: TEventType,
  payload: TMainToWorkerData[TEventType],
  applicableIndex?: number,
}

export const registerCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  callbacks[on] ? callbacks[on]?.push(callback) : callbacks[on] = [callback];
}

export const unRegisterCallback = <EventType extends EEvent>(on: EventType, callback: TMainToWorkerCallbacks[EventType]) => {
  const index = callbacks[on]?.indexOf(callback) ?? -1;
  if (index < 0) return;
  callbacks[on]?.splice(index, 1);
}

onmessage = function <TEvent extends EEvent>(e: MessageEvent<TEventBase<TEvent>>) {
  const { type, payload, applicableIndex } = e.data;
  if (callbacks[type] === undefined || callbacks[type]?.length === 0) return;
  const funcs = callbacks[type] as TMainToWorkerCallbacks[EEvent][];

  if (applicableIndex === undefined) {
    funcs?.forEach(func => {
      // @ts-ignore
      func(...payload);
    });
  } else if ((callbacks[type]?.length ?? 0) > applicableIndex) {
    const func = funcs[applicableIndex] as TMainToWorkerCallbacks[EEvent];
    // @ts-ignore
    if (func) func(...payload);
  }
}