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

let rec max_x = function
  | {right=Some t; _} -> max_x t
  | t -> t.x

let rec max_y = function
  | {right=Some t1; left=Some t2; _} ->
    max (max_y t1) (max_y t2)
  | {right=Some t; _} | {left=Some t; _} -> max_y t
  | t -> t.y
    
(* JS *)

(** Vars glob *)
let doc = Dom_html.window##document
let text_input = Js.coerce_opt (doc##getElementById (Js.string "MonQ"))
  Dom_html.CoerceTo.input (fun _ -> assert false)
let button = Js.coerce_opt (doc##getElementById (Js.string "MonB"))
  Dom_html.CoerceTo.button (fun _ -> assert false)
let canvas = Js.coerce_opt (doc##getElementById (Js.string "MonC"))
  Dom_html.CoerceTo.canvas (fun _ -> assert false)
let context = canvas##getContext (Dom_html._2d_)
let select = Js.coerce_opt (doc##getElementById (Js.string "MonS"))
  Dom_html.CoerceTo.select (fun _ -> assert false)

let curr_tree = ref None
let curr_strat = ref Lambda.red

let draw_tree_with_js context tree =
  let coef_x = ref 30. in
  let coef_y = ref 30. in
  let dec = ref 30. in
  let maxX, maxY = float_of_int (max_x tree), float_of_int (max_y tree) in
  if maxX *. !coef_x > float_of_int canvas##width -. !dec then
    coef_x := (float_of_int canvas##width -. 2. *. !dec) /. maxX;
  if maxY *. !coef_y > float_of_int canvas##height -. !dec then
    coef_y := (float_of_int canvas##height -. 2. *. !dec) /. maxY;

  let rec loop  context (xp, yp) tree =
    let x, y = !dec +. float_of_int tree.x *. !coef_x , 
      !dec +. float_of_int tree.y *. !coef_y in
    context##moveTo (x, y);  

  if yp > 0. then
    begin
      context##lineTo (xp, yp);
      context##stroke ();
    end;
  let new_y = y +. 10. in  
  context##moveTo(x, new_y);
  let v_str = value_to_string tree.value in
  (* String pos *)
  let x',y' = x -. (float_of_int (String.length v_str * 2)) 
    , new_y -. 2. in 
  context##fillStyle <- Js.string
    (match tree.value with
    | Const_layout _ -> "#0000FF"
    | Var_layout _ -> "#00FF00"
    | App_layout -> "#FF0000"
    | Abstr_layout _ -> "#FFA000");
  context##fillText (Js.string v_str, x', y');
  
  match tree.left, tree.right with
  | Some l, Some r ->
    loop context (x,new_y) l; loop context (x,new_y) r
  | Some t, None | None, Some t ->
    loop context (x,new_y) t
  | _ -> () in
  loop context (0.,0.) tree

  


let (>>) h f = f h 

let display_tree_with_js tree = 
  (* let context = canvas##getContext (Dom_html._2d_) in *)
  draw_tree_with_js context tree

let display_term str_term =
 
  term str_term >> term_to_tree_layout >> layout >> display_tree_with_js
  
let setup_handlers () =
  let button_action _ = 
    context##fillStyle <- Js.string "#FFFFFF";
    context##fillRect (0., 0., 500., 500.);
    context##beginPath ();
    let str = Js.to_string (text_input##value) in
    curr_tree := Some (term str);
    display_term str;
    Js._true
  in
  button##onclick  <- Dom_html.handler button_action;
  let select_action ev = 
    let x = select##value in
    (* match *)
    Js._true
  in
  select##onchange <- Dom_html.handler select_action


let () = setup_handlers ()

let () =
  display_term "(lxy.yx)((lx.x) 1) (lx.x)"
