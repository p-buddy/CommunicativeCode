export const enum Communication {
  MainToWorkerDispatch,
  ResponseFromWorker,
  WorkerToMainDispatch,
  ResponseFromMain,
  Last
}

type TDispatchAndResponse = {
  [Communication.MainToWorkerDispatch]: Communication.ResponseFromWorker,
  [Communication.WorkerToMainDispatch]: Communication.ResponseFromMain
}

export type PayloadType<T> = { payload: T };
export type ResponseType<T> = { response: T };

type TMessageConfig = PayloadType<any> | (PayloadType<any> & ResponseType<any>);

export type MessageStructureType = { communication: keyof TDispatchAndResponse } & { [k: number]: TMessageConfig }
export type DefineMessageStructure<
  TCommunication extends keyof TDispatchAndResponse,
  TEvents extends number,
  T extends MessageStructureType & { communication: TCommunication } & Record<TEvents, TMessageConfig>
  > = T;

export type TPostedMessage = {
  communication: Communication,
  event: number,
  payload: any,
  responseID?: number,
}