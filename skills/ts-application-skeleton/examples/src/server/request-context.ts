import { Context } from "effect";

export class RequestContext extends Context.Service<
  RequestContext,
  { readonly requestId: string; readonly operation: string }
>()("app/RequestContext") {}
