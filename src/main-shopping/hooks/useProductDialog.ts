import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

const PARAM = 'item';

/** The open product lives in `?item=<id>`, which makes every dish linkable from anywhere. */
export function useProductDialog() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const openId = params.get(PARAM);

  const open = useCallback(
    (productId: string) => {
      if (location.pathname !== '/menu') {
        navigate(`/menu?${PARAM}=${productId}`);
        return;
      }
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(PARAM, productId);
          return next;
        },
        { preventScrollReset: true },
      );
    },
    [location.pathname, navigate, setParams],
  );

  const close = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(PARAM);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setParams]);

  return { openId, open, close };
}
