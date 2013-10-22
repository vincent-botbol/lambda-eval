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
val leftmost_innermost : term -> term
val leftmost_outermost : term -> term
val parallel_outermost : term -> term
val gross_knuth : term -> term

(** Donne la forme normale d'un lambda-terme *)
val nf : string -> term

(** [red n str] réduit jusqu'à la limite n le terme str en utilisant
    la stratégie d'appel par nom (call-by-name) / externe gauche (leftmost_outermost) *)
val red : int -> string -> term list

(** [red_eager n str] réduit au maximum n fois le terme str en utilisant
    la stratégie applicative (call-by-value) / interne gauche (leftmost_innermost) *)
val red_eager : int -> string -> term list

(** [red_par n str] réduit au maximum n fois le terme str en utilisant
    la stratégie non-déterministe : parallel call-by-name
    (parallel_outermost) *)
val red_par : int -> string -> term list

(** [red_gk n str] réduit au maximum n fois le terme str en utilisant
    la stratégie gross_knuth *)
val red_gk : int -> string -> term list
