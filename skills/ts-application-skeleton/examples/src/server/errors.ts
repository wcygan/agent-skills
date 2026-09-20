import { Schema } from "effect";

import { ApplicationErrorCode } from "../shared/contracts";

export class AppError extends Schema.TaggedError<AppError>()("AppError", {
  code: ApplicationErrorCode,
  message: Schema.String,
}) {}
