export type LoaderControls = {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
};

export async function fetchWithLoader<T>(
  loader: LoaderControls,
  task: () => Promise<T>,
  message?: string
): Promise<T> {
  loader.startLoading(message);
  try {
    return await task();
  } finally {
    loader.stopLoading();
  }
}
