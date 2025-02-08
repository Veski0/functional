// ----- Base -----------------------------------------------------------------

// A function that indicates.
export type Predicate<T> = (candidate: T) => boolean

// A function that converts a value of one type to a value of another type,
// (or a value of one type to a value of that same type).
export type Transform<T, U> = (arg: T) => U

// Type-checking predicates.
export const isString: Predicate<unknown> = a => typeof a === 'string'
export const isNumber: Predicate<unknown> = a => typeof a === 'number'
export const isBoolean: Predicate<unknown> = a => typeof a === 'boolean'
export const isObject: Predicate<unknown> = a => typeof a === 'object' && a !== null
export const isArray: Predicate<unknown> = a => Array.isArray(a)
export const isFunction: Predicate<unknown> = a => typeof a === 'function'
export const isUndefined: Predicate<unknown> = a => typeof a === 'undefined'
export const isNull: Predicate<unknown> = a => a === null

// At least one predicate must be true.
export const isAnyOf = <T>(
  ...predicates: Predicate<T>[]
): Predicate<T> => (candidate: T) => {
  if (predicates.length === 0) return false
  for (const predicate of predicates) {
    if (typeof predicate !== 'function') {
      throw new Error('functional: isAnyOf: All elements must be functions')
    }
    if (predicate(candidate)) return true
  }
  return false
}

// All predicates must be true.
export const isAllOf = <T>(
  ...predicates: Predicate<T>[]
): Predicate<T> => (candidate: T) => {
  if (predicates.length === 0) return true
  for (const predicate of predicates) {
    if (typeof predicate !== 'function') {
      throw new Error('functional: isAllOf: All elements must be functions')
    }
    if (!predicate(candidate)) return false
  }
  return true
}

// ----- Result ----------------------------------------------------------------

// Wraps a value, normally from a fallible procedure.
export type Ok<T> = {
  kind: 'ok'
  value: T
}

// Indicates an error, with a message explaining what went wrong.
export type Err = {
  kind: 'err'
  message: string
}

// A union of Ok<T> and Err.
export type Result<T> = Ok<T> | Err

// Creates an Ok object that contains a value.
export const Ok = <T>(value: T): Ok<T> => ({ kind: 'ok', value })

// Creates an Err object that contains a message.
export const Err = (message: string): Err => ({ kind: 'err', message })


// ----- Object Helpers -------------------------------------------------------

// Creates a new object that contains specified keys from an object.
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const object: any = {}
  for (const key of keys) {
    if (key in obj) {
      object[key] = obj[key]
    }
  }
  return object
}

// Creates a new object that does not contain specified keys from an object.
export const omit = <T extends object, K extends keyof T>(
  candidate: T,
  keys: Array<keyof T>
): Omit<T, K> => {
  const object = { ...candidate }
  for (const key of keys) {
    if (key in object) {
      delete object[key]
    }
  }
  return object
}

// Accepts a dot-separated string path, parses it into individual keys,
// recursively creates new copies of each level of the object until it reaches
// the final key where it sets a new value, then returns the new object.
export const set = (
  path: string,
  obj: any,
  value: any
) => {
  if (path === '') {
    throw new Error('functional: set: Path cannot be empty')
  }
  const keys = path.split('.')
  const recursor = (current: any, keys: string[], value: any): any => {
    if (keys.length === 0) return value
    const [firstKey, ...remainingKeys] = keys
    if (typeof current !== 'object' || current === null) {
      throw new Error('functional: set: Intermediate value is not an object or array')
    }
    const updated = Array.isArray(current)
      ? [...current]
      : { ...current }
    updated[firstKey] = recursor(current[firstKey], remainingKeys, value)
    return updated
  }

  return recursor(obj, keys, value)
}

// Creates a new object that contains the keys from a set of two objects.
export const merge = <T extends object, U extends object>(
  a: T,
  b: U
): T & U => {
  const result: any = { ...a }
  for (const key in b) {
    if (b.hasOwnProperty(key)) {
      if (typeof b[key] === 'object' && b[key] !== null && !Array.isArray(b[key])) {
        result[key] = merge(result[key] || {}, b[key])
      } else {
        result[key] = b[key]
      }
    }
  }
  return result
}


// ----- List Helpers ---------------------------------------------------------

// Creates a new array whose members are tuples from two source arrays.
export const zip = <T, U>(a: T[], b: U[]): Array<[T, U]> => {
  const length = Math.max(a.length, b.length)
  const c: Array<[T, U]> = new Array(length)
  for (let i = 0; i < length; i++) {
    c[i] = [a[i], b[i]]
  }
  return c
}

// Partitions an array into two new arrays based on a Predicate function.
export const partition = <T>(
  arr: readonly T[],
  predicate: Predicate<T>
): [T[], T[]] => {
  const truePart: T[] = []
  const falsePart: T[] = []
  for (const item of arr) {
    if (typeof predicate !== 'function') {
      throw new Error('functional: partition: Predicate must be a function')
    }
    if (predicate(item)) {
      truePart.push(item)
    } else {
      falsePart.push(item)
    }
  }
  return [truePart, falsePart]
}


// ----- Function Helpers -----------------------------------------------------

// Calls an array whose first member is a function and the rest are its args.
export const s = <F extends (...args: any[]) => any>(
  [f, ...a]: [F, ...Parameters<F>]
): ReturnType<F> => {
  if (typeof f !== 'function') {
    throw new Error('functional: s: First element must be a function')
  }
  return f(...a)
}

// Left-to-right composition.
export function composeL<T>(): (a: T) => T
export function composeL<A, B>(fn1: (a: A) => B): (a: A) => B
export function composeL<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C
export function composeL<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): (a: A) => D
export function composeL<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E
): (a: A) => E
export function composeL<A, B, C, D, E, F>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D,
  fn4: (d: D) => E,
  fn5: (e: E) => F
): (a: A) => F
export function composeL(...fns: Array<(arg: any) => any>) {
  return (initialValue: any) =>
    fns.reduce((acc, fn) => fn(acc), initialValue)
}

// Right-to-left composition.
export function composeR<T>(): (a: T) => T
export function composeR<A, B>(fn1: (a: A) => B): (a: A) => B
export function composeR<A, B, C>(
  fn1: (b: B) => C,
  fn2: (a: A) => B
): (a: A) => C
export function composeR<A, B, C, D>(
  fn1: (c: C) => D,
  fn2: (b: B) => C,
  fn3: (a: A) => B
): (a: A) => D
export function composeR<A, B, C, D, E>(
  fn1: (d: D) => E,
  fn2: (c: C) => D,
  fn3: (b: B) => C,
  fn4: (a: A) => B
): (a: A) => E
export function composeR<A, B, C, D, E, F>(
  fn1: (e: E) => F,
  fn2: (d: D) => E,
  fn3: (c: C) => D,
  fn4: (b: B) => C,
  fn5: (a: A) => B
): (a: A) => F
export function composeR(...fns: Array<(arg: any) => any>) {
  return (initialValue: any) =>
    fns.reduceRight((acc, fn) => fn(acc), initialValue)
}
