import { http, HttpResponse } from 'msw';
import { endpoints } from '@/shared/api/endpoints';
import { restaurant } from '@/shared/config/restaurant';
import { firstName } from '@/shared/lib/format';
import { ALL_STATUSES, canTransition, formatOrderCode, STATUS_META } from '@/shared/lib/order-status';
import { normalizeEgyptianMobile } from '@/shared/lib/phone';
import { calculateTotals, MAX_QUANTITY_PER_ITEM } from '@/shared/lib/pricing';
import type {
  CreateOrderRequest,
  Order,
  OrderItem,
  OrderStatus,
  OrderTracking,
  Paginated,
  UpdateOrderStatusRequest,
} from '@/shared/types';
import { fill, t } from '@/shared/i18n';
import { db, type DbData } from '../db';
import { orderCode } from '../seed/orders';
import { api, fail, param, readJson, requireUser, route } from '../utils';

function toTracking(order: Order, data: Readonly<DbData>): OrderTracking {
  const zone = order.address ? data.zones.find((item) => item.id === order.address?.zoneId) : null;
  return {
    code: order.code,
    status: order.status,
    fulfillment: order.fulfillment,
    customerFirstName: firstName(order.customer.name),
    phoneLastDigits: order.customer.phone.slice(-4),
    zoneName: order.address?.zoneName ?? null,
    etaMinutes: zone?.etaMinutes ?? restaurant.pickupEtaMinutes,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    createdAt: order.createdAt,
    history: order.history.map(({ status, at }) => ({ status, at })),
  };
}

function validateOrder(body: Partial<CreateOrderRequest>, data: Readonly<DbData>) {
  const errors: Record<string, string> = {};
  const name = body.customer?.name?.trim() ?? '';
  const phone = normalizeEgyptianMobile(body.customer?.phone ?? '');
  if (name.length < 2) errors['customer.name'] = t.validation.nameRequired;
  if (!phone) errors['customer.phone'] = t.server.orderPhone;
  if (body.fulfillment !== 'delivery' && body.fulfillment !== 'pickup') errors.fulfillment = t.server.orderFulfillment;

  const zone = body.fulfillment === 'delivery' ? data.zones.find((item) => item.id === body.address?.zoneId) : null;
  if (body.fulfillment === 'delivery') {
    if (!zone) errors['address.zoneId'] = t.validation.zoneRequired;
    if ((body.address?.street?.trim() ?? '').length < 4) errors['address.street'] = t.server.orderStreet;
  }

  const lines = body.items ?? [];
  if (!lines.length) errors.items = t.server.orderEmpty;
  if (Object.keys(errors).length) throw fail(422, 'validation_error', t.server.orderCheck, errors);

  const unavailable: string[] = [];
  const items: OrderItem[] = lines.map(({ productId, quantity }) => {
    const product = data.products.find((item) => item.id === productId);
    if (!product || !product.isAvailable) {
      unavailable.push(product?.name ?? t.server.someItem);
      return null;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw fail(422, 'validation_error', fill(t.server.quantityRange, { max: MAX_QUANTITY_PER_ITEM }));
    }
    // Prices always come from the catalog, never from the client.
    return {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  }).filter((item): item is OrderItem => item !== null);

  if (unavailable.length) {
    throw fail(409, 'items_unavailable', fill(t.server.soldOutNow, { names: unavailable.join('، ') }));
  }

  return { name, phone: phone as string, zone, items };
}

function rangeFilter(order: Order, from: string | null, to: string | null) {
  const created = new Date(order.createdAt).getTime();
  if (from && created < new Date(from).getTime()) return false;
  if (to && created > new Date(to).getTime()) return false;
  return true;
}

export const orderHandlers = [
  http.post(
    api(endpoints.orders.list),
    route(async ({ request }) => {
      const body = await readJson<CreateOrderRequest>(request);
      const tracking = db.write((data) => {
        const { name, phone, zone, items } = validateOrder(body, data);
        const totals = calculateTotals(items, zone?.fee ?? 0);
        const now = new Date().toISOString();
        data.lastOrderNumber += 1;
        const order: Order = {
          id: crypto.randomUUID(),
          code: orderCode(data.lastOrderNumber),
          status: 'new',
          fulfillment: body.fulfillment!,
          customer: { name, phone },
          address: zone
            ? {
                zoneId: zone.id,
                zoneName: zone.name,
                street: body.address?.street?.trim() ?? '',
                details: body.address?.details?.trim() ?? '',
                landmark: body.address?.landmark?.trim() ?? '',
              }
            : null,
          notes: body.notes?.trim() ?? '',
          items,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          createdAt: now,
          updatedAt: now,
          history: [{ status: 'new', at: now, by: null }],
        };
        data.orders.push(order);
        return toTracking(order, data);
      });
      return HttpResponse.json(tracking, { status: 201 });
    }),
  ),

  http.get(
    api(endpoints.orders.track(':code')),
    route(({ params }) => {
      const code = param(params, 'code').toUpperCase();
      const tracking = db.read((data) => {
        const order = data.orders.find((item) => item.code === code);
        return order ? toTracking(order, data) : null;
      });
      return tracking
        ? HttpResponse.json(tracking)
        : fail(404, 'not_found', fill(t.server.orderNotFound, { code: formatOrderCode(code) }));
    }),
  ),

  http.get(
    api(endpoints.orders.list),
    route(({ request }) => {
      requireUser(request);
      const params = new URL(request.url).searchParams;
      const statuses = params.getAll('status').filter((item): item is OrderStatus => ALL_STATUSES.includes(item as OrderStatus));
      const search = params.get('search')?.trim().toLowerCase().replace(/\s+/g, '');
      const fulfillment = params.get('fulfillment');
      const page = Math.max(1, Number(params.get('page') ?? 1));
      const pageSize = Math.min(200, Math.max(1, Number(params.get('pageSize') ?? 20)));

      const result = db.read((data): Paginated<Order> => {
        const matches = data.orders
          .filter((order) => {
            if (statuses.length && !statuses.includes(order.status)) return false;
            if (fulfillment && order.fulfillment !== fulfillment) return false;
            if (!rangeFilter(order, params.get('from'), params.get('to'))) return false;
            if (search) {
              const haystack = `${order.code}${order.customer.name}${order.customer.phone}`.toLowerCase().replace(/\s+/g, '');
              if (!haystack.includes(search)) return false;
            }
            return true;
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return { items: matches.slice((page - 1) * pageSize, page * pageSize), total: matches.length, page, pageSize };
      });
      return HttpResponse.json(result);
    }),
  ),

  http.get(
    api(endpoints.orders.detail(':id')),
    route(({ request, params }) => {
      requireUser(request);
      const order = db.read((data) => data.orders.find((item) => item.id === param(params, 'id')));
      return order ? HttpResponse.json(order) : fail(404, 'not_found', t.server.orderMissing);
    }),
  ),

  http.patch(
    api(endpoints.orders.status(':id')),
    route(async ({ request, params }) => {
      const user = requireUser(request);
      const { status, note } = await readJson<UpdateOrderStatusRequest>(request);
      if (!status || !ALL_STATUSES.includes(status)) return fail(422, 'validation_error', t.server.invalidStatus);

      const order = db.write((data) => {
        const existing = data.orders.find((item) => item.id === param(params, 'id'));
        if (!existing) throw fail(404, 'not_found', t.server.orderMissing);
        if (!canTransition(existing.status, status)) {
          throw fail(
            409,
            'invalid_transition',
            fill(t.server.orderClosed, { code: formatOrderCode(existing.code), status: STATUS_META[existing.status].label }),
          );
        }
        const at = new Date().toISOString();
        existing.status = status;
        existing.updatedAt = at;
        existing.history.push({ status, at, by: user.name, ...(note?.trim() && { note: note.trim() }) });
        return existing;
      });
      return HttpResponse.json(order);
    }),
  ),
];
