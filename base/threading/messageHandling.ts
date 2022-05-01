import { Communication, MessageStructureType, ResponseType, TPostedMessage } from "./messageStructure";

const messageHandlers: Function[][] = [[]];
const responseHandlers: Function[][] = [[]];

type TFreeIDs = (number[] | undefined);
const freeResponseIDs: TFreeIDs[] = [[]];

const messageHandler = (ev: MessageEvent<TPostedMessage>): void => {
  const { communication, event, payload, responseID } = ev.data;

  if (!responseID) {
    for (let index = 0; index < (messageHandlers[event]?.length ?? 0); index++) {
      const fn = (messageHandlers[event] as Function[])[index] as Function;
      fn(payload);
    }
    return;
  }

  if (communication !== Communication.ResponseFromMain && communication !== Communication.ResponseFromWorker) {
    const responder = (messageHandlers[event] as Function[])[0];
    if (!responder) {
      throw `Communication (${communication}) for event (${event}) failed. No responder function has been added.`;
    }
    const result = responder(payload);
    const response = communication === Communication.MainToWorkerDispatch ? Communication.ResponseFromWorker : Communication.ResponseFromMain;
    postMessage({ communication: response, event, payload: result, responseID } as TPostedMessage)
    return;
  }

  while (freeResponseIDs.length <= event) {
    freeResponseIDs.push(undefined);
  }
  if (freeResponseIDs.length <= event)
    ((responseHandlers[event] as Function[])[responseID] as Function)(payload);
  freeResponseIDs[event]?.push(responseID) ?? freeResponseIDs[event] =[responseID];
}

type TConditionalHandler<
  TStructure extends MessageStructureType,
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
  if (onmessage === null) {
    onmessage = messageHandler;
  }
  if (callbacks[communication] !== undefined) {

    callbacks[communication]?.length - 1 < event
  }
  callbacks[communication] ? callbacks[communication]?.push(handler) : callbacks[communication] = [handler];
}