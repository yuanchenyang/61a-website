;; 2.1
(define a 1)
a
(define b a)
b
(define c 'a)
c

;; 3.2
(+ 1)
(* 3)
(+ (* 3 3) (* 4 4))
(define a (define b 3))

;; 4.1
(define (factorial x)
  )

(define (fib n)
  (if (< n 2)
      1
      ))

;; 5.1
(define (map fn lst)
  )

(define (reduce fn s lst)
  )

(define (make-btree entry left right)
  (cons entry (cons left right)))

(define (entry tree)
  )

(define (left tree)
  )

(define (right tree)
  )

(define test-tree
  (make-btree 2
              (make-btree 1
                          nil
                          nil)
              (make-btree 4
                          (make-btree 3
                                      nil
                                      nil)
                          nil)))

(define (btree-sum tree)
  )

;; 5.2
(define (insert element lst position)
  )

(define (duplicate lst)
  )
