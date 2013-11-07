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
  (if (= x 0)
      1
      (* x (factorial (- x 1)))))

(define (fib n)
  (if (< n 2)
      1
      (+ (fib (- n 1))
         (fib (- n 2)))))

;; 5.1

(define (square x) (* x x))

(define (map fn lst)
  (if (null? lst)
      nil
      (cons (fn (car lst))
            (map fn (cdr lst)))))

(define (reduce fn s lst)
  (if (null? lst)
      s
      (fn (car lst)
          (reduce fn s (cdr lst)))))

(define (make-btree entry left right)
  (cons entry
        (cons left
              right)))

(define (entry tree)
  (car tree))

(define (left tree)
   (car (cdr tree)))

(define (right tree)
  (cdr (cdr tree)))

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
  (if (null? tree)
      0
      (+ (entry tree)
         (btree-sum (left tree))
         (btree-sum (right tree)))))

(define (insert element lst position)
  (if (= position 0)
      (cons element
            (cdr lst))
      (cons (car lst)
            (insert element
                    (cdr lst)
                    (- position 1)))))

(define (duplicate lst)
  (if (null? lst)
      nil
      (cons (car lst)
            (cons (car lst)
                  (duplicate (cdr lst))))))
