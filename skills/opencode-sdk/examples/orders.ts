import { Context, Effect, Layer, Schema } from "effect"

export const LookupInput = Schema.Struct({ orderId: Schema.String })
export interface LookupInput extends Schema.Schema.Type<typeof LookupInput> {}
export const Order = Schema.Struct({ orderId: Schema.String, status: Schema.String })
export interface Order extends Schema.Schema.Type<typeof Order> {}

export class OrderNotFound extends Schema.TaggedError<OrderNotFound>()(
  "OrderNotFound", { orderId: Schema.String },
) {}

export interface OrderLookupInterface {
  readonly get: (orderId: string) => Effect.Effect<Order, OrderNotFound>
}
export class OrderLookup extends Context.Service<OrderLookup, OrderLookupInterface>()(
  "@example/OrderLookup",
) {}

export const orderLayer = (orders: ReadonlyArray<Order> = [{ orderId: "ORD-1", status: "shipped" }]) =>
  Layer.effect(OrderLookup, Effect.gen(function* () {
    const get = Effect.fn("OrderLookup.get")(function* (orderId: string) {
      const order = orders.find((order) => order.orderId === orderId)
      if (!order) return yield* Effect.fail(new OrderNotFound({ orderId }))
      return yield* Schema.decodeUnknownEffect(Order)(order)
        .pipe(Effect.orDie)
    })
    return OrderLookup.of({ get })
  }))
