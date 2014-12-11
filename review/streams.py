class Stream:
    class empty: pass
    empty = empty()

    def __init__(self, first, compute_rest=lambda: Stream.empty):
        self.first = first
        self._compute_rest = compute_rest

    @property
    def rest(self):
        """Return the rest of the stream, computing it if necessary."""
        if self._compute_rest is not None:
            self._rest = self._compute_rest()
            self._compute_rest = None
        return self._rest



def make_integer_stream(n):
    return Stream(n, lambda: make_integer_stream(n + 1))
naturals  = make_integer_stream(0)
positives = make_integer_stream(1)

def stream_add(s1, s2):
    return Stream(s1.first + s2.first, lambda: stream_add(s1.rest, s2.rest))

def stream_mul(s1, s2):
    return Stream(s1.first * s2.first, lambda: stream_mul(s1.rest, s2.rest))

def stream_map(fn, s):
    return Stream(fn(s.first), lambda: stream_map(fn, s.rest))

# Warmup: what are the first 5 terms of the following streams?
def stream1():
    fn = lambda n: (4 * n + 2) / (n + 2)
    return Stream(1, lambda: stream_mul(stream_map(fn, naturals), stream1()))

def stream2():
    triple = lambda x: x * 3
    rest = lambda: stream_add(stream2(), stream_map(triple, stream2().rest))
    return Stream(1, lambda: Stream(1, rest))



# Warmup: Recall interleave from lab, which takes in two infinite streams:
#  a1, a2, a3, ...
#  b1, b2, b3, ...
# And returns
#  a1, b1, a2, b2, ...
# Write interleave.

def interleave(stream1, stream2):
    "*** YOUR CODE HERE ***"

# Define a procedure partial_sums that takes as argument a stream S and returns
# the stream whose elements are S0, S0 + S1, S0 + S1 + S2, .... For example,
# partial_sums(positives) should be the stream 1, 3, 6, 10, 15, ....

def partial_sums(s):
    "*** YOUR CODE HERE ***"



# Suppose we have two streams S  and T, and imagine the infinite rectangular
# array:

#  (S0, T0) (S0, T1) (S0, T2) ...
#  (S1, T0) (S1, T1) (S1, T2) ...
#  (S2, T0) (S2, T1) (S2, T2) ...
#  ...

# We wish to generate a stream that contains all the pairs in the array that lie
# on or above the diagonal, i.e. the pairs:

#  (S0, T0) (S0, T1) (S0, T2) ...
#           (S1, T1) (S1, T2) ...
#                    (S2, T2) ...
#                             ...

# Call the general stream of pairs pairs(S, T), and consider it to be composed
# of three parts: the pair (S0, T0), the rest of the pairs in the first row, and
# the remaining pairs:

#  (S0, T0) | (S0, T1) (S0, T2) ...
#  --------------------------------
#           | (S1, T1) (S1, T2) ...
#           |          (S2, T2) ...
#           |                   ...

# Now since we have broken this stream into three parts, we can recursively
# compute the rest and combine them together with interleave, which we've
# written earlier.

# Now write pairs, which takes two streams and outputs a stream of all possible
# pairs of elements from these two streams above and including the diagonal. For
# example, pairs(positives, positives) should return a stream starting with:
#  (1, 1), (1, 2), (2, 2), (1, 3), (2, 3), ...

def pairs(s, t):
    "*** YOUR CODE HERE ***"



# Assuming we have a is_prime function, construct a stream of all pairs of
# natural numbers that sum up to a prime.

def prime_sum_pairs():
    "*** YOUR CODE HERE ***"



