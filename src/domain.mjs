import { conflict, forbidden, missing } from './errors.mjs';
import { availabilityScope, text } from './validation.mjs';

const transitions = {
  profileAvailability: { from: 'submitted', to: 'availability_profiled', role: 'availability_profile_analyst', event: 'availability_profiled' },
  verifyCapacity: { from: 'availability_profiled', to: 'capacity_verified', role: 'availability_capacity_verifier', event: 'availability_capacity_verified' },
  validateCommitment: { from: 'capacity_verified', to: 'commitment_validated', role: 'availability_commitment_validator', event: 'availability_commitment_validated' },
  authorizeAvailability: { from: 'commitment_validated', to: 'availability_authorized', role: 'availability_authority', event: 'availability_authorized' },
  releaseAvailability: { from: 'availability_authorized', to: 'availability_released', role: 'availability_registrar', event: 'availability_released' }
};
const timestamp = () => new Date().toISOString();
const requireRole = (actor, role) => { if (!actor?.id || actor.role !== role) throw forbidden(`role ${role} is required`); };
const requestSeen = (record, requestId) => record.events.some((event) => event.requestId === requestId);

export class AccessPerformanceAvailabilityService {
  constructor(store) { this.store = store; }
  submit(input, actor, requestId) {
    requireRole(actor, 'evidence_owner'); const database = this.store.read(); if (database.accessPerformanceAvailabilityReviews.some((record) => requestSeen(record, requestId))) throw conflict('request identifier was already used');
    const now = timestamp(); const record = { id: crypto.randomUUID(), supplierId: text(input.supplierId, 'supplier id'), evidenceReference: text(input.evidenceReference, 'evidence reference'), availabilityReference: text(input.availabilityReference, 'availability reference'), availabilityScope: availabilityScope(input.availabilityScope), status: 'submitted', createdAt: now, updatedAt: now, events: [{ type: 'access_performance_availability_submitted', actorId: actor.id, requestId, at: now }] };
    database.accessPerformanceAvailabilityReviews.push(record); this.store.write(database); return record;
  }
  transition(id, action, input, actor, requestId) {
    const policy = transitions[action]; if (!policy) throw missing('action was not found'); requireRole(actor, policy.role); const database = this.store.read(); const record = database.accessPerformanceAvailabilityReviews.find((entry) => entry.id === id);
    if (!record) throw missing('access-performance availability review was not found'); if (requestSeen(record, requestId)) throw conflict('request identifier was already used'); if (record.status !== policy.from) throw conflict(`access-performance availability review must be ${policy.from}`);
    const note = text(input.note, 'note'); const now = timestamp(); record.status = policy.to; record.updatedAt = now; record.events.push({ type: policy.event, actorId: actor.id, requestId, note, at: now }); database.accessPerformanceAvailabilityReviews = database.accessPerformanceAvailabilityReviews.map((entry) => entry.id === id ? record : entry); this.store.write(database); return record;
  }
  get(id) { const record = this.store.read().accessPerformanceAvailabilityReviews.find((entry) => entry.id === id); if (!record) throw missing('access-performance availability review was not found'); return record; }
}
