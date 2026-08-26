import { inputError } from './errors.mjs';

export const text = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) throw inputError(`${name} is required`);
  return value.trim();
};

export const availabilityScope = (value) => {
  value = text(value, 'availability scope');
  if (!['access_commitment_availability', 'evidence_entitlement_availability', 'exception_route_availability'].includes(value)) throw inputError('availability scope is invalid');
  return value;
};

export const actor = (headers) => ({ id: headers['x-actor-id'], role: headers['x-actor-role'] });
