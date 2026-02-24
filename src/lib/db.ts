import Dexie, { type Table } from "dexie";

export interface KickRecord {
  id?: number;
  timestamp: number;
  sessionId: string;
}

export class BabyCareDB extends Dexie {
  kicks!: Table<KickRecord, number>;

  constructor() {
    super("BabyCareDB");
    this.version(1).stores({
      kicks: "++id, timestamp, sessionId",
    });
  }
}

export const db = new BabyCareDB();
