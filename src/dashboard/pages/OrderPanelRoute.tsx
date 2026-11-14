import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { t } from '@/shared/i18n';
import { Overlay } from '@/shared/ui/Overlay';
import { OrderPanel } from '../components/orders/OrderPanel';

/** `/dashboard/orders/:orderId` opens the order in a side panel over the orders view. */
export function OrderPanelRoute() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [open, setOpen] = useState(true);

  return (
    <Overlay
      open={open}
      onClose={() => setOpen(false)}
      onExited={() => navigate({ pathname: '/dashboard/orders', search }, { preventScrollReset: true })}
      label={t.dashboard.orders.details}
      placement="side"
      className="sm:max-w-xl"
    >
      <OrderPanel orderId={orderId} onClose={() => setOpen(false)} />
    </Overlay>
  );
}
