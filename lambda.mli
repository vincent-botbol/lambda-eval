type term =
    Const of string
  | App of term * term
  | Abstr of string * term
  | Var of int

(** Parse un lambda-terme *)
val term : string -> term
(** Transforme un lambda-terme en chaine de caractère *)
val term_to_string : term -> string

(** Fonctions d'impressions *)
val print_term : Format.formatter -> term -> unit
val print_out : term -> unit

(** alpha conversion *)
val alpha : term -> term

(** beta reduction *)
val beta : (term -> term) -> term -> term

(** stratégies de réduction *)
val call_by_name : term -> term
val call_by_value : term -> term

(** [red n str] réduit jusqu'à la limite n le terme str en utilisant
    la stratégie d'appel par nom (call-by-name) / externe gauche (leftmost_outermost) *)
val red : int -> string -> term list

(** [red_eager n str] réduit au maximum n fois le terme str en utilisant
    la stratégie applicative (call-by-value) / interne gauche (leftmost_innermost) *)
val red_eager : int -> string -> term list
