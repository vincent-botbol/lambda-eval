(** Kennedy algorithm *)
module Kennedy =
struct
  type 'a tree = Node of 'a * ('a tree list) 

  let move_tree = function
    | (Node ((label, x), subtrees)) ->
      function x' ->
	Node ((label, x +. x'), subtrees)

  type extent = (float * float) list

  let move_extent (ext : extent) x = 
    List.map (fun (p,q) -> (p+.x, p+.x)) ext

  (* TODO tail rec *)
  let rec merge (ext1 : extent) (ext2 : extent) =
    match ext1, ext2 with
      | [], qs -> qs
      | ps, [] -> ps
      | ((p,_)::ps), ((_, q)::qs) -> (p,q) :: (merge ps qs)

  (* fold_right?*)
  let merge_list es = List.fold_left merge [] es

  let rmax : float -> float -> float = max

  let rec fit ps qs =
    match ps, qs with
      | ((_,p)::ps), ((q,_)::qs) -> rmax (fit ps qs) (p -. q +. 1.)
      | _, _ -> 0.

  let fit_list_left es =
    let rec loop acc = function
      | [] -> []
      | e::es -> 
	let x = fit acc e in
	x :: (loop (merge acc (move_extent e x)) es)
    in
    loop [] es

  let fit_list_right es =
    let rec loop acc = function
      | [] -> []
      | (e::es) -> 
	let x = -.(fit e acc) in
	x :: loop (merge (move_extent e x) acc) es
    in
    List.rev (loop [] (List.rev es))

  let mean x y = (x+.y)/.2.
  let fit_list es = List.map2 mean (fit_list_left es) (fit_list_right es)

    
  let design tree =
    let rec loop (Node (label, subtrees)) =
      let trees, extents = List.split (List.map loop subtrees) in
      let positions = fit_list extents in
      let ptrees = List.map2 move_tree trees positions in
      let pextents = List.map2 move_extent extents positions in
      let result_extent = (0., 0.) :: merge_list pextents in
      let result_tree = Node((label, 0.), ptrees) in
      result_tree, result_extent
    in
    fst (loop tree)

  let design_absolute tree = 
    let rec loop x_abs tree = 
      match tree with
	| Node ((label, x), subtrees) -> 
	  let x' = x+.x_abs in
	  Node ((label, x'), List.map (loop x') subtrees)
    in
    loop 0. (design tree)

end

(*
let a = Node ("a", [])
let b = Node ("b", [a])
let l = Node ("bla", [a;b])
let r = Node ("bli", [l;l])
let root = Node ("blou", [l;r])
  
let tree_abs = design_absolute (Node ("bla", [root; root]))

let mylineto (x,y) = Graphics.lineto x y

let iof = int_of_float

  (** Problème avec les coef etc. Il faut assez de place => largeur max de l'arbre etc*)
let rec draw_tree i ppos (Node ((str, x), subtrees)) = 
  let open Graphics in
      let coef = 50. and dec = 250 in
      moveto (dec + iof (x*.coef)) (500 - (30 + i * 30));
      let cur_point = current_point () in
      (if i > 0 then
	  mylineto ppos);
      moveto (dec + iof (x *. coef)) (500 - (30 + i * 30));
      draw_string str;
      moveto (dec + iof (x *. coef)) (500- (30 + i * 30));
      List.iter (draw_tree (i + 1) (cur_point)) subtrees

let () = 
  let open Graphics in
      try 
	open_graph " 500x500";
	draw_tree 0 (0,0) tree_abs;
	
	ignore (wait_next_event [])
      with
	  e -> print_endline (Printexc.to_string e); close_graph ()
 end
*)

type 'a tree = {value:'a; mutable thread:'a tree option;
		left:'a tree option; right: 'a tree option;
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

(** Tests *)

let dummy x = { value=x; thread=None; left=None; right= None
	    ; x=0; y=0; offset=0; modifier=0}
	     
let creer_noeud valeur fg fd = 
  {(dummy valeur) with left = fg; right = fd}
    

let mylineto (x,y) = Graphics.lineto x y

let rec draw_tree ppos tree =
  let coef = 30 in
  let open Graphics in

      let x, y = (tree.x * coef) , (500 - (30 + tree.y * coef)) in
      moveto x y;
 
      if snd ppos > 0 then
	  begin 
	    mylineto ppos;
	    moveto x y
	  end;

      print_endline tree.value;
      draw_string tree.value;
      moveto x y;
      match tree.left, tree.right with
	| Some l, Some r ->
	  draw_tree (x,y) l; draw_tree (x,y) r
	| Some t, None | None, Some t ->
	  draw_tree (x,y) t
	| _ -> ()

let display_tree tree = 
  let open Graphics in
      try 
	open_graph " 500x500";
	draw_tree (0,0) tree;
	
	ignore (wait_next_event [])
      with
	  e -> print_endline (Printexc.to_string e); close_graph ()

let root () = 
  let l = creer_noeud "l" None None in
  let r = creer_noeud "r" None None in
  creer_noeud "R" (Some l) (Some r)

let bogoss = creer_noeud "X" (Some (root())) (Some (root()))
let sbg = creer_noeud "Y" None (Some bogoss) 

let () = display_tree (layout sbg)
