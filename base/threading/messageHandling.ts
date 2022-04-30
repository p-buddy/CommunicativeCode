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