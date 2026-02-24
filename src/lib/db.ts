import Dexie, { type Table } from "dexie";

export interface KickRecord {
  id?: number;
  timestamp: number;
  sessionId: string;
}

export interface ContractionRecord {
  id?: number;
  startTime: number;
  endTime: number; // 0 表示进行中
  sessionId: string;
}

export type BagCategory = "mom" | "baby" | "doc";

export interface HospitalBagItem {
  id?: number;
  category: BagCategory;
  name: string;
  checked: boolean;
  sortOrder: number;
}

export type FeedingType = "breast_left" | "breast_right" | "bottle" | "pump";

export interface FeedingRecord {
  id?: number;
  type: FeedingType;
  startTime: number;
  endTime: number; // 0 表示进行中；亲喂/吸奶用时长，奶瓶可为 0
  amountMl: number; // 奶瓶/吸奶的奶量（ml）
  note?: string;
}

export class BabyCareDB extends Dexie {
  kicks!: Table<KickRecord, number>;
  contractions!: Table<ContractionRecord, number>;
  hospitalBag!: Table<HospitalBagItem, number>;
  feeding!: Table<FeedingRecord, number>;

  constructor() {
    super("BabyCareDB");
    this.version(1).stores({
      kicks: "++id, timestamp, sessionId",
    });
    this.version(2).stores({
      kicks: "++id, timestamp, sessionId",
      contractions: "++id, startTime, sessionId",
      hospitalBag: "++id, category, sortOrder",
      feeding: "++id, startTime, type",
    });
  }
}

export const db = new BabyCareDB();
