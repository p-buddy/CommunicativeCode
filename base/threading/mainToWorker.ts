import type { ECommunicationType } from "./interThreadCommunication"

export const enum EMainToWorker {
}

export type TMainToWorkerMessage = {
  communication: ECommunicationType.WorkerToMainDispatch,
}