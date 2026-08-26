import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.mjs';
import { AccessPerformanceAvailabilityService } from '../src/domain.mjs';

class MemoryStore { constructor() { this.database = { accessPerformanceAvailabilityReviews: [] }; } read() { return structuredClone(this.database); } write(data) { this.database = structuredClone(data); } }
const headers = { 'x-actor-id': 'owner-http-848', 'x-actor-role': 'evidence_owner', 'x-request-id': 'request-http-848' };
const body = { supplierId: 'SUP-848', evidenceReference: 'EVD-848', availabilityReference: 'AVL-848-ACCESS-01', availabilityScope: 'access_commitment_availability' };
const route = '/access-performance-availability-reviews';

describe('access-performance availability HTTP transport', () => {
  it('returns supplied request identifier and submitted availability review', async () => { const app = createApp(new AccessPerformanceAvailabilityService(new MemoryStore())); const response = await request(app).post(route).set(headers).send(body); expect(response.status).toBe(201); expect(response.headers['x-request-id']).toBe(headers['x-request-id']); expect(response.body.status).toBe('submitted'); });
  it('returns structured invalid-input and missing-actor errors', async () => { const app = createApp(new AccessPerformanceAvailabilityService(new MemoryStore())); const invalid = await request(app).post(route).set(headers).send({ ...body, availabilityScope: 'invalid' }); const missingActor = await request(app).post(route).set('x-request-id', 'request-missing-actor-848').send(body); expect(invalid.status).toBe(422); expect(invalid.body.error.code).toBe('invalid_input'); expect(missingActor.status).toBe(403); expect(missingActor.body.error.code).toBe('forbidden'); });
  it('returns structured not-found errors for unknown review and action', async () => { const app = createApp(new AccessPerformanceAvailabilityService(new MemoryStore())); const missing = await request(app).get(`${route}/missing-review-848`); const created = await request(app).post(route).set(headers).send(body); const unknown = await request(app).post(`${route}/${created.body.id}/unknownAction`).set({ 'x-actor-id': 'profile-http-848', 'x-actor-role': 'availability_profile_analyst', 'x-request-id': 'request-unknown-action-848' }).send({ note: 'unknown' }); expect(missing.status).toBe(404); expect(missing.body.error.code).toBe('not_found'); expect(unknown.status).toBe(404); expect(unknown.body.error.code).toBe('not_found'); });
});
