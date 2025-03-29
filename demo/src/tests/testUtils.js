import { revertable, sleep, attempt } from "../../../dist/esm/async/utils.mjs";


import assert from "assert";


export async function testUtils() {
  console.log("▶ Test: sleep");
  const start = Date.now();
  await sleep(100);
  assert.ok(Date.now() - start >= 90);
  console.log("✅ sleep passed\n");

  console.log("▶ Test: attempt (succeeds on 3rd try)");
  let attempts = 0;
  const result = await attempt(() => {
    if (++attempts < 3) throw new Error("fail");
    return "ok";
  }, 5, 10);
  assert.strictEqual(result, "ok");
  assert.strictEqual(attempts, 3);
  console.log("✅ attempt passed\n");

  console.log("▶ Test: revertable (with rollback)");
  const log = [];
  const { pass, status } = await revertable(null, 3, async (val, dir, s) => {
    log.push(`${dir ? 'fwd' : 'rwd'}:${s}`);
    if (dir && s === 2) throw new Error("fail");
    return val;
  }, (err, fatal, s) => log.push(`err:${s}`));
  assert.strictEqual(pass, null);
  assert.strictEqual(status, "undo");
  assert.deepEqual(log, ['fwd:1', 'fwd:2', 'err:2', 'rwd:1']);
  console.log("✅ revertable passed\n");
}