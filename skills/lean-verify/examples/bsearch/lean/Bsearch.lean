/-! A model of `search` in `../bsearch.py`. -/

/-- Models the loop of `search`: the value can only be at an index from `lo` up to `hi`. -/
def go (xs : Array Int) (target : Int) (lo hi : Nat) (bound : hi ≤ xs.size) : Option Nat :=
  if h : lo < hi then
    let mid := (lo + hi) / 2
    if xs[mid] < target then go xs target (mid + 1) hi bound
    else if target < xs[mid] then go xs target lo mid (by omega)
    else some mid
  else none
termination_by hi - lo

def search (xs : Array Int) (target : Int) : Option Nat :=
  go xs target 0 xs.size (Nat.le_refl _)

/-- No value comes before a smaller one. -/
def Sorted (xs : Array Int) : Prop :=
  ∀ i j (_ : i < j) (_ : j < xs.size), xs[i] ≤ xs[j]

theorem go_found {xs target lo hi bound i} (h : go xs target lo hi bound = some i) :
    ∃ _ : i < xs.size, xs[i] = target := by
  fun_induction go xs target lo hi bound <;> grind

theorem go_missing {xs target lo hi bound} (sorted : Sorted xs)
    (below : ∀ k (_ : k < lo) (_ : k < xs.size), xs[k] < target)
    (above : ∀ k (_ : hi ≤ k) (_ : k < xs.size), target < xs[k])
    (h : go xs target lo hi bound = none) :
    ∀ k (_ : k < xs.size), xs[k] ≠ target := by
  fun_induction go xs target lo hi bound with
  | case1 lo hi bound inside mid less ih =>
    refine ih (fun k hk hks => ?_) above h
    have := sorted k mid
    have := Int.le_refl xs[mid]
    grind
  | case2 lo hi bound inside mid notLess more ih =>
    refine ih below (fun k hk hks => ?_) h
    have := sorted mid k
    grind
  | case3 => simp at h
  | case4 lo hi bound outside =>
    intro k hks
    have := below k
    have := above k
    grind

/-- An index that `search` returns holds the target. This needs no assumption about `xs`. -/
theorem search_found {xs target i} (h : search xs target = some i) :
    ∃ _ : i < xs.size, xs[i] = target :=
  go_found h

/-- When `xs` is sorted and `search` returns nothing, the target is at no index. -/
theorem search_missing {xs target} (sorted : Sorted xs) (h : search xs target = none) :
    ∀ k (_ : k < xs.size), xs[k] ≠ target :=
  go_missing sorted (by omega) (by omega) h

-- `search_missing` needs `Sorted`: in this unsorted array the target is present and not found.
#guard search #[3, 1, 2] 3 = none

#print axioms search_found
#print axioms search_missing
