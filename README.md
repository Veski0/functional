# Functional Helpers 🛠️

A collection of functional programming utilities for TypeScript. I find myself
re-implementing these functions all over the place. Here they are, properly
formatted and tested.

## Features

- **Object Helpers**: `pick`, `omit`, `set`, `merge`
- **List Helpers**: `zip`, `partition`, `s`
- **Result Types**: `Ok`, `Err`, `Result`
- **Function Helpers**: `composeL`, `composeR`
- **Type Predicates**:
  - `isString`
  - `isNumber`
  - `isBoolean`
  - `isObject`
  - `isArray`
  - `isFunction`
  - `isUndefined`
  - `isNull`
  - `isAsyncFn`
- **Predicate Combinators**
  - `isAnyOf`
  - `isAllOf`

## Installation

Just clone the repo and copy the `src/index.ts` file into your `lib` directory
(or similar, based on your codebase's requirements).

```bash
  cd project/src/lib
  git clone https://github.com/Veski0/functional.git
  cp functional/src/index.ts .
  rm -rf functional
```

To run the tests you'll need to install the `tape` library.

```bash
  cd project
  npm i --save-dev tape @types/tape
```

