(define (last s)
  (if (null? (cdr s))
      (car s)
      (last (cdr s))))

(define (fib n)
  (define (fibi curr prev total)
    (if (= total n)
        curr
        (fibi (+ curr prev)
              curr
              (+ total 1))))
  (fibi 1 0 1))

(define (reverse lst)
  (define (helper reversed remaining)
    (if (null? remaining)
        reversed
        (helper (append (cons (car remaining)
                              '())
                        reversed)
                (cdr remaining))))
  (helper '() lst))

(define (insert n s)
  (define (ins-iter lst remaining n)
    (if (or (null? remaining)
            (< n (car remaining)))
      	(append lst (list n) remaining)
        (ins-iter (append lst
                          (list (car remaining)))
                  (cdr remaining)
                  n)))
  (ins-iter '() s n))
