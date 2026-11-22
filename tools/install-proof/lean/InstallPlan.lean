/-! A model of how `tools/install.py` decides what to do with one skill name, and of the
state that decision leaves. `plan_install` and `plan_links` make the same decision for
every name, so a statement about one name holds for a catalog of any size.

Trees, commits and names are numbers here; the Python compares them only for equality. -/

/-- One entry of `~/.agents/skills`. `ours` carries the three source stamps that
`stamps()` reads from `SKILL.md`; a missing stamp line is `none`. `foreign` is a symlink
or a tree without this repository's stamp (`ours()` is false). -/
inductive Tree where
  | ours (tree pinned ref : Option Nat)
  | foreign
  deriving DecidableEq, Repr

/-- What `plan_install` decides for one name. `leave` is its `foreign` list and `archive`
its `retired` list. -/
inductive Act where
  | replace | restamp | leave | archive | nothing
  deriving DecidableEq, Repr

/-- `plan_install` for one name. `want` is the tree of the skill in the catalog, or `none`
when the catalog does not ship that name. -/
def act (full : Bool) (commit : Nat) (want : Option Nat) : Option Tree → Act
  | none => if want.isSome then .replace else .nothing
  | some .foreign => if want.isSome then .leave else .nothing
  | some (.ours t p r) =>
    match want with
    | none => .archive
    | some w =>
      if full || t != some w then .replace
      else if p != some commit || r != some commit then .restamp
      else .nothing

/-- What `install()` does with that decision: `install_tree` for `replace`, the rewritten
`SKILL.md` for `restamp`, `archive_retired` for `archive`. -/
def run (commit : Nat) (want : Option Nat) (was : Option Tree) : Act → Option Tree
  | .replace => want.map fun w => .ours (some w) (some commit) (some commit)
  | .restamp =>
    match was with
    | some (.ours t _ _) => some (.ours t (some commit) (some commit))
    | other => other
  | .archive => none
  | .leave | .nothing => was

/-- One name's entry in `~/.agents/skills` after one run. -/
def install (full : Bool) (commit : Nat) (want : Option Nat) (was : Option Tree) : Option Tree :=
  run commit want was (act full commit want was)

/-- One entry of `~/.claude/skills`. `expected` is the link to this name's own tree.
`intoShared alive` is a link to another entry of `~/.agents/skills`, which exists or not.
`other` is anything else: a folder, a file, or a link that leaves `~/.agents/skills`. -/
inductive Link where
  | expected
  | intoShared (alive : Bool)
  | other
  deriving DecidableEq, Repr

/-- What `plan_links` decides for one name. `leave` is its conflicts list. -/
inductive LinkAct where
  | add | remove | leave | nothing
  deriving DecidableEq, Repr

/-- `plan_links` for one name, as `install()` calls it after the trees are in place.
`tree` is this name's entry in `~/.agents/skills` at that moment. -/
def linkAct (inCatalog : Bool) (tree : Option Tree) : Option Link → LinkAct
  | none => if inCatalog then .add else .nothing
  | some .expected => if inCatalog then .nothing else if tree.isNone then .remove else .nothing
  | some (.intoShared alive) => if inCatalog then .leave else if alive then .nothing else .remove
  | some .other => if inCatalog then .leave else .nothing

def linkRun (was : Option Link) : LinkAct → Option Link
  | .add => some .expected
  | .remove => none
  | .leave | .nothing => was

/-- One name's entry in `~/.claude/skills` after one run. -/
def link (inCatalog : Bool) (tree : Option Tree) (was : Option Link) : Option Link :=
  linkRun was (linkAct inCatalog tree was)

/-! ## The global skill directory -/

/-- Unless another source owns the name, one run leaves exactly what the catalog ships:
the catalog's tree marked with this commit, or nothing when the catalog dropped the name. -/
theorem install_exact (full : Bool) (commit : Nat) (want : Option Nat) (was : Option Tree)
    (h : was ≠ some .foreign) :
    install full commit want was
      = want.map fun w => .ours (some w) (some commit) (some commit) := by
  unfold install act run
  cases was with
  | none => cases want <;> simp
  | some e =>
    cases e with
    | foreign => exact absurd rfl h
    | ours t p r =>
      cases want with
      | none => simp
      | some w =>
        by_cases ht : t = some w <;> by_cases hp : p = some commit <;>
          by_cases hr : r = some commit <;> cases full <;> simp_all

/-- An entry from another source is never changed, whatever the catalog holds. -/
theorem foreign_kept (full : Bool) (commit : Nat) (want : Option Nat) :
    install full commit want (some .foreign) = some .foreign := by
  unfold install act run
  cases want <;> simp

/-- After one run, a second run finds nothing to replace, re-mark or archive. This is the
check `install()` makes before it reports success. -/
theorem install_converges (full : Bool) (commit : Nat) (want : Option Nat) (was : Option Tree) :
    act false commit want (install full commit want was) = .nothing
    ∨ act false commit want (install full commit want was) = .leave := by
  by_cases h : was = some .foreign
  · subst h
    rw [foreign_kept]
    cases want <;> simp [act]
  · rw [install_exact full commit want was h]
    cases want <;> simp [act]

/-- Running again changes nothing. -/
theorem install_idempotent (full : Bool) (commit : Nat) (want : Option Nat) (was : Option Tree) :
    install false commit want (install full commit want was) = install full commit want was := by
  have h := install_converges full commit want was
  unfold install at h ⊢
  rcases h with h | h <;> rw [h] <;> rfl

/-! ## The links -/

/-- A folder, file or outside link in `~/.claude/skills` is never changed. -/
theorem other_link_kept (inCatalog : Bool) (tree : Option Tree) :
    link inCatalog tree (some .other) = some .other := by
  cases inCatalog <;> rfl

/-- A catalog skill with no entry, or with its own link, ends with its own link. -/
theorem catalog_linked (tree : Option Tree) (was : Option Link)
    (h : was = none ∨ was = some .expected) :
    link true tree was = some .expected := by
  rcases h with h | h <;> subst h <;> rfl

/-- After one run, a second run finds no link to add or remove. -/
theorem link_converges (inCatalog : Bool) (tree : Option Tree) (was : Option Link) :
    linkAct inCatalog tree (link inCatalog tree was) = .nothing
    ∨ linkAct inCatalog tree (link inCatalog tree was) = .leave := by
  unfold link linkAct linkRun
  cases inCatalog <;> cases was with
  | none => simp
  | some l =>
    cases l with
    | expected => cases tree <;> simp
    | intoShared alive => cases alive <;> simp
    | other => simp

/-- A skill the catalog dropped loses both its tree and its link in the same run. -/
theorem retired_removed (full : Bool) (commit : Nat) (t p r : Option Nat) :
    install full commit none (some (.ours t p r)) = none
    ∧ link false (install full commit none (some (.ours t p r))) (some .expected) = none := by
  have h : install full commit none (some (.ours t p r)) = none := by
    simp [install, act, run]
  exact ⟨h, by rw [h]; rfl⟩

/-- A link for a name outside the catalog survives only while what it points to exists. -/
theorem no_dangling_link (tree : Option Tree) :
    link false tree (some .expected) = (if tree.isNone then none else some .expected)
    ∧ link false tree (some (.intoShared false)) = none := by
  cases tree <;> exact ⟨rfl, rfl⟩

#print axioms install_exact
#print axioms foreign_kept
#print axioms install_converges
#print axioms install_idempotent
#print axioms other_link_kept
#print axioms catalog_linked
#print axioms link_converges
#print axioms retired_removed
#print axioms no_dangling_link

#guard act false 7 (some 1) (some (.ours (some 1) (some 6) (some 7))) = .restamp
#guard act true 7 (some 1) (some (.ours (some 1) (some 7) (some 7))) = .replace
#guard act false 7 none (some (.ours none none none)) = .archive
#guard act false 7 none (some .foreign) = .nothing
#guard linkAct false none (some .expected) = .remove
