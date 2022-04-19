import type { TMemberMethodNames, TMemberMethodParams } from "./memberTypes";

interface IEnqueuedInstructable<T> {
  to<TName extends TMemberMethodNames<T>>(methodName: TName, ...params: TMemberMethodParams<T>[TName]): void;
}

export default IEnqueuedInstructable;