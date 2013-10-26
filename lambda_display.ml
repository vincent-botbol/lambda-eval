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
let side_panel = Js.coerce_opt (doc##getElementById (Js.string "MonP"))
  Dom_html.CoerceTo.div (fun _ -> assert false)
let examples = Js.coerce_opt (doc##getElementById (Js.string "examples"))
  Dom_html.CoerceTo.div (fun _ -> assert false)

let curr_strat = ref red
let term_list = ref []

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
  let new_y = y +. 15. in  
  context##moveTo(x, new_y);
  let v_str = value_to_string tree.value in
  (* String pos *)
  let x',y' = x -. (float_of_int (String.length v_str * 2)) 
    , new_y -. 2. in 
  context##fillStyle <- Js.string
    (match tree.value with
    | Const_layout _ -> "#0000FF"
    | Var_layout _ -> "#006400"
    | App_layout -> "#FF0000"
    | Abstr_layout _ -> "#FFA000");
  context##fillText (Js.string v_str, x', y');
  
  match tree.left, tree.right with
  | Some l, Some r ->
    loop context (x,new_y+. 5.) l; loop context (x,new_y+. 5.) r
  | Some t, None | None, Some t ->
    loop context (x,new_y+. 5.) t
  | _ -> () in
  loop context (0.,0.) tree

    


let (>>) h f = f h 
let node x = (x : #Dom.node Js.t :> Dom.node Js.t)

let display_tree_with_js tree =   
  context##fillStyle <- Js.string "#FFFFFF";
  context##fillRect (0., 0., 500., 500.);
  context##beginPath ();
  draw_tree_with_js context tree

let display_term term = term >> alpha >> term_to_tree_layout >> layout >> display_tree_with_js
let display_str_term str_term =
  term str_term >> display_term

let clean_panel () = 
  (* marche pas bien *)
  let children = side_panel##childNodes in
  for i = 0 to children##length - 1 do
    Js.Opt.iter (children##item (i)) (fun n -> Dom.removeChild side_panel n);
  done

let load_side_panel () =
  clean_panel (); clean_panel (); (* :l *)
  let next_button = Dom_html.createInput ?_type:(Some (Js.string "submit")) doc in
  let prec_button = Dom_html.createInput ?_type:(Some (Js.string "submit")) doc in
  next_button##value <- Js.string "Next";
  prec_button##value <- Js.string "Prec";
  
  Dom.appendChild side_panel prec_button;
  Dom.appendChild side_panel next_button;
  
  let select_term = Dom_html.createSelect doc in
  select_term##size <- 6;
  select_term##style##minWidth <- Js.string "250px";
  select_term##style##marginTop <- Js.string "10px";
  select_term##style##display <- Js.string "block";

  let add_option_to_select_term str = 
    let option = Dom_html.createOption doc in
    Dom.appendChild option (doc##createTextNode (Js.string str));
    Dom.appendChild select_term option
  in
  Dom.appendChild side_panel select_term;
  List.iter add_option_to_select_term (List.map (fun t -> term_to_string (alpha t)) !term_list);
  
  select_term##onchange <- Dom_html.handler 
    (fun _ -> 
      let idx = select_term##selectedIndex in
      display_term (List.nth !term_list idx);
      Js._true
    );
  prec_button##onclick <- Dom_html.handler
    (fun _ ->
      let idx = select_term##selectedIndex in
	if idx < 0 then 
	  begin
	    let idx' = List.length !term_list - 2 in
	    select_term##selectedIndex <- idx';
	    display_term (List.nth !term_list idx');
	  end
	else if idx = 0 then
	  select_term##selectedIndex <- 0
	else
	  begin
	    let idx' = select_term##selectedIndex - 1 in
	      select_term##selectedIndex <- idx';
	      display_term (List.nth !term_list idx');
	  end;
	Js._true
    );
  next_button##onclick <- Dom_html.handler
    (fun _ ->
       let idx = select_term##selectedIndex in
	 if idx < 0 || idx = List.length !term_list - 1 then 
	   select_term##selectedIndex <- List.length !term_list - 1 
	 else 
	   begin
	     let idx' = select_term##selectedIndex + 1 in
	       select_term##selectedIndex <- idx';
	       display_term (List.nth !term_list idx');
	   end;
	 Js._true
	
    );
  ()

let button_action _ = 
    let str = Js.to_string (text_input##value) in

    term_list := !curr_strat (-1) str;
      display_term (List.nth !term_list ((List.length !term_list) - 1));
    load_side_panel ();
    Js._true

let setup_handlers () =  
  button##onclick  <- Dom_html.handler button_action;
  let select_action _ = 
    let x = select##value in
    (match Js.to_string x with
      | "cbn" -> curr_strat := red
      | "cbv" -> curr_strat := red_eager
      | _ -> assert false
    );
    Js._true
  in
  select##onchange <- Dom_html.handler select_action
    
let load_examples () =
  (* str_term, strategy, comment option *) 
  let ex_list = 
    [ ("(lx.f x) a", red, None)
    ; ("(KISS)(KISS)", red, None)
    ; ("(lx.xx)(lx.xx)", red, Some "Terme irreductible")
    ; "(lxy.yx)((lx.x) 1) (lx.x)", red, Some "Appel par nom"
    ; "(lxy.yx)((lx.x) 1) (lx.x)", red_eager, Some "Appel par valeur"
    ]
  in
  let add_example (str_term, red_strat, info_opt) =
    let a = Dom_html.createA doc in
      a##href <- Js.string "#";
      a##onclick <- Dom_html.handler (fun _ -> 
	   text_input##value <- Js.string str_term;
	   curr_strat := red_strat;
	   ignore (button_action ());
	   Js._true
	);
      Dom.appendChild a (doc##createTextNode (Js.string str_term));
      Dom.appendChild examples a;      
      (match info_opt with
	 | Some x -> Dom.appendChild examples 
	     (doc##createTextNode (Js.string (" - "^x)));
	 | None -> ());
      Dom.appendChild examples (Dom_html.createBr doc);
  in
    List.iter add_example ex_list

let () = 
  setup_handlers ();
  load_examples ()
 
let () = text_input##value <- Js.string "(KISS)(KISS)"
