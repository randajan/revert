# @randajan/revert

[![NPM](https://img.shields.io/npm/v/@randajan/revert.svg)](https://www.npmjs.com/package/@randajan/revert) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

_Reversible, reliable, readable._  
A tiny utility for managing forward-backward processes with automatic rollback on error.

Supports both **synchronous** and **asynchronous** workflows with optional **value passing** between steps.

---

## 📦 Installation

```bash
npm install @randajan/revert
```

or 

```bash
yarn install @randajan/revert
```

---

## 🧭 Package Variants

| Package Path                          | Type         | Description                            |
|--------------------------------------|--------------|----------------------------------------|
| `@randajan/revert/async`         | ESM / CJS    | Asynchronous version with logging, flow, utils |
| `@randajan/revert/async/utils`   | ESM / CJS    | Utility functions: `revertable`, `sleep`, `attempt` |
| `@randajan/revert/sync`          | ESM / CJS    | Synchronous version of the core logic  |
| `@randajan/revert/sync/utils`    | ESM / CJS    | Sync utilities: `revertable` only (no `sleep`, `attempt`) |

---

## 🚀 Quick Example

```js
import { Revertable } from "@randajan/revert/async";

const task = new Revertable({ logger:(msg) => log2.push(msg) })
  .pushNamed("s1", (log) => log("do1"), "r1", (log) =>{ log("undo1"); throw new Error("rollback")})
  .pushNamed("s2", (log) => log("do2"))
  .pushNamed("s3", (log) => log("do3"), "r3", (log) => log("undo3"))
  .pushNamed("s4", (log) => { log("do4"); throw new Error("main"); }, "r4", (log) => log("undo4"));

const result = await task.run();
console.log(result);
```

### 📈 Log Output Example

```text
↓ 1/4 [info] s1
↓ 1/4 [info] do1
↓ 2/4 [info] s2
↓ 2/4 [info] do2
↓ 3/4 [info] s3
↓ 3/4 [info] do3
↓ 4/4 [info] s4
↓ 4/4 [info] do4
─ 4/4 [error] main
↑ 3/4 [info] r3
↑ 3/4 [info] undo3
↑ 1/4 [info] r1
↑ 1/4 [info] undo1
⤫ 1/4 [error] rolback
```

---

## 📘 Class: Revertable

A class-based interface built over the core `revertable` function.

### Constructor

```ts
new Revertable(options?: {
  pass?: "omit" | "keep" | "reduce",
  logger?: (text: string, kind: string, dir: boolean, step: number, count: number) => void,
  logFormat?: (data: any, kind: string, dir: boolean, step: number, count: number) => string
})
```

### Modes (`pass`)

| Mode      | Description |
|-----------|-------------|
| `"omit"`  | No value is passed between steps (default) |
| `"keep"`  | A static value is passed to each step but not modified |
| `"reduce"`| Each step receives and returns a value (like a reducer) |

---

### Method: push

```ts
push(
  fwd: (...args) => any | Promise<any>,
  rwd: (...args) => any | Promise<any>
): this
```

Adds a step to the process. Both forward and rollback handlers are required.

### Method: run

```ts
async run(initialValue?: any): Promise<{
  status: "pass" | "undo" | "fail",
  pass?: any,
  undo?: Error,
  undoStep?: number,
  fail?: Error,
  failStep?: number
}>
```

Runs the sequence and handles rollback automatically.

---

## 🧰 Utility Functions (in `utils`)

```js
import { revertable, sleep, attempt } from "@randajan/revert/async/utils";
```

### revertable

Core engine function.

```ts
async revertable(
  value: any,
  stepCount: number,
  fn: (value, dir, stepIndex, totalSteps) => any,
  onError?: (err, dir, stepIndex, totalSteps) => void
): Promise<{
  status: "pass" | "undo" | "fail",
  pass?: any,
  undo?: Error,
  undoStep?: number,
  fail?: Error,
  failStep?: number
}>
```

Handles the entire flow + rollback mechanism. Minimal, flexible and fully decoupled from logging.

---

### sleep

```ts
async sleep(ms: number): Promise<void>
```

Simple delay utility using Promise + `setTimeout`.

_without sync alternative_

---

### attempt

```ts
async attempt(
  fn: (attempt: number) => any,
  attempts: number = 3,
  delay: number = 2000
): Promise<any>
```

Attempts the function multiple times until it succeeds, with delay between retries.
_sync attempts are without delay_

---

## 🧪 Synchronous Variant

Available under:

- `@randajan/revert/sync`
- `@randajan/revert/sync/utils`

Same API, but no `sleep` and limited `attempt` (as they’re async-only).  
Use `revertable()` directly for immediate rollback logic.

---

## Support

If you have any questions or suggestions for improvements, feel free to open an issue in the repository.


## 📄 License

MIT © [randajan](https://github.com/randajan)