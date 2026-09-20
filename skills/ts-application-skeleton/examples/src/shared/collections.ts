import { Schema } from "effect";

export const CollectionFields = Schema.Struct({
  title: Schema.Trim.check(Schema.isMinLength(1), Schema.isMaxLength(120)),
  summary: Schema.String,
  owner: Schema.String,
  status: Schema.Literals(["Draft", "Archived", "Active"]),
  category: Schema.String,
  description: Schema.String,
  details: Schema.String,
  highlights: Schema.Array(Schema.String),
});

export interface CollectionFields extends Schema.Schema.Type<typeof CollectionFields> {}

export const CollectionItem = Schema.Struct({
  ...CollectionFields.fields,
  id: Schema.String,
  version: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
});

export const SaveCollectionItem = Schema.Struct({
  ...CollectionFields.fields,
  id: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(100)),
  version: Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)),
});

export interface SaveCollectionItem extends Schema.Schema.Type<typeof SaveCollectionItem> {}

export const DeleteCollectionItem = Schema.Struct({
  id: Schema.String,
  version: Schema.Number.check(Schema.isInt(), Schema.isGreaterThan(0)),
});

export interface CollectionItem extends Schema.Schema.Type<typeof CollectionItem> {}

export const CollectionItemId = Schema.Struct({ id: Schema.String });
