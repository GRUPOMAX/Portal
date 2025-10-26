// src/modules/redes-wifi/hooks.ts
import { listRecords, readRecord, createRecord, updateRecord, deleteRecord } from "@/modules/config/lib/noco";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WifiRow } from "./types";
import { toArray, TABLE_ID, DEFAULT_VIEW } from "./lib";

type ListParams = { viewId?: string; limit?: number; where?: string };

export function useWifiList(params?: ListParams) {
  const [data, setData] = useState<WifiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const depKey = useMemo(() => JSON.stringify({
    viewId: params?.viewId ?? DEFAULT_VIEW,
    limit: params?.limit ?? 100,
    where: params?.where ?? undefined,
  }), [params?.viewId, params?.limit, params?.where]);

  const reqIdRef = useRef(0);

  const load = useCallback(async () => {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const all: WifiRow[] = [];
      const pageSize = Math.max(1, Math.min(10000, params?.limit ?? 100)); // 1..10000
      let offset = 0;

      for (;;) {
        const res = await listRecords(TABLE_ID, {
          viewId: params?.viewId ?? DEFAULT_VIEW,
          limit: pageSize,
          offset,
          where: params?.where,
          sort: "Id",
        });

        if (reqIdRef.current !== myReqId) return; // cancelado

        const batch = toArray<WifiRow>(res);
        all.push(...batch);

        if (batch.length < pageSize) break;
        offset += pageSize;
      }

      setData(all);
    } catch (e) {
      if (reqIdRef.current !== myReqId) return; // cancelado
      setError(e);
    } finally {
      if (reqIdRef.current === myReqId) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  useEffect(() => {
    load();
    return () => { reqIdRef.current++; };
  }, [load]);

  // compatibilidade: tanto refresh quanto reload chamam o mesmo loader
  const refresh = load;
  const reload = load;

  return { data, loading, error, refresh, reload };
}

export async function wifiRead(id: string) {
  return readRecord<WifiRow>(TABLE_ID, id);
}
export async function wifiCreate(payload: WifiRow) {
  return createRecord<WifiRow>(TABLE_ID, payload);
}
export async function wifiUpdate(id: string, payload: WifiRow) {
  const body: WifiRow = { ...payload };
  if (!body.Id && !body.id) {
    const numeric = Number(id);
    if (Number.isFinite(numeric)) (body as any).Id = numeric;
    else (body as any).id = id as any;
  }
  return updateRecord(TABLE_ID, body as any);
}
export async function wifiDelete(id: string | number) {
  return deleteRecord(TABLE_ID, { Id: id } as any);
}
