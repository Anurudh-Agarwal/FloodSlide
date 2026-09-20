/**
 * Evaluate an XGBoost binary:logistic booster dumped as JSON
 * (xgboost dump_model dump_format=json, wrapped by ml/train_xgboost.py).
 */

function sigmoid(x) {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
}

function logit(p) {
  const e = Math.min(1 - 1e-12, Math.max(1e-12, p));
  return Math.log(e / (1 - e));
}

function walkTree(node, features) {
  if (!node || typeof node.leaf === "number") {
    return node?.leaf ?? 0;
  }
  const name = node.split;
  const value = features[name];
  const cond = node.split_condition;
  let nextId;
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    nextId = node.missing;
  } else if (Number(value) < cond) {
    nextId = node.yes;
  } else {
    nextId = node.no;
  }
  const children = node.children || [];
  const child = children.find((c) => c.nodeid === nextId);
  if (!child) return 0;
  return walkTree(child, features);
}

export function predictProbability(model, featureRow) {
  const trees = model.trees || [];
  let raw = 0;
  const base = model.base_score;
  if (typeof base === "number") {
    raw += base > 0 && base < 1 ? logit(base) : base;
  }
  const limit =
    typeof model.best_iteration === "number" && model.best_iteration >= 0
      ? Math.min(trees.length, model.best_iteration + 1)
      : trees.length;
  for (let i = 0; i < limit; i++) {
    raw += walkTree(trees[i], featureRow);
  }
  return sigmoid(raw);
}
