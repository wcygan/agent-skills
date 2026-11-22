import Aeneas
import Varint
open Aeneas Std Result

/-! Proofs about `Varint.lean`, which Aeneas generates from `../src/lib.rs`.
The theorem to read is `round_trip_spec`, at the end. -/

namespace varint

/-- The bytes of `n`, as numbers. -/
def bytes (n : Nat) : List Nat :=
  if n < 128 then [n] else (n % 128 + 128) :: bytes (n / 128)
decreasing_by omega

theorem bytes_small {n : Nat} (h : n < 128) : bytes n = [n] := by
  rw [bytes]; simp [h]

theorem bytes_big {n : Nat} (h : 128 ≤ n) : bytes n = (n % 128 + 128) :: bytes (n / 128) := by
  rw [bytes]; simp; omega

@[step]
theorem encode_loop_spec (out : alloc.vec.Vec U8) (n : U64)
    (room : out.length + (bytes n.val).length ≤ Usize.max) :
    encode_loop out n ⦃ r =>
      r.2.val < 128 ∧
      r.1.val.map (·.val) ++ [r.2.val] = out.val.map (·.val) ++ bytes n.val ⦄ := by
  unfold encode_loop
  step*
  · have := bytes_big (n := n.val) (by scalar_tac)
    simp [this] at room
    scalar_tac
  · have := bytes_big (n := n.val) (by scalar_tac)
    simp [this] at room
    simp [*] at *
    scalar_tac
  · have := bytes_big (n := n.val) (by scalar_tac)
    have cast : i2.val = n.val % 128 + 128 := by
      simp [*]
      scalar_tac
    simp_all
  · have := bytes_small (n := n.val) (by scalar_tac)
    simp [this]
    scalar_tac
termination_by n.val
decreasing_by scalar_decr_tac

/-- What `decode` computes, on numbers: the value, or `none` when the bytes run out
or the value does not fit in 64 bits. -/
def decodeSpec : List Nat → Nat → Nat → Option Nat
  | [], _, _ => none
  | b :: rest, value, scale =>
    if U64.max < b % 128 * scale then none
    else if U64.max < value + b % 128 * scale then none
    else if b < 128 then some (value + b % 128 * scale)
    else if U64.max < scale * 128 then none
    else decodeSpec rest (value + b % 128 * scale) (scale * 128)

@[step]
theorem decode_loop_spec (data : Aeneas.Std.Slice U8) (value scale : U64) (i : Usize) :
    decode_loop data value scale i ⦃ r =>
      r.map (fun p => p.1.val) =
        decodeSpec ((data.val.drop i.val).map (·.val)) value.val scale.val ⦄ := by
  unfold decode_loop
  step*
  case h2 =>
    have : List.drop i.val data.val = [] := by simp; scalar_tac
    simp [this, decodeSpec]
  all_goals
    have inside : i.val < data.val.length := by scalar_tac
    have cast : byte.val = (data.val[i.val]).val := by simp [*]
    rw [List.drop_eq_getElem_cons inside]
    simp only [List.map_cons, decodeSpec, ← cast]
    simp_all
    try scalar_tac
  split_ifs <;> first | rfl | scalar_tac
termination_by data.length - i.val
decreasing_by scalar_decr_tac

/-- On numbers, decoding the bytes of `m` gives `m`, whatever bytes follow. -/
theorem decodeSpec_bytes (m : Nat) (rest : List Nat) (value scale : Nat)
    (fits : value + scale * m ≤ U64.max) :
    decodeSpec (bytes m ++ rest) value scale = some (value + scale * m) := by
  fun_induction bytes m generalizing value scale with
  | case1 m small =>
    have : m % 128 = m := Nat.mod_eq_of_lt small
    have : m * scale = scale * m := Nat.mul_comm ..
    simp [decodeSpec, *]
    omega
  | case2 m big ih =>
    have split : scale * m = m % 128 * scale + scale * 128 * (m / 128) := by
      rw [Nat.mul_assoc, Nat.mul_comm (m % 128), ← Nat.mul_add]
      congr 1
      omega
    have : scale * 128 ≤ scale * 128 * (m / 128) :=
      Nat.le_mul_of_pos_right _ (by omega)
    have := ih (value + m % 128 * scale) (scale * 128) (by omega)
    have : (m % 128 + 128) % 128 = m % 128 := by omega
    simp [decodeSpec, *]
    omega

theorem bytes_length (k : Nat) : ∀ n, n < 128 ^ (k + 1) → (bytes n).length ≤ k + 1 := by
  induction k with
  | zero => intro n h; simp [bytes_small (by simpa using h)]
  | succ k ih =>
    intro n h
    by_cases small : n < 128
    · simp [bytes_small small]
    · have := ih (n / 128) (by rw [Nat.div_lt_iff_lt_mul (by omega)]; rw [Nat.pow_succ] at h; exact h)
      simp [bytes_big (Nat.le_of_not_lt small)]
      omega

@[step]
theorem encode_spec (n : U64) (out : alloc.vec.Vec U8)
    (room : out.length + (bytes n.val).length ≤ Usize.max) :
    encode n out ⦃ out' => out'.val.map (·.val) = out.val.map (·.val) ++ bytes n.val ⦄ := by
  unfold encode
  step*
  · have := congrArg List.length out1_post1
    simp at this
    scalar_tac
  · have cast : i.val = n1.val := by simp [*]; scalar_tac
    simp [*] at *
    simp [← out1_post1, cast]

/-- For every `u64`, `round_trip` does not panic and returns the number it was given. -/
theorem round_trip_spec (n : U64) : round_trip n ⦃ r => r = some n ⦄ := by
  unfold round_trip
  have length := bytes_length 9 n.val (by scalar_tac)
  step with encode_spec as ⟨out, out_post⟩
  step as ⟨o, o_post⟩
  have spec := decodeSpec_bytes n.val [] 0 1 (by scalar_tac)
  have written : out.deref.val.map (·.val) = bytes n.val := by
    simpa [alloc.vec.Vec.deref, alloc.vec.Vec.new] using out_post
  simp at spec
  simp [written, spec] at o_post
  cases o with
  | none => simp at o_post
  | some p =>
    obtain ⟨value, read⟩ := p
    simp at o_post
    simp
    scalar_tac

end varint
#print axioms varint.round_trip_spec
