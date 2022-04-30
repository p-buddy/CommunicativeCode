import { MessageStructureType, ResponseType, Communication } from "./messageStructure";

type TOnResponse<
  TStructure extends MessageStructureType,
  TEventKey extends keyof TStructure & number> =
  TStructure[TEventKey] extends ResponseType<any>
  ? [(response: TStructure[TEventKey]['response']) => void]
  : [];

export const dispatch = <
  TStructure extends MessageStructureType,
  TEventKey extends keyof TStructure & number>(
    communication: TStructure['communication'],
    event: TEventKey,
    payload: TStructure[TEventKey]['payload'],
    ...onResponse: TOnResponse<TStructure, TEventKey>
  ) => {
  onResponse
    ? postMessage({ communication, event, payload, responseId: registerCallback(msg.event, onResponse) })
    : postMessage({ communication, event, payload });
}

type TDispatcher<TStructure extends MessageStructureType> = {
  dispatch: <TEventKey extends keyof TStructure & number>(
    event: TEventKey,
    payload: TStructure[TEventKey]['payload'],
    ...onResponse: TOnResponse<TStructure, TEventKey>
  ) => void;
}

const dispatchers: TDispatcher<MessageStructureType>[] = new Array(Communication.Last);

export const getDispatcher = <TStructure extends MessageStructureType>(communication: TStructure['communication']): TDispatcher<TStructure> => {
  if (dispatchers[communication] !== undefined) return dispatchers[communication] as TDispatcher<TStructure>;

  const dispatcher = {
    dispatch: <TEventKey extends keyof TStructure & number>(
      event: TEventKey,
      payload: TStructure[TEventKey]['payload'],
      ...onResponse: TOnResponse<TStructure, TEventKey>
    ) => {
      dispatch(communication, event, payload, ...onResponse);
    }
  };

  dispatchers[communication] = dispatcher;

  return dispatcher;
};
