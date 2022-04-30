import { dispatch, getDispatcher } from "./messageDispatching";
import { DefineMessageStructure, Communication, PayloadType, ResponseType } from "./messageStructure";

export const enum EWorkerToMain {
  GetSample,
  GetOscillator,
  Pitch,
}

export type TWorkerToMain = DefineMessageStructure<
  Communication.WorkerToMainDispatch,
  EWorkerToMain,
  {
    communication: Communication.WorkerToMainDispatch,
    [EWorkerToMain.GetSample]: PayloadType<number> & ResponseType<number>,
    [EWorkerToMain.GetOscillator]: PayloadType<number> & ResponseType<number>,
    [EWorkerToMain.Pitch]: PayloadType<{ soundID: number, pitchMod: number }>
  }
>;

dispatch<TWorkerToMain, EWorkerToMain.GetSample>(Communication.WorkerToMainDispatch, EWorkerToMain.GetSample, 4, (r: number) => { });
dispatch<TWorkerToMain, EWorkerToMain.GetOscillator>(
  Communication.WorkerToMainDispatch,
  EWorkerToMain.GetOscillator,
  { soundID: 4, pitchMod: 4 });

const dispatcher = getDispatcher<TWorkerToMain>(Communication.WorkerToMainDispatch);
dispatcher.dispatch(EWorkerToMain.Pitch, { soundID: 4, pitchMod: 3 });

dispatcher.dispatch(EWorkerToMain.GetOscillator, 3, (response: number) => {

});


/*handle<TWorkerToMain, EWorkerToMain.GetSample>(
  Communication.WorkerToMainDispatch,
  EWorkerToMain.GetSample,
  (payload: number) => {
    return payload * 2;
  });*/

