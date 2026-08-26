# Availability Service Architecture

The service separates transport, domain policy, and persistence. Express supplies request correlation and structured error serialization. The domain service owns availability scope validation, role gates, idempotency, and state transitions. The store writes a complete replacement document to a temporary file before atomic rename, so a valid commit cannot expose a partially written JSON document.

| State | Required role | Next state |
| --- | --- | --- |
| submitted | availability_profile_analyst | availability_profiled |
| availability_profiled | availability_capacity_verifier | capacity_verified |
| capacity_verified | availability_commitment_validator | commitment_validated |
| commitment_validated | availability_authority | availability_authorized |
| availability_authorized | availability_registrar | availability_released |

The service never mutates a review before scope, actor, request identifier, and current state checks pass.
