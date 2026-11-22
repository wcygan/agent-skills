import Bsearch

/-! Runs the model on one request per line, so that `../check.py` can compare it with the Python.
`7 1 4 7 9` searches for 7 in `[1, 4, 7, 9]` and prints the index, or `none`. -/

def answer (line : String) : String :=
  match (line.splitOn " ").filterMap String.toInt? with
  | target :: xs =>
    match search xs.toArray target with
    | none => "none"
    | some i => toString i
  | [] => "bad request"

partial def loop (stdin : IO.FS.Stream) : IO Unit := do
  let line ← stdin.getLine
  if line.isEmpty then return
  IO.println (answer line.trimAscii.toString)
  loop stdin

def main : IO Unit := do loop (← IO.getStdin)
