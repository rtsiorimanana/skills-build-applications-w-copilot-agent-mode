import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadData: () => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  loadData,
  emptyMessage,
  isEmpty,
  renderData,
}: Props<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setData(undefined);
    setError(undefined);
    loadData()
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load data.');
      });
    return () => {
      active = false;
    };
  }, [loadData]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p>Implementation pending</p>{!data && !error && <p role="status" aria-live="polite">Loading...</p>}{error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}{data && (isEmpty(data) ? <p>{emptyMessage}</p> : renderData(data))}</div></section>;
}
