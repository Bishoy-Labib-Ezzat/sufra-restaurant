import { authHandlers } from './auth';
import { catalogHandlers } from './catalog';
import { orderHandlers } from './orders';
import { statsHandlers } from './stats';

export const handlers = [...authHandlers, ...catalogHandlers, ...orderHandlers, ...statsHandlers];
