import InstallPlan

/-! Runs the model on one request per line, so that `../check.py` can compare it with
`tools/install.py`. A request is `FULL COMMIT ; NAME WANT TREE LINK ; ...` and the answer
is `NAME ACT TREE LINKACT LINK ; ...`, the decisions and the state after one run. -/

def showNat : Option Nat → String
  | some n => toString n
  | none => "-"

def parseTree (s : String) : Option Tree :=
  if s == "f" || s == "s" then some .foreign
  else match s.splitOn ":" with
    | ["o", t, p, r] => some (.ours t.toNat? p.toNat? r.toNat?)
    | _ => none

def showTree : Option Tree → String
  | none => "-"
  | some .foreign => "f"
  | some (.ours t p r) => s!"o:{showNat t}:{showNat p}:{showNat r}"

def parseLink (s : String) : Option Link :=
  if s == "e" then some .expected
  else if s == "a" then some (.intoShared true)
  else if s == "d" then some (.intoShared false)
  else if s == "x" || s == "y" || s == "z" then some .other
  else none

def showLink : Option Link → String
  | none => "-"
  | some .expected => "e"
  | some (.intoShared true) => "a"
  | some (.intoShared false) => "d"
  | some .other => "x"

def showAct : Act → String
  | .replace => "replace" | .restamp => "restamp" | .leave => "leave"
  | .archive => "archive" | .nothing => "nothing"

def showLinkAct : LinkAct → String
  | .add => "add" | .remove => "remove" | .leave => "leave" | .nothing => "nothing"

def one (full : Bool) (commit : Nat) (group : String) : String :=
  match group.splitOn " " with
  | [name, want, tree, lnk] =>
    let want := want.toNat?
    let was := parseTree tree
    let after := install full commit want was
    let l := parseLink lnk
    let words := [name, showAct (act full commit want was), showTree after,
      showLinkAct (linkAct want.isSome after l), showLink (link want.isSome after l)]
    " ".intercalate words
  | _ => "bad group"

def answer (line : String) : String :=
  match line.splitOn " ; " with
  | head :: groups =>
    match head.splitOn " " with
    | [full, commit] => " ; ".intercalate (groups.map (one (full == "1") commit.toNat!))
    | _ => "bad request"
  | [] => "bad request"

partial def loop (stdin : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  IO.println (answer line.trimAscii.toString)
  loop stdin

def main : IO Unit := do loop (← IO.getStdin)
