(* ========================================================================= *)
(* Untyped lambda calculus.                                                  *)
(*                                                                           *)
(*                   Freek Wiedijk, University of Nijmegen                   *)
(* ========================================================================= *)

open List

let id x = x

let ( ** ) f g x = f (g x)

let rec index s l =
  match l with
    [] -> raise Not_found
  | t::k -> if s = t then 0 else (index s k) + 1

(* ------------------------------------------------------------------------- *)
(* Type of lambda terms.                                                     *)
(* ------------------------------------------------------------------------- *)

type term =
  Const of string
| App of term * term
| Abstr of string * term
| Var of int

(* ------------------------------------------------------------------------- *)
(* Reading lambda terms.                                                     *)
(* ------------------------------------------------------------------------- *)

let explode s =
  let rec explode1 n =
    try let s1 = String.make 1 s.[n] in s1::(explode1 (n + 1))
    with Invalid_argument _ -> [] in
  explode1 0

let implode l = fold_right (^) l ""

let lex l =
  let rec lex1 l =
    match l with
      [] -> []
    | c::k ->
        if mem c [" "; "\t"; "\n"] then lex1 k else
        if mem c ["l"; "."; "("; ")"] then c::(lex1 k) else
        if c = "'" then failwith "lex" else lex2 [c] k
  and lex2 v l =
    match l with
      [] -> [implode v]
    | c::k -> if c = "'" then lex2 (v@[c]) k else (implode v)::(lex1 l) in
  lex1 l

let parse l =
  let rec apps l =
    match l with
      [] -> failwith "parse"
    | [t] -> t
    | t::u::v -> apps (App(t,u)::v) in
  let rec parse1 c l =
    let t,k = parse2 c l in (apps t),k
  and parse2 c l =
    match l with
      [] -> [],[]
    | "l"::k -> let t,j = parse3 c k in [t],j
    | "."::_ -> failwith "parse"
    | "("::k ->
       (let t,j = parse1 c k in
          match j with
            ")"::i ->
              let u,h = parse2 c i in (t::u),h
          | _ -> failwith "parse")
    | ")"::_ -> [],l
    | s::k ->
       (let t = try Var(index s c) with Not_found -> Const(s) in
        let u,j = parse2 c k in
          (t::u),j)
  and parse3 c l =
    match l with
      [] -> failwith "parse"
    | "."::k -> parse1 c k
    | s::k ->
        if mem s ["l"; "("; ")"] then failwith "parse" else
          let t,j = parse3 (s::c) k in
            Abstr(s,t),j in
  let t,k = parse1 [] l in
    if k = [] then t else failwith "parse"

let term = parse ** lex ** explode


(* ------------------------------------------------------------------------- *)
(* Writing lambda terms.                                                     *)
(* ------------------------------------------------------------------------- *)

let term_to_string t =
  let rec term_to_string1 b1 b2 c t =
    match t with
      Const(s) -> s
    | Var(n) -> (try nth c n with Failure "nth" -> failwith "cannot retrieve")
    | App(f,x) ->
        let s = (term_to_string1 false true c f)^" "^
            (term_to_string1 true (not b1 && b2) c x) in
        if b1 then "("^s^")" else s
    | Abstr(v,a) ->
        let s = "λ"^(term_to_string2 c t) in
        if b2 then "("^s^")" else s
  and term_to_string2 c t =
    match t with
      Abstr(v,a) -> v^(term_to_string2 (v::c) a)
    | _ -> "."^(term_to_string1 false false c t) in
  term_to_string1 false false [] t

exception Prout of term

let alpha t =
  let rec occurs c t n v =
    match t with
      | Const(w) -> v = w
      | Var(m) -> m > n && v = nth c m
      | App(f,x) -> (occurs c f n v) || (occurs c x n v)
      | Abstr(w,a) -> occurs (w::c) a (n + 1) v in
  let rec alpha1 c t =
    match t with
      App(f,x) -> App(alpha1 c f,alpha1 c x)
      | Abstr(v,a) -> alpha2 c a v
      | _ -> t
  and alpha2 c t v =
    if occurs (v::c) t 0 v then 
      alpha2 c t (v^"'")
    else Abstr(v,alpha1 (v::c) t) 
  in
    alpha1 [] t

let print_term f t =
  Format.pp_print_string f ("term \""^(term_to_string (alpha t))^"\"")

let print_out =
  print_term Format.std_formatter


(* ------------------------------------------------------------------------- *)
(* Combinators.                                                              *)
(* ------------------------------------------------------------------------- *)

let combinators =
  ["I", term "lx.x";
   "K", term "lxy.x";
   "S", term "lxyz.(xz)(yz)";
   "B", term "lxyz.x(yz)";
   "C", term "lxyz.xzy";
   (* "1", term "lxy.xy"; *)
   "Y", term "lf.(lx.f(xx))(lx.f(xx))";
   "T", term "lxy.x";
   "F", term "lxy.y";
   "J", term "labcd.ab(adc)"]

let unfold f =
  match f with
    Const(s) -> (try assoc s combinators with Not_found -> f)
  | _ -> f


(* ------------------------------------------------------------------------- *)
(* Reduction.                                                                *)
(* ------------------------------------------------------------------------- *)

let rec lift d n t =
  match t with
    Var(m) -> if m >= n then Var(m + d) else Var(m)
  | App(f,x) -> App(lift d n f,lift d n x)
  | Abstr(v,a) -> Abstr(v,lift d (n + 1) a)
  | _ -> t

let rec subst n u t =
  match t with
    Var(m) -> if m = n then lift n 0 u else if m > n then Var(m - 1) else t
  | App(f,x) -> App(subst n u f,subst n u x)
  | Abstr(v,a) -> Abstr(v,subst (n + 1) u a)
  | _ -> t

exception Normal

let maybe f x = try f x with Normal -> x

let beta i t =
  match t with
    App(f,x) ->
     (match unfold f with
        Abstr(_,a) -> subst 0 (maybe i x) (maybe i a)
      | _ -> raise Normal)
  | _ -> raise Normal

let rec leftmost_innermost t =
  match t with
    App(f,x) ->
     (try App(leftmost_innermost f,x)
      with Normal ->
        try App(f,leftmost_innermost x)
        with Normal ->
          beta id t)
  | Abstr(v,a) -> Abstr(v,leftmost_innermost a)
  | _ -> raise Normal

let rec leftmost_outermost t =
  match t with
    App(f,x) ->
     (try beta id t
      with Normal ->
        try App(leftmost_outermost f,x)
        with Normal ->
          App(f,leftmost_outermost x))
  | Abstr(v,a) -> Abstr(v,leftmost_outermost a)
  | _ -> raise Normal

let rec parallel_outermost t =
  match t with
    App(f,x) ->
     (try beta id t
      with Normal ->
        try let g = parallel_outermost f in
          App(g,maybe parallel_outermost x)
        with Normal ->
          App(f,parallel_outermost x))
  | Abstr(v,a) -> Abstr(v,parallel_outermost a)
  | _ -> raise Normal

let rec gross_knuth t =
  match t with
    App(f,x) ->
     (try beta gross_knuth t
      with Normal ->
        try let g = gross_knuth f in
          App(g,maybe gross_knuth x)
        with Normal ->
          App(f,gross_knuth x))
  | Abstr(v,a) -> Abstr(v,gross_knuth a)
  | _ -> raise Normal

exception Irreductible of term

let rec reduce x z n t =
  let rec loop acc x z n t = 
    if n = 0 then 
      List.rev (z@acc)
    else
      try 
	let acc = t::acc in
	let u = x t in 
	if List.exists ((=) u) acc then
	  raise (Irreductible u)
	else
	  loop acc x z (n - 1) u
      with 
	| Normal -> List.rev (t::acc)
	| Irreductible u -> List.rev (Const("Infinite loop detected")::u::t::acc)

  in
    loop [] x z n t
	    
let rec normal_form x t =
  try normal_form x (x t) with Normal -> t

(* ------------------------------------------------------------------------- *)
(* Abbrevs.                                                                  *)
(* ------------------------------------------------------------------------- *)

let etc = [Const("...")]
let all = -1

let nf = normal_form leftmost_outermost ** term

let red n = reduce leftmost_outermost etc n ** term
let red_eager n = reduce leftmost_innermost etc n ** term
let red_par n = reduce parallel_outermost etc n ** term
let red_gk n = reduce gross_knuth etc n ** term

(*
(* ------------------------------------------------------------------------- *)
(* Examples.                                                                 *)
(* ------------------------------------------------------------------------- *)

let _ = nf "(lx.fx)a"
let _ = nf "(KISS)(KISS)"
let _ = red_gk all "SKK"
let _ = red 7 "(lx.xx)(lx.xx)"


let _ = red all "(lxy.yx)((lx.x) 1) (lx.x)"
let _ = red_eager all "(lxy.yx)((lx.x) 1) (lx.x)"
*)

