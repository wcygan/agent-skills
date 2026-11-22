import Varint

/-! Runs the model on one request per line, so that `../check.py` can compare it with the Python.
`e 300` prints the bytes of 300. `d 172 2 7` prints the decoded value and the bytes after it. -/

def bytes (xs : List Nat) : String := " ".intercalate (xs.map toString)

def answer (line : String) : String :=
  match line.splitOn " " with
  | "e" :: [n] => bytes (encode n.toNat!)
  | "d" :: xs =>
    match decode (xs.filterMap String.toNat?) with
    | none => "none"
    | some (v, rest) => bytes (v :: rest)
  | _ => "bad request"

partial def loop (stdin : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  IO.println (answer line.trimAscii.toString)
  loop stdin

def main : IO Unit := do loop (← IO.getStdin)
