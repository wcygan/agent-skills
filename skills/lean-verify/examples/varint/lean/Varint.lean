/-! A model of `encode` and `decode` in `../varint.py`. A byte is a `Nat`. -/

/-- Models `encode`: the low seven bits first, with 128 added to every byte but the last. -/
def encode (n : Nat) : List Nat :=
  if n < 128 then [n] else (n % 128 + 128) :: encode (n / 128)
decreasing_by omega

/-- Models `decode`: the first value and the bytes after it, or `none` when it is cut short. -/
def decode : List Nat → Option (Nat × List Nat)
  | [] => none
  | b :: rest =>
    if b < 128 then some (b, rest)
    else match decode rest with
      | none => none
      | some (v, tail) => some (b - 128 + 128 * v, tail)

/-- Decoding an encoded integer returns that integer and leaves the following bytes untouched. -/
theorem decode_encode (n : Nat) (rest : List Nat) :
    decode (encode n ++ rest) = some (n, rest) := by
  fun_induction encode n with
  | case1 n h => simp [decode, h]
  | case2 n h ih =>
    have high : ¬(n % 128 + 128 < 128) := by omega
    simp [decode, ih, high]
    omega

/-- Every encoded byte fits in eight bits. -/
theorem encode_byte (n : Nat) : ∀ b ∈ encode n, b < 256 := by
  fun_induction encode n with
  | case1 n h => simp; omega
  | case2 n h ih =>
    intro b hb
    simp at hb
    rcases hb with rfl | hb
    · omega
    · exact ih b hb

#print axioms decode_encode
#print axioms encode_byte
