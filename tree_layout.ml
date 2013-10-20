type 'a tree_layout = {value:'a; mutable thread:'a tree_layout option;
		left:'a tree_layout option; right: 'a tree_layout option;
		mutable x: int; mutable y: int; offset:int; 
		mutable modifier: int
	       }

let next_right = function
  | {thread=Some x; _} -> Some x
  | {right=Some x; _} -> Some x
  | {left=Some x; _} -> Some x
  | _ -> None

let next_left = function
  | {thread=Some x; _} -> Some x
  | {left=Some x; _} -> Some x
  | {right=Some x; _} -> Some x
  | _ -> None

let rec contour left right ?max_offset ?(loffset=0) ?(roffset=0) left_outer right_outer =
  let max_offset = 
    let delta = left.x + loffset - (right.x + roffset) in
    match max_offset with
      | None -> delta
      | Some x when delta > x -> delta
      | Some x -> x
  in

  let left_outer = match left_outer with None -> left | Some x -> x in
  let right_outer = match right_outer with None -> right | Some x -> x in
  
  let lo = next_left left_outer in
  let li = next_right left in
  let ri = next_left right in
  let ro = next_right right_outer in

  match li, ri with
    | Some li, Some ri -> contour li ri ~max_offset:max_offset 
      ~loffset:(loffset + left.offset) ~roffset:(roffset + right.offset) lo ro
    | _ -> (li, ri, max_offset, loffset, roffset, left_outer, right_outer)


let fix_subtrees left right =
  let li, ri, diff, loffset, roffset, lo, ro =
    contour left right None None in
  let diff = (diff + 1) + (right.x + left.x + (diff + 1)) mod 2 in
  
  right.modifier <- diff;
  right.x <- right.x + diff;
  
  let roffset =
    match right.left, right.right with
      | Some _, _ | _, Some _ -> roffset + diff
      | _, _ -> roffset
  in

  (match li, ri with
    | Some li, None -> 
      ro.thread <- Some li;
      ro.modifier <- loffset - roffset
    | None, Some ri -> 
      lo.thread <- Some ri;
      lo.modifier <- roffset - loffset 
    | _ -> ());

  (left.x + right.x) / 2
  
  

let rec add_modifiers tree modifier =
  tree.x <- tree.x + modifier;
  (match tree.left with 
      Some x -> ignore (add_modifiers x (modifier + tree.modifier))
    | None -> ());
  (match tree.right with 
      Some x -> ignore (add_modifiers x (modifier + tree.modifier))
    | None -> ());
  tree

let rec setup tree depth =
  match tree.left, tree.right with
    | None, None -> tree.x <- 0; tree.y <- depth; tree
    | None, Some x | Some x, None ->
      begin 
	tree.x <- (setup x (depth+1)).x;
	tree.y <- depth;
	tree
      end
    | Some left, Some right -> 
      begin
	let left = setup left (depth+1) in
	let right = setup right (depth+1) in
	tree.y <- depth;
	tree.x <- fix_subtrees left right; 
	tree
      end

let layout tree =
  add_modifiers (setup tree 0) 0

(** Creation *)

let dummy_node x = { value=x; thread=None; left=None; right= None
		   ; x=0; y=0; offset=0; modifier=0}
	     
let creer_noeud valeur fg fd = 
  {(dummy_node valeur) with left = fg; right = fd}
