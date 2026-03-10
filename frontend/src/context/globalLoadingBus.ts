type GlobalLoadingSnapshot = {
  networkCount: number;
};

type GlobalLoadingListener = (snapshot: GlobalLoadingSnapshot) => void;

let networkCount = 0;
const listeners = new Set<GlobalLoadingListener>();

function emitSnapshot() {
  const snapshot = { networkCount };
  listeners.forEach((listener) => listener(snapshot));
}

export function beginGlobalNetworkLoading() {
  networkCount += 1;
  emitSnapshot();
}

export function endGlobalNetworkLoading() {
  networkCount = Math.max(0, networkCount - 1);
  emitSnapshot();
}

export function subscribeGlobalLoading(listener: GlobalLoadingListener): () => void {
  listeners.add(listener);
  listener({ networkCount });
  return () => listeners.delete(listener);
}

export function getGlobalLoadingSnapshot(): GlobalLoadingSnapshot {
  return { networkCount };
}
