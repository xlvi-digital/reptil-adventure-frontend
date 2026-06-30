import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeOrderStatus,
  getOrderStatusMeta,
  getOrderCompletionState,
} from "./orderStatus.js";

test("normalizeOrderStatus maps common aliases to canonical statuses", () => {
  assert.equal(normalizeOrderStatus("selesai"), "DONE");
  assert.equal(normalizeOrderStatus("payment_confirmed"), "PAID");
  assert.equal(normalizeOrderStatus("batal"), "CANCELLED");
});

test("getOrderStatusMeta returns informative metadata for paid orders", () => {
  const meta = getOrderStatusMeta("PAID");
  assert.equal(meta.label, "Pembayaran Diterima");
  assert.equal(meta.step, 1);
  assert.match(meta.description, /diproses/i);
});

test("getOrderCompletionState marks cancelled orders as zero progress", () => {
  const state = getOrderCompletionState({ status: "cancelled" });
  assert.equal(state.status, "CANCELLED");
  assert.equal(state.progress, 0);
});
