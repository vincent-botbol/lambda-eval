open Lambda
open Tree_layout


type term_layout =
  | Const_layout of string 
  | Var_layout of string 
  | App_layout
  | Abstr_layout of string

let term_to_tree_layout (t : term) : term_layout tree_layout = 
  let rec term_to_layout1 env = function
    | Const(s) -> creer_noeud (Const_layout s) None None
    | Var(n) -> 
      let s = (try List.nth env n
	with Failure "nth" -> (* failwith "Term_to_layout Unable to retrieve variable"*) 
	  "?") in
      creer_noeud (Var_layout s) None None
    | App(f,x) ->
      let fg = term_to_layout1 env f in
      let fd = term_to_layout1 env x in
      creer_noeud App_layout (Some fg) (Some fd)
    | Abstr(v,a) ->
      let (vars, env, next_t) = lambda_vars v (v::env) a in
      creer_noeud (Abstr_layout vars) (Some (term_to_layout1 env next_t)) None
  and lambda_vars acc env = function
    | Abstr(v,a) -> 
      lambda_vars (acc^v) (v::env) a
    | t -> (acc, env, t)
  in
  term_to_layout1 [] t



let value_to_string = function
  | Const_layout s -> s
  | Var_layout s -> s
  | App_layout -> "app"
  | Abstr_layout s -> "λ"^s

(* let rec draw_tree_with_graphics ppos tree = *)
(*   let coef = 30 in *)
(*   let open Graphics in *)

(*       let x, y = (tree.x * coef) , (500 - (30 + tree.y * coef)) in *)
(*       moveto x y; *)
 
(*       if snd ppos > 0 then *)
(* 	  begin  *)
(* 	    (fun (x,y) -> lineto x y) ppos; *)
(* 	    moveto x y *)
(* 	  end; *)

(*       draw_string (value_to_string tree.value); *)
(*       moveto x y; *)
(*       match tree.left, tree.right with *)
(* 	| Some l, Some r -> *)
(* 	  draw_tree_with_graphics (x,y) l; draw_tree_with_graphics (x,y) r *)
(* 	| Some t, None | None, Some t -> *)
(* 	  draw_tree_with_graphics (x,y) t *)
(* 	| _ -> () *)

(* let display_tree_with_graphics tree =  *)
(*   let open Graphics in *)
(*       try  *)
(* 	open_graph " 500x500"; *)
(* 	draw_tree_with_graphics (0,0) tree; *)
	
(* 	ignore (wait_next_event []) *)
(*       with *)
(* 	  e -> close_graph () *)

(* let test_with_graphics () =  *)
(*   let (>>) h f = f h in *)
(*   let l = red (-1) "(lxyz.xyz) 1 2" in *)
(*   List.iter (fun x -> term_to_tree_layout x >> layout >> display_tree_with_graphics) l *)
    
    
(* JS *)



let rec draw_tree_with_js context (xp, yp) tree = 
  let coef = 30 in
  let dec = 30 in
  let x, y = float_of_int (dec + tree.x * coef) , float_of_int (30 + tree.y * coef) in
  context##moveTo (x, y);
  
  if yp > 0. then
	  begin 
	    context##lineTo (xp, yp); 
	    context##stroke ();
	  end;

  context##fillText (Js.string (value_to_string tree.value), 
		     x, y);
  match tree.left, tree.right with
	| Some l, Some r ->
	  draw_tree_with_js context (x,y) l; draw_tree_with_js context (x,y) r
	| Some t, None | None, Some t ->
	  draw_tree_with_js context (x,y) t
	| _ -> ()

let init () =
  let doc = Dom_html.window##document in
  let canvas = Dom_html.createCanvas doc in
  canvas##style##border <- Js.string "1px solid black";
  canvas##width <- 500;
  canvas##height <- 500;
  
  let body = doc##body in
  Dom.appendChild body canvas;
  canvas##getContext (Dom_html._2d_)

let display_tree_with_js tree = 
  let context = init () in
  draw_tree_with_js context (-1.,-1.) tree

let () =
  display_tree_with_js (layout (term_to_tree_layout (term "(lxy.yx)((lx.x) 1) (lx.x)")))
