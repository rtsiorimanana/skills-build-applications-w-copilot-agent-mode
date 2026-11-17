import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  endpoint,
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
    getJson<T>(endpoint)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load data.');
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p>Implementation pending</p>{!data && !error && <p role="status" aria-live="polite">Loading...</p>}{error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}{data && (isEmpty(data) ? <p>{emptyMessage}</p> : renderData(data))}</div></section>;
}
