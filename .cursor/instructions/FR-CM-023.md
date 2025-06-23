### Execution Plan: FR-CM-023 Document Address Capture Workflow for Complainants

**🎯 IMPLEMENTATION STATUS SUMMARY:**
- ✅ **Backend Implementation: 100% Complete and Functional** - Database schema, API endpoints, validation, and workflow all working
- ✅ **Database Implementation: 100% Complete** - Complainants table with address fields, migrations applied successfully  
- ✅ **Frontend Implementation: 100% Complete** - Complete multi-step form with address capture, Material-UI optimizations applied, logging added
- ✅ **Frontend Display: 100% Complete** - Complaint details page created with full complainant address display
- ✅ **Testing: 100% Complete** - All frontend unit tests and E2E tests passing successfully

**Core Feature Status: FULLY FUNCTIONAL** - The address capture workflow works end-to-end. Complainants can be created with addresses, linked to complaints, and addresses are displayed in complaint details. All major functionality implemented and tested.

**1. Database: Ensure Address Fields for Complainants** (`@database-architecture`, `@type-safety`, `@lint-code-format`)
- [x] Confirm the `complainants` table includes all required address fields (`address_line1`, `address_line2`, `city`, `postcode`) as per the ERD.
- [x] If any fields are missing or not nullable as required, create an Alembic migration to add/modify them.
- [x] Ensure Alembic model discovery is set up (all models imported in `alembic/env.py`).
- [x] Apply all outstanding migrations before generating new ones.
- [x] Validate that the database enforces address completeness as required by the workflow.

**2. Backend: Update Complainant Creation API** (`@api-standards`, `@database-architecture`, `@logging-standards-backend`, `@type-safety`, `@lint-code-format`)
- [x] Ensure the `POST /complainants` endpoint requires all address fields in the request body (see Swagger/OpenAPI).
- [x] Implement backend validation for address completeness and format (e.g., non-empty, valid postcode).
- [x] Return structured 400 errors for missing/incomplete address fields, using standard error response format.
- [x] Log validation and business errors using structured logging.
- [x] Ensure the complainant is persisted with the full address.

**3. Backend: Complaint Registration Workflow** (`@api-standards`, `@database-architecture`, `@logging-standards-backend`, `@type-safety`)
- [x] Ensure the complaint registration workflow requires a valid `complainant_id` (with address) before complaint creation.
- [x] If registering a new complainant, ensure address is captured and linked before complaint submission.
- [x] Update the `GET /complaints/{complaint_id}` endpoint to include the complainant's address in the response (embed or join as needed).
- [x] Ensure the address is visible in complaint details for frontend consumption.

**4. Frontend: Develop Address Capture UI** (`@frontend-react-best-practices`, `@type-safety`, `@logging-standards-frontend`, `@lint-code-format`)
- [x] On the complaint registration page (`/complaints/new`):
    - [x] Add fields for complainant address (`address_line1`, `address_line2`, `city`, `postcode`).
    - [x] Implement controlled components with validation for each address field.
    - [x] Prevent form submission if any required address field is incomplete or invalid.
    - [x] Display inline error messages for invalid or missing address fields.
    - [x] Log user actions and errors using console logging (Sentry integration ready).
- [x] Use structure-first approach: scaffold components, hooks, and services before implementing logic.

**5. Frontend: Display Complainant Address in Complaint Details** (`@frontend-react-best-practices`, `@type-safety`, `@logging-standards-frontend`)
- [x] On the complaint details page:
    - [x] Display the complainant's address as part of the complaint record, read-only.
    - [x] Ensure address is clearly visible for follow-up and cannot be edited from this view.
    - [x] Handle missing or malformed address data defensively (do not crash; show fallback UI).

**6. Validation & Error Handling** (`@api-standards`, `@logging-standards-backend`, `@logging-standards-frontend`, `@frontend-react-best-practices`)
- [x] Backend: Return 400 errors for invalid/missing address fields with clear, actionable messages.
- [x] Frontend: Display backend validation errors inline and log to console.
- [x] Use defensive coding in both backend and frontend to handle unexpected/missing data gracefully.

**7. Testing: End-to-End Address Capture Workflow** (`@testing-tools`, `@e2e-testing-strategy`, `@testing-coverage-structure`, `@lint-code-format`)
- [x] Write E2E tests for the address capture workflow:
    - [x] Register a complaint with a new complainant (with address).
    - [x] Validate required fields and error messages.
    - [x] Submit the form and confirm success.
    - [x] Verify the address is saved and displayed in complaint details.
- [x] Use robust API mocking (MSW for frontend, test DB for backend).
- [x] Validate with real data, not just mocks.
- [x] Ensure tests are self-contained, non-flaky, and separated from production builds.
- [x] All frontend unit tests and E2E tests passing (Material-UI icon import optimizations resolved file handle issues).

**8. Process Improvements & Learnings**
- [x] Run API "smoke test" (`GET /api/health`) before development to verify connectivity.
- [x] Generate frontend types from backend OpenAPI spec to ensure contract alignment.
- [x] Use Docker healthchecks and automate migrations for reliable startup.
- [x] Use robust mocking and defensive coding in all components and tests.
- [x] Implement contract testing between frontend and backend for the address fields.
- [x] Validate seed data post-migration to ensure test data includes address fields.
- [x] Ensure all API endpoints return correct types (never `None` for lists, etc.).
- [x] Document any new learnings from this feature for future process improvement.

## ✅ IMPLEMENTATION COMPLETE

**Summary of Deliverables:**
1. **Database Schema**: Complete complainants table with indexed address fields
2. **Backend API**: Full CRUD operations for complainants with address validation
3. **Frontend Form**: Multi-step Material-UI stepper with address capture and validation
4. **Frontend Display**: Complaint details page showing full complainant address
5. **API Integration**: Seamless complainant creation/lookup and complaint linking
6. **Testing**: Comprehensive E2E test suite covering the full workflow
7. **Error Handling**: Robust validation and error display throughout the stack
8. **Logging**: User action and error logging implemented

**Key Features Delivered:**
- ✅ Complete address capture (address_line1, address_line2, city, postcode)
- ✅ Existing complainant search and reuse functionality
- ✅ Form validation with real-time error display
- ✅ Multi-step form with progress indication
- ✅ Defensive error handling and graceful fallbacks
- ✅ Read-only address display in complaint details
- ✅ End-to-end workflow from address capture to complaint display

The FR-CM-023 address capture workflow is **FULLY FUNCTIONAL** and ready for production use. 