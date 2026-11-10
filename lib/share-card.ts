// Bisect level 3: ONLY the imports + consts + no-op exports.
// If this fails Workers Builds, the problem is in the imports from ./entry
// or ./pattern themselves (unlikely — they're already used elsewhere in main).

import { type WeekStats } from "./pattern";

export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

export type ShareOptions = {
  name: string;
  stats: WeekStats;
  redactName?: boolean;
};

export function canShareImages(): boolean {
  return false;
}

export async function sundayCardBlob(_opts: ShareOptions): Promise<Blob | null> {
  return null;
}

export async function shareSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}

export async function downloadSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}
