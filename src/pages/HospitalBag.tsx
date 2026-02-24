import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.ts";
import type { HospitalBagItem as Item, BagCategory } from "../lib/db.ts";
import { PRESETS, CATEGORY_LABELS } from "../lib/hospital-bag-presets.ts";

const CATEGORIES: BagCategory[] = ["mom", "baby", "doc"];

export default function HospitalBag() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<BagCategory>("mom");

  const load = useCallback(async () => {
    const list = await db.hospitalBag.orderBy("sortOrder").toArray();
    setItems(list);
    if (list.length === 0) {
      const count = await db.hospitalBag.count();
      if (count === 0) {
        await db.hospitalBag.bulkAdd(
          PRESETS.map((p, i) => ({
            category: p.category,
            name: p.name,
            checked: false,
            sortOrder: i,
          })),
        );
        const next = await db.hospitalBag.orderBy("sortOrder").toArray();
        setItems(next);
      }
    }
  }, []);

  useEffect(() => {
    db.hospitalBag.count().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    load();
  }, [loading, load]);

  const toggle = async (item: Item) => {
    if (item.id == null) return;
    await db.hospitalBag.update(item.id, { checked: !item.checked });
    await load();
  };

  const addCustom = async () => {
    const name = newName.trim();
    if (!name) return;
    const maxOrder = items.length === 0 ? 0 : Math.max(...items.map((i) => i.sortOrder), 0);
    await db.hospitalBag.add({
      category: newCategory,
      name,
      checked: false,
      sortOrder: maxOrder + 1,
    });
    setNewName("");
    await load();
  };

  const deleteItem = async (id: number) => {
    await db.hospitalBag.delete(id);
    await load();
  };

  const byCategory = (c: BagCategory) => items.filter((i) => i.category === c);
  const progress = (c: BagCategory) => {
    const list = byCategory(c);
    if (list.length === 0) return 0;
    return Math.round((list.filter((i) => i.checked).length / list.length) * 100);
  };

  return (
    <div className="flex flex-col gap-6 p-6 pt-safe">
      <h1 className="text-xl font-semibold text-duo-green dark:text-duo-green-light">待产包清单</h1>
      <p className="text-sm text-duo-gray-dark">妈妈包 / 宝宝包 / 证件包，勾选已准备项。</p>

      {CATEGORIES.map((cat) => {
        const list = byCategory(cat);
        const pct = progress(cat);
        return (
          <section key={cat} className="rounded-xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
              <span className="text-sm text-duo-gray-dark">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-duo-gray dark:bg-white/20">
              <div
                className="h-full rounded-full bg-duo-green dark:bg-duo-green-light transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ul className="mt-2 space-y-1">
              {list.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggle(item)}
                    className="h-4 w-4 rounded border-duo-green text-duo-green"
                  />
                  <span className={item.checked ? "text-duo-gray-dark line-through" : ""}>
                    {item.name}
                  </span>
                  {item.id != null && (
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id!)}
                      className="ml-auto text-xs text-duo-red"
                    >
                      删除
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="rounded-xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <h2 className="mb-2 text-sm font-medium text-duo-gray-dark">添加一项</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="物品名称"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as BagCategory)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCustom}
            className="rounded-lg bg-duo-green px-4 py-2 text-white dark:bg-duo-green-dark"
          >
            添加
          </button>
        </div>
      </section>
    </div>
  );
}
