import type { BagCategory } from "./db.ts";

export const PRESETS: { category: BagCategory; name: string }[] = [
  { category: "mom", name: "身份证" },
  { category: "mom", name: "医保卡/社保卡" },
  { category: "mom", name: "产检本/病历" },
  { category: "mom", name: "充电器/充电宝" },
  { category: "mom", name: "睡衣/拖鞋" },
  { category: "mom", name: "一次性内裤" },
  { category: "mom", name: "产褥垫" },
  { category: "mom", name: "卫生巾" },
  { category: "mom", name: "洗漱用品" },
  { category: "mom", name: "吸管杯" },
  { category: "baby", name: "包被" },
  { category: "baby", name: "和尚服/连体衣" },
  { category: "baby", name: "纸尿裤" },
  { category: "baby", name: "湿巾/棉柔巾" },
  { category: "baby", name: "奶瓶/奶粉" },
  { category: "baby", name: "小帽子/袜子" },
  { category: "doc", name: "夫妻身份证" },
  { category: "doc", name: "户口本" },
  { category: "doc", name: "结婚证" },
  { category: "doc", name: "准生证" },
  { category: "doc", name: "医保卡" },
  { category: "doc", name: "产检资料" },
];

export const CATEGORY_LABELS: Record<BagCategory, string> = {
  mom: "妈妈包",
  baby: "宝宝包",
  doc: "证件包",
};
