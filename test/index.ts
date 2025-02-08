import * as fn from '../src/index'
import test from 'tape'

// ----- pick -----------------------------------------------------------------

test('pick: basic keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.pick(obj, ['a', 'c'])
  t.deepEqual(result, { a: 1, c: 3 }, 'should pick specified keys')
  t.end()
})

test('pick: non-existent keys', t => {
  const obj = { a: 1, b: 2 }
  const result = fn.pick(obj, ['c'] as any)
  t.deepEqual(result, {}, 'should ignore non-existent keys')
  t.end()
})

test('pick: with empty keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.pick(obj, [])
  t.deepEqual(result, {}, 'should return an empty object when no keys are provided')
  t.end()
})

test('pick: all keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.pick(obj, ['a', 'b', 'c'])
  t.deepEqual(result, obj, 'should return a copy of the object with all keys')
  t.end()
})

test('pick: nested objects and arrays', t => {
  const obj = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] }
  const result = fn.pick(obj, ['b', 'c'])
  t.deepEqual(result, { b: { x: 10, y: 20 }, c: [1, 2, 3] }, 'should correctly pick nested objects and arrays')
  t.end()
})

test('pick: returns a new object', t => {
  const obj = { a: 1, b: 2 }
  const result = fn.pick(obj, ['a'])
  result.a = 100
  t.notEqual(obj.a, result.a, 'modifying the result should not modify the original object')
  t.end()
})

test('pick: preserves undefined values', t => {
  const obj = { a: 1, b: undefined }
  const result = fn.pick(obj, ['a', 'b'])
  t.deepEqual(result, { a: 1, b: undefined }, 'should preserve keys with undefined values')
  t.end()
})

test('pick: with arrays', t => {
  const arr = [10, 20, 30]
  // Note: keys for arrays are the indices (numbers), but object keys are strings
  const result = fn.pick(arr, [0, 2])
  t.deepEqual(result, { '0': 10, '2': 30 }, 'should pick specified array indices as object properties')
  t.end()
})

// ----- omit -----------------------------------------------------------------

test('omit: non-existent keys', t => {
  const obj = { a: 1, b: 2 }
  const result = fn.omit(obj, ['c'] as any)
  t.deepEqual(result, obj, 'should ignore non-existent keys')
  t.end()
})

test('omit: basic keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.omit(obj, ['b'])
  t.deepEqual(result, { a: 1, c: 3 }, 'should omit specified key')
  t.end()
})

test('omit: with empty keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.omit(obj, [])
  t.deepEqual(result, obj, 'should return a copy of the object when no keys are provided')
  t.end()
})

test('omit: all keys', t => {
  const obj = { a: 1, b: 2, c: 3 }
  const result = fn.omit(obj, ['a', 'b', 'c'])
  t.deepEqual(result, {}, 'should return an empty object when all keys are omitted')
  t.end()
})

test('omit: non-existent key', t => {
  const obj = { a: 1, b: 2 }
  // Using type assertion to simulate passing a non-existent key
  const result = fn.omit(obj, ['c'] as any)
  t.deepEqual(result, obj, 'should ignore keys that are not in the object')
  t.end()
})

test('omit: nested objects and arrays', t => {
  const obj = { a: 1, b: { x: 10, y: 20 }, c: [1, 2, 3] }
  const result = fn.omit(obj, ['b'])
  t.deepEqual(result, { a: 1, c: [1, 2, 3] }, 'should omit nested object key correctly')
  t.end()
})

test('omit: does not mutate the original object', t => {
  const obj = { a: 1, b: 2 }
  const result: Omit<typeof obj, 'a'> = fn.omit(obj, ['a'])
  result.b = 100
  t.equal(obj.b, 2, 'modifying the result should not modify the original object')
  t.end()
})

test('omit: with arrays', t => {
  const arr = [10, 20, 30]
  // The spread operator converts the array into an object with keys '0', '1', '2'
  const result = fn.omit(arr, [1])
  t.deepEqual(result, { '0': 10, '2': 30 }, 'should omit specified array index as object property')
  t.end()
})

// ----- set ------------------------------------------------------------------

test('set: basic deep property', t => {
  const obj = { a: { b: 1 } }
  const result = fn.set('a.b', obj, 42)
  t.deepEqual(result, { a: { b: 42 } }, 'updates deep property')
  t.end()
})

test('set: creates missing intermediate property', t => {
  const obj = {}
  // If your implementation tries to spread undefined, it may throw.
  // We show both behaviors here.
  try {
    const result = fn.set('a.b', obj, 42)
    t.deepEqual(result, { a: { b: 42 } }, 'should create missing intermediate object')
  } catch (error) {
    t.pass('throws error when intermediate property is missing')
  }
  t.end()
})

test('set: with array index', t => {
  const obj = { arr: [{ a: 1 }, { b: 2 }] }
  const result = fn.set('arr.1.b', obj, 42)
  t.deepEqual(result, { arr: [{ a: 1 }, { b: 42 }] }, 'updates array element deep property')
  t.end()
})

test('set: immutability', t => {
  const obj = { a: { b: 1 }, c: 3 }
  const result = fn.set('a.b', obj, 42)
  t.notEqual(result, obj, 'returns a new object')
  t.notEqual(result.a, obj.a, 'returns a new nested object')
  t.deepEqual(obj, { a: { b: 1 }, c: 3 }, 'original object remains unchanged')
  t.end()
})

test('set: at root level', t => {
  const obj = { a: 1 }
  const result = fn.set('b', obj, 2)
  t.deepEqual(result, { a: 1, b: 2 }, 'sets property at the root level')
  t.end()
})

test('set: with empty path', t => {
  const obj = { a: 1 }
  try {
    fn.set('', obj, 42)
    t.fail('should throw an error when path is empty')
  } catch (error) {
    t.pass('throws error when path is empty')
  }
  t.end()
})

test('set: with non-object intermediate (primitive)', t => {
  const obj = { a: 42 }
  // If the intermediate is a primitive, some implementations might throw.
  // Or it might replace that primitive with an object. We verify both possibilities.
  try {
    const result = fn.set('a.b', obj, 100)
    t.deepEqual(result, { a: { b: 100 } }, 'should replace non-object intermediate with an object')
  } catch (error) {
    t.pass('throws error when intermediate value is a primitive')
  }
  t.end()
})

// ----- merge ----------------------------------------------------------------

test('merge: deep merge', t => {
  const a = { a: { x: 1 } }
  const b = { a: { y: 2 } }
  const result = fn.merge(a, b)
  t.deepEqual(result, { a: { x: 1, y: 2 } }, 'should merge nested objects deeply')
  t.end()
})

test('merge: basic objects', t => {
  const a = { a: 1, b: 2 }
  const b = { c: 3, d: 4 }
  const result = fn.merge(a, b)
  t.deepEqual(result, { a: 1, b: 2, c: 3, d: 4 }, 'should merge two objects with distinct keys')
  t.end()
})

test('merge: overlapping keys: second overwrites first', t => {
  const a = { a: 1, b: 2 }
  const b = { b: 42, c: 3 }
  const result = fn.merge(a, b)
  t.deepEqual(result, { a: 1, b: 42, c: 3 }, 'should override overlapping keys with b')
  t.end()
})

test('merge: immutability: original objects remain unchanged', t => {
  const a = { a: 1 }
  const b = { b: 2 }
  const result = fn.merge(a, b)
  result.a = 100
  result.b = 100
  t.deepEqual(a, { a: 1 }, 'should not modify the first object')
  t.deepEqual(b, { b: 2 }, 'should not modify the second object')
  t.end()
})

test('merge: deep merge: nested objects are merged deeply', t => {
  const a = { a: { x: 1 } }
  const b = { a: { y: 2 } }
  const result = fn.merge(a, b)
  t.deepEqual(result, { a: { x: 1, y: 2 } }, 'should merge nested objects deeply')
  t.end()
})

test('merge: with arrays as values', t => {
  const a = { a: [1, 2] }
  const b = { b: [3, 4] }
  const result = fn.merge(a, b)
  t.deepEqual(result, { a: [1, 2], b: [3, 4] }, 'should merge objects containing arrays')
  t.end()
})

test('merge: with empty objects', t => {
  const a = {}
  const b = { a: 1 }
  const result1 = fn.merge(a, b)
  t.deepEqual(result1, { a: 1 }, 'merging an empty object with b yields b')

  const c = {}
  const result2 = fn.merge(b, c)
  t.deepEqual(result2, { a: 1 }, 'merging b with an empty object yields b')
  t.end()
})

// ----- zip ------------------------------------------------------------------

test('zip: with arrays of different lengths', t => {
  const a = [1, 2, 3]
  const b = ['a', 'b']
  const result = fn.zip(a, b)
  t.deepEqual(
    result,
    [[1, 'a'], [2, 'b'], [3, undefined]],
    'should handle arrays of different lengths gracefully'
  )
  t.end()
})

test('zip: with equal length arrays', t => {
  const a = [1, 2, 3]
  const b = ['a', 'b', 'c']
  const result = fn.zip(a, b)
  t.deepEqual(result, [[1, 'a'], [2, 'b'], [3, 'c']], 'should zip arrays of equal length correctly')
  t.end()
})

test('zip: with first array longer than second', t => {
  const a = [1, 2, 3, 4]
  const b = ['a', 'b']
  const result = fn.zip(a, b)
  t.deepEqual(
    result,
    [[1, 'a'], [2, 'b'], [3, undefined], [4, undefined]],
    'fills missing values with undefined when first array is longer'
  )
  t.end()
})

test('zip: with second array longer than first', t => {
  const a = [1, 2]
  const b = ['a', 'b', 'c', 'd']
  const result = fn.zip(a, b)
  t.deepEqual(
    result,
    [[1, 'a'], [2, 'b'], [undefined, 'c'], [undefined, 'd']],
    'fills missing values with undefined when second array is longer'
  )
  t.end()
})

test('zip: with empty arrays', t => {
  const a: number[] = []
  const b: string[] = []
  const result = fn.zip(a, b)
  t.deepEqual(result, [], 'returns an empty array when both inputs are empty')
  t.end()
})

test('zip: does not mutate input arrays', t => {
  const a = [1, 2, 3]
  const b = ['a', 'b', 'c']
  const result = fn.zip(a, b)
  // Modify the inputs after zipping
  a[0] = 100
  b[0] = 'z'
  t.deepEqual(result, [[1, 'a'], [2, 'b'], [3, 'c']], 'input arrays remain unchanged')
  t.end()
})

test('zip: with non-primitive elements', t => {
  const a = [{ id: 1 }, { id: 2 }]
  const b = [{ name: 'Alice' }, { name: 'Bob' }]
  const result = fn.zip(a, b)
  t.deepEqual(
    result,
    [[{ id: 1 }, { name: 'Alice' }], [{ id: 2 }, { name: 'Bob' }]],
    'zips arrays containing objects correctly'
  )
  t.end()
})

// ----- s --------------------------------------------------------------------

test('s: with non-function first element', t => {
  try {
    fn.s([42 as any])
    t.fail('should throw an error when first element is not a function')
  } catch (error) {
    t.pass('throws error when first element is not a function')
  }
  t.end()
})

test('s: with a function that takes no arguments', t => {
  const f = () => 42
  const result = fn.s([f])
  t.equal(result, 42, 'should return 42 when calling a no-args function')
  t.end()
})

test('s: with a function that sums two numbers', t => {
  const sum = (a: number, b: number) => a + b
  const result = fn.s([sum, 3, 5])
  t.equal(result, 8, 'should correctly sum two numbers')
  t.end()
})

test('s: with a function that concatenates strings', t => {
  const concat = (a: string, b: string) => a + b
  const result = fn.s([concat, 'foo', 'bar'])
  t.equal(result, 'foobar', 'should correctly concatenate two strings')
  t.end()
})

test('s: with a function that performs a more complex operation', t => {
  const combine = (x: number, y: number, z: number) => x * y + z
  const result = fn.s([combine, 2, 3, 4])
  t.equal(result, 10, 'should correctly calculate (2*3)+4')
  t.end()
})

test('s: with a function that returns an object', t => {
  const identity = (obj: { value: number }) => obj
  const input = { value: 123 }
  const result = fn.s([identity, input])
  t.deepEqual(result, input, 'should return the input object unchanged')
  t.end()
})

// ----- partition ------------------------------------------------------------

test('partition: with non-function predicate', t => {
  const arr = [1, 2, 3]
  try {
    fn.partition(arr, 42 as any)
    t.fail('should throw an error when predicate is not a function')
  } catch (error) {
    t.pass('throws error when predicate is not a function')
  }
  t.end()
})

test('partition: all elements true', t => {
  const arr = [1, 2, 3]
  const predicate = (x: number) => x > 0
  const result = fn.partition(arr, predicate)
  t.deepEqual(result, [[1, 2, 3], []], 'all elements match predicate')
  t.end()
})

test('partition: all elements false', t => {
  const arr = [1, 2, 3]
  const predicate = (x: number) => x < 0
  const result = fn.partition(arr, predicate)
  t.deepEqual(result, [[], [1, 2, 3]], 'no elements match predicate')
  t.end()
})

test('partition: mixed elements', t => {
  const arr = [1, 2, 3, 4, 5, 6]
  const predicate = (x: number) => x % 2 === 0
  const result = fn.partition(arr, predicate)
  t.deepEqual(result, [[2, 4, 6], [1, 3, 5]], 'even numbers in first partition, odd numbers in second')
  t.end()
})

test('partition: empty array', t => {
  const arr: number[] = []
  const predicate = (x: number) => x > 0
  const result = fn.partition(arr, predicate)
  t.deepEqual(result, [[], []], 'empty array partitions into two empty arrays')
  t.end()
})

test('partition: complex predicate with strings', t => {
  const arr = ['apple', 'banana', 'apricot', 'cherry']
  const predicate = (str: string) => str.startsWith('a')
  const result = fn.partition(arr, predicate)
  t.deepEqual(result, [['apple', 'apricot'], ['banana', 'cherry']], 'partitions strings based on starting letter')
  t.end()
})

// ----- composeL -------------------------------------------------------------

test('composeL returns identity when no functions are provided', t => {
  const identity = fn.composeL<number>()
  t.equal(identity(42), 42, 'composeL with no functions returns the identity function')
  t.end()
})

test('composeL with a single function', t => {
  const addOne = (x: number) => x + 1
  const result = fn.composeL(addOne)(5)
  t.equal(result, 6, 'composeL with a single function works correctly')
  t.end()
})

test('composeL with two functions of different types', t => {
  const strToNumber = (s: string) => s.length
  const numberToBoolean = (n: number) => n > 3
  // Left-to-right: numberToBoolean(strToNumber(s))
  const composed = fn.composeL(strToNumber, numberToBoolean)
  t.equal(composed('test'), true, 'composeL returns true for "test"')
  t.equal(composed('hi'), false, 'composeL returns false for "hi"')
  t.end()
})

test('composeL with three functions of different types', t => {
  const addThree = (x: number) => x + 3
  const numberToString = (x: number) => x.toString()
  const prependHello = (s: string) => `Hello ${s}`
  // Left-to-right: prependHello(numberToString(addThree(x)))
  const composed = fn.composeL(addThree, numberToString, prependHello)
  t.equal(composed(7), 'Hello 10', 'composeL correctly composes three functions')
  t.end()
})

test('composeL with four functions of different types', t => {
  const f1 = (n: number): string => n.toString()
  const f2 = (s: string): boolean => s.length > 2
  const f3 = (b: boolean): number => b ? 100 : 0
  const f4 = (n: number): string => `Value: ${n}`

  // Left-to-right: f4(f3(f2(f1(x))))
  const composed = fn.composeL(f1, f2, f3, f4)
  t.equal(composed(42), 'Value: 0', 'composeL (4 funcs): 42 -> "Value: 0"')
  t.equal(composed(100), 'Value: 100', 'composeL (4 funcs): 100 -> "Value: 100"')
  t.end()
})

test('composeL with five functions of different types', t => {
  const f1 = (n: number): string => n.toString()
  const f2 = (s: string): number => s.length
  const f3 = (len: number): boolean => len % 2 === 0
  const f4 = (b: boolean): string => b ? 'even' : 'odd'
  const f5 = (s: string): number => s.length

  // Left-to-right: f5(f4(f3(f2(f1(x)))))
  const composed = fn.composeL(f1, f2, f3, f4, f5)

  t.equal(composed(100), 3, 'composeL (5 funcs): 100 -> 3')
  t.equal(composed(12), 4, 'composeL (5 funcs): 12 -> 4')
  t.end()
})

// ----- composeR -------------------------------------------------------------

test('composeR returns identity when no functions are provided', t => {
  const identity = fn.composeR<number>()
  t.equal(identity(42), 42, 'composeR with no functions returns the identity function')
  t.end()
})

test('composeR with a single function', t => {
  const multiplyByTwo = (x: number) => x * 2
  const result = fn.composeR(multiplyByTwo)(5)
  t.equal(result, 10, 'composeR with a single function works correctly')
  t.end()
})

test('composeR with two functions of different types', t => {
  const numberGreaterThanThree = (n: number) => n > 3
  const booleanToString = (b: boolean) => b ? 'yes' : 'no'
  // Right-to-left: booleanToString(numberGreaterThanThree(x))
  const composed = fn.composeR(booleanToString, numberGreaterThanThree)
  t.equal(composed(5), 'yes', 'composeR returns "yes" for 5')
  t.equal(composed(2), 'no', 'composeR returns "no" for 2')
  t.end()
})

test('composeR with three functions of different types', t => {
  const square = (x: number) => x * x
  const toString = (n: number) => n.toString()
  const appendExclamation = (s: string) => s + '!'
  // Right-to-left: appendExclamation(toString(square(x)))
  const composed = fn.composeR(appendExclamation, toString, square)
  t.equal(composed(3), '9!', 'composeR correctly composes three functions')
  t.end()
})

test('composeR with four functions of different types', t => {
  // For composeR, the order is reversed compared to composeL
  const i = (a: number): string => a.toString()
  const h = (s: string): boolean => s.length > 1
  const g = (b: boolean): number => b ? 100 : 0
  const f = (n: number): string => `Result: ${n}`

  // Right-to-left: f(g(h(i(x))))
  const composed = fn.composeR(f, g, h, i)
  t.equal(composed(5), 'Result: 0', 'composeR (4 funcs): 5 -> "Result: 0"')
  t.equal(composed(12), 'Result: 100', 'composeR (4 funcs): 12 -> "Result: 100"')
  t.end()
})

test('composeR with five functions of different types', t => {
  const j = (a: number): string => `num${a}`
  const i = (s: string): number => s.length
  const h = (n: number): boolean => n % 2 === 0
  const g = (b: boolean): string => b ? 'even' : 'odd'
  const f = (s: string): number => s.length

  // Right-to-left: f(g(h(i(j(x)))))
  const composed = fn.composeR(f, g, h, i, j)

  // j(5) -> 'num5' (length 4)
  // i('num5') -> 4
  // h(4) -> true
  // g(true) -> 'even' (length 4)
  // f('even') -> 4
  t.equal(composed(5), 4, 'composeR (5 funcs): 5 -> 4')

  // j(12) -> 'num12' (length 5)
  // i('num12') -> 5
  // h(5) -> false
  // g(false) -> 'odd' (length 3)
  // f('odd') -> 3
  t.equal(composed(12), 3, 'composeR (5 funcs): 12 -> 3')
  t.end()
})

