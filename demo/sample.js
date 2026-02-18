// remove this single-line comment
const label = "kept string // not a comment";

/* remove this
   multi-line comment */
function add(a, b) {
  return a + b; // trailing comment
}

console.log(add(2, 3));
