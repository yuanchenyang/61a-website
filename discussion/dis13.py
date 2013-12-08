def unique(iterable):
    """Return an iterator over the unique elements of an iterable input.
    >>> list(unique([1, 3, 2, 2, 5, 3, 4, 1]))
    [1, 3, 2, 5, 4]
    """
    seen = set()
    for elem in iterable:
        if elem not in seen:
            seen.add(elem)
            yield elem

def repeating(start, stop):
    """Return a stream of integers that repeats the range(start, stop).
    >>> s = repeating(3, 6)
    >>> s.first, s.rest.first, s.rest.rest.first, s.rest.rest.rest.first,
    (3, 4, 5, 3)
    >>> s.rest.rest.rest.rest.first
    4
    """
    def make_stream(current):
        def compute_rest():
            next = current + 1
            if next == stop:
                next = start
            return make_stream(next)
        return Stream(current, compute_rest)
    return make_stream(start)

class Stream(object):
    """A lazily computed recursive list."""

    class empty(object):
        def __repr__(self):
            return 'Stream.empty'

    empty = empty()

    def __init__(self, first, compute_rest=lambda: empty):
        assert callable(compute_rest), 'compute_rest must be callable.'
        self.first = first
        self._compute_rest = compute_rest
        self._rest = None

    @property
    def rest(self):
        """Return the rest of the stream, computing it if necessary."""
        if self._compute_rest is not None:
            self._rest = self._compute_rest()
            self._compute_rest = None
        return self._rest

    def __repr__(self):
        return 'Stream({0}, <...>)'.format(repr(self.first))
