import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api.js';

function loadResource(key, params) {
  const userMethods = { dashboard: 'dashboard', borrowals: 'borrowals', fines: 'fines', paymentHistory: 'paymentsHistory', profile: 'profile' };
  if (key in userMethods) {
    if (!params.userId) throw new Error(`A signed-in user is required for ${key}`);
    return api[userMethods[key]](params.userId);
  }
  if (key === 'reservationSlots') return api.reservationSlots(params);
  const methods = ['reservations', 'items', 'staffDashboard', 'staffInventory', 'staffReservations', 'staffOverdue', 'students'];
  if (!methods.includes(key)) throw new Error(`Unknown resource key: ${key}`);
  return api[key]();
}

export function useApiData(resourceKey, options = {}) {
  const { initialData, transform, params } = options;
  const [data, setData] = useState(initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  // Value-stable parameters avoid refetch loops from inline option objects.
  const paramsKey = JSON.stringify(params ?? {});
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);
  const transformRef = useRef(transform);
  useEffect(() => { transformRef.current = transform; }, [transform]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.resolve().then(() => loadResource(resourceKey, stableParams)).then(result => {
      if (active) setData(typeof transformRef.current === 'function' ? transformRef.current(result) : result);
    }).catch(err => {
      if (active) setError(err instanceof Error ? err : new Error('Data load failed'));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [resourceKey, stableParams, revision]);
  const refetch = useCallback(() => setRevision(value => value + 1), []);
  return { data, loading, error, refetch };
}
