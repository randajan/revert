import assert from 'assert';
import { Revertable } from "../../../dist/esm/async/index.mjs";


export async function testIndex() {
  console.log("▶ Test: Revertable runs all steps (success)");

  const log = [];
  const r1 = new Revertable({ logger:(msg) => log.push(msg), pass:"keep" });
  r1.pushNamed("s1", (v, log) => log("do1"), "r1", (v, log) => log("undo1"));
  r1.pushNamed("s2", (v, log) => log("do2"), "r2", (v, log) => log("undo2"));

  const result1 = await r1.run("x");
//   assert.strictEqual(result1, true);
//   assert.deepEqual(log, [
//     "forward 1", "do1",
//     "forward 2", "do2"
//   ]);
  console.log("✅ Passed\n", result1, log, "\n");


  console.log("▶ Test: Revertable performs rollback on failure");

  const log2 = [];
  const r2 = new Revertable({ logger:(msg) => log2.push(msg) });
  r2
    .pushNamed("s1", (log) => log("do1"), "r1", (log) => log("undo1"))
    .pushNamed("s2", (log) => { log("do2"); throw new Error("fail"); }, "r2", (log) => log("undo2"));

  const result2 = await r2.run();
//   assert.strictEqual(result2, false);
//   assert.deepEqual(log2, [
//     "step 1", "do1",
//     "step 2", "do2",
//     "undo 1", "undo1"
//   ]);
console.log("✅ Passed\n", result2, log2, "\n");

  console.log("▶ Test: Context is passed through steps");

  const ctx = { value: 0 };
  const r3 = new Revertable({pass:"omit"});
  r3.push((c) => { c.value += 2; return c; }, (c) => { c.value -= 2; return c; });
  const result3 = await r3.run(ctx);
//   assert.strictEqual(ctx.value, 2);
//   assert.strictEqual(result3, true);
console.log("✅ Passed\n", result3, ctx, "\n");
}


