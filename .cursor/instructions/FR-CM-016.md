### Execution Plan: FR-CM-016 Patient and Case Association During Complaint Registration

**1. Database: Ensure Patient and Case Association in Complaints Table** (`@database-architecture`, `@type-safety`, `@lint-code-format`)
- [x] Confirm the `complaints` table includes `patient_id` and `case_id` as foreign keys (see ERD).
  - [x] Patients and cases tables created and migration generated. Learning updated for future migrations.
- [x] **Schema:**
    - [x] `patient_id` (UUID, Not Null, FK to `patients.patient_id`)
    - [x] `case_id` (UUID, Not Null, FK to `cases.case_id`)
    - [x] Migration generated and reviewed.
- [ ] If not present, create a migration to add these fields and constraints.

**2. Backend: Update Complaint Creation and Retrieval APIs** (`@type-safety`, `@database-architecture`, `@lint-code-format`)
- [x] Update the `POST /complaints` endpoint to require `patient_id` and `case_id` in the request body (see Swagger/OpenAPI).
- [x] **Validation Logic:**
    - [x] Validate that `patient_id` and `case_id` are valid UUIDs and exist in their respective tables. Return 400 if not.
    - [x] Ensure the complaint is persisted with the correct associations.
- [x] Update the `GET /complaints/{complaint_id}` endpoint to include patient and case details in the response (embed or join as needed).
- [x] Ensure the complaint details endpoint exposes the association clearly for frontend consumption.

**3. Backend: Patient and Case Lookup APIs** (`@type-safety`, `@database-architecture`, `@lint-code-format`)
- [x] Ensure there are endpoints to search/list patients and cases for selection during complaint registration (e.g., `GET /patients`, `GET /cases?patient_id=...`).
- [x] **Logic:**
    - [x] Support search/filter by name, reference, or other identifiers for usability.
    - [x] Return minimal, relevant fields for selection lists (e.g., patient name, DOB, case reference).

**4. Frontend: Develop Patient and Case Association UI** (`@frontend-react-best-practices`, `@type-safety`, `@logging-standards-frontend`, `@lint-code-format`)
- [x] On the complaint registration page (`/complaints/new`):
    - [x] Add a patient search/select field (autocomplete or modal lookup).
    - [x] Once a patient is selected, fetch and display a list of open cases for that patient for selection.
    - [x] Require both patient and case to be selected before enabling complaint submission.
    - [x] Display selected patient and case details in a summary panel for confirmation.
- [x] On the complaint details page:
    - [x] Display the associated patient and case information clearly and read-only.

**5. Frontend: Data Fetching and Validation** (`@frontend-react-best-practices`, `@type-safety`, `@logging-standards-frontend`, `@lint-code-format`)
- [x] On component mount, fetch patient and case data as needed for the registration form.
- [x] Validate that both patient and case are selected before allowing form submission.
- [x] On submission, include `patient_id` and `case_id` in the `POST /complaints` request body.
- [x] Handle and display backend validation errors (e.g., invalid or missing IDs).

**6. Testing: Write End-to-End Test for Patient and Case Association** (`@testing-tools`, `@lint-code-format`)
- [x] Create a new E2E test for the patient and case association workflow.
- [x] **Test Flow:**
    - [x] Navigate to `/complaints/new`.
    - [x] Search and select a patient.
    - [x] Select a case for the patient.
    - [x] Fill in other required complaint fields.
    - [x] Submit the form.
    - [x] Confirm a success message is displayed.
    - [x] (Recommended) Intercept the API call to verify the `POST /complaints` request payload contains the correct `patient_id` and `case_id`.
    - [x] View the complaint details page and confirm the patient and case association is visible and correct.

_Note: Workflow now follows best practices for type safety, validation, and user experience. All major backend and frontend steps are complete and tested._

**7. Alembic Migration Requires Correct DATABASE_URL When Run From Host**
- **Action:** When running Alembic migrations from your local machine (not inside Docker), set the `DATABASE_URL` environment variable to use `localhost` as the hostname (not the Docker Compose service name like `db`).
- **Prevents:** Connection errors such as `getaddrinfo failed` and ensures Alembic can connect to the database for autogeneration.
- **How-To:**
  1. Start the database container: `docker-compose up -d db`
  2. In PowerShell, set the environment variable:
     ```powershell
     $env:DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/test_spectrum_system"
     ```
  3. Run the migration:
     ```powershell
     poetry run alembic revision --autogenerate -m "your message here"
     ```
- **Status:** **Newly Documented.**

**Process Improvement:**
- Add a `.env.local` or similar file (excluded from version control) with `DATABASE_URL` set to use `localhost` for local development. Ensure your backend loads this file automatically when running locally.
- Alternatively, create a script or Makefile target (e.g., `make migrate-local`) that sets the correct `DATABASE_URL` and runs Alembic in one step. Example Makefile target:
  ```makefile
  migrate-local:
  	@export DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/test_spectrum_system && poetry run alembic upgrade head
  ```
- This ensures all developers and CI environments use the correct connection string for migrations, preventing repeated issues.

---

### Learnings & Process Improvements

To prevent similar issues in future features, the following "Pre-Flight Check" process should be adopted before starting development:

**1. Create an API "Smoke Test" to Verify Full Connectivity**
- **Action:** Before implementing feature endpoints, create a simple `GET /api/health` endpoint in the backend. The frontend should call this on startup.
- **Prevents:** Catches foundational networking issues early, such as NGINX proxy misconfigurations, Docker networking problems, and incorrect API path prefixes.
- **Status:** **Implemented.**

**2. Generate Frontend Types from the Backend OpenAPI Spec**
- **Action:** Use a tool like `openapi-typescript` to automatically generate TypeScript types for the frontend directly from the backend's `/openapi.json` specification.
- **Prevents:** Eliminates data contract bugs and manual inconsistencies between frontend and backend models (e.g., `UUID` vs. `int`).
- **Status:** **Implemented.**

**3. Implement and Rely on Docker Healthchecks**
- **Action:** Add `healthcheck` configurations to services in `docker-compose.yml`, particularly for managing dependencies like the database.
- **Prevents:** Avoids service race conditions and makes container crash loops easier to diagnose by providing clear `healthy` or `unhealthy` states.
- **Status:** **Partially Implemented.**

**4. Automate Database Migrations via an Entrypoint Script**
- **Action:** Implement a `entrypoint.sh` script for the backend container that waits for the database to be available before running `alembic upgrade head`.
- **Prevents:** Eliminates manual migration steps and prevents startup race conditions where the application fails because the database schema is not up-to-date.

**5. Ensure E2E Tests are Self-Contained with Full API Mocking**
- **Action:** In Playwright tests, mock the responses for all API calls (`GET` and `POST`) that a component makes. This ensures the test validates the component's logic in isolation.
- **Prevents:** Flaky tests that fail due to network timeouts, backend errors, or unpredictable data. It makes tests faster and more reliable.

**6. Rigorously Verify Dockerfile `COPY` Instructions**
- **Action:** When a tool inside a container fails due to a missing file, the first step is to audit the `Dockerfile` and ensure all necessary config files (e.g., `alembic.ini`) and scripts are explicitly included in the `COPY` instructions.
- **Prevents:** Debugging cycles where the container is missing critical files that exist locally but were not added to the Docker image.

**7. Implement Robust Frontend Test Mocking Strategy**
- **Issue:** Frontend tests failed due to mock data structure mismatches between what components expected (`patient.name`, `patient.dob`) and what mocks provided (`first_name`, `last_name`, `date_of_birth`).
- **Root Cause:** Disconnect between backend API schema and frontend component expectations, compounded by fragile test mocks.
- **Solution:** 
  - Use Mock Service Worker (MSW) for more robust API mocking instead of manual fetch overrides
  - Create centralized mock data factories that exactly match API response schemas
  - Generate mock data from OpenAPI specifications to ensure consistency
- **Action Items:**
  - Install and configure MSW for frontend tests
  - Create `src/mocks/` directory with typed mock data factories
  - Add validation that mock data matches TypeScript interfaces
- **Status:** **Identified - Needs Implementation.**

**8. Ensure Component Resilience with Defensive Coding**
- **Issue:** React components crashed with "categories.map is not a function" and "cases.map is not a function" when mock data wasn't properly initialized.
- **Root Cause:** Components assumed data would always be arrays without defensive checks.
- **Solution:**
  - Add defensive coding: `{(categories || []).map(...)}"
  - Implement proper error boundaries around components
  - Add loading states and error handling for all data fetching
- **Action Items:**
  - Review all `.map()` calls in components and add null/undefined checks
  - Implement a global ErrorBoundary component
  - Add loading and error states to all data-dependent components
- **Status:** **Identified - Needs Implementation.**

**9. Standardize Test Configuration for Developer Experience**
- **Issue:** Frontend tests ran in interactive watch mode requiring manual intervention (pressing 'q') and produced verbose output that obscured actual failures.
- **Root Cause:** Default test configuration optimized for development, not CI/CD or quick feedback loops.
- **Solution:**
  - Configure test commands to be non-interactive by default in Makefile
  - Use concise reporters that focus on failures
  - Separate commands for development (watch mode) vs CI (run once)
- **Action Items:**
  - Update `package.json` scripts: `"test:ci": "vitest --run --reporter=default"`
  - Configure Vitest with appropriate defaults in `vitest.config.ts`
  - Document test commands in README for different use cases
- **Status:** **Implemented.**

**10. Implement Contract Testing Between Frontend and Backend**
- **Issue:** Multiple API endpoint mismatches (e.g., `/api/categories/` vs `/api/complaint-categories/`, query parameter handling) caused test failures and component crashes.
- **Root Cause:** No automated validation that frontend API calls match backend endpoint definitions.
- **Solution:**
  - Implement contract testing using Pact or similar tools
  - Generate frontend API client from OpenAPI spec
  - Add integration tests that validate API contracts
- **Action Items:**
  - Set up Pact contract testing between frontend and backend
  - Automate frontend type generation from backend OpenAPI spec
  - Add API contract validation to CI/CD pipeline
- **Status:** **Identified - High Priority for Implementation.**

**11. Properly Separate Test Files from Production Builds**
- **Issue:** Production build failed with `Cannot find name 'global'` error because test setup file (`setup.ts`) was included in production TypeScript compilation.
- **Root Cause:** Test-specific files containing Node.js globals and test mocks were not excluded from production build configuration.
- **Solution:**
  - Exclude all test-related files from production builds in `tsconfig.build.json`
  - Use proper TypeScript configuration separation between development/test and production
  - Ensure test setup files use appropriate globals for their environment
- **Action Items:**
  - Review and update `tsconfig.build.json` exclude patterns
  - Establish naming conventions for test files (`.test.ts`, `.spec.ts`, `setup.ts`)
  - Add build validation to CI/CD to catch these issues early
- **Status:** **Implemented.**

---

#### Additional Learnings from Recent Thread

**12. Always Test API Endpoints with Real Data, Not Just Mocks**
- **Issue:** The `/api/patients` endpoint initially returned mock data, which masked issues with the real DB logic. The endpoint appeared to work until real data was used, which surfaced validation errors.
- **Solution:**
  - After implementing an endpoint, immediately test it with real database data, not just with hardcoded or mock returns.
  - Add a checklist item to PRs: "Have you tested this endpoint with real data?"
- **Status:** **Newly Documented.**

**13. Validate Seed Data Post-Migration**
- **Issue:** Seed scripts ran, but there was no automated check that the expected data was present and correct after migrations and seeding.
- **Solution:**
  - Add a post-seed validation step or script that queries the DB and logs (or asserts) the presence and count of key seed data (e.g., patients, cases, categories).
  - Consider adding a healthcheck endpoint or admin API that reports on seed data status.
- **Status:** **Newly Documented.**

**14. Defensive API Return Types**
- **Issue:** FastAPI validation errors occurred when endpoints returned `None` instead of an empty list, due to DB query results.
- **Solution:**
  - Always ensure endpoints return the correct type (e.g., `[]` instead of `None` for list endpoints), even if the DB is empty.
  - Add type checks or default returns in endpoint implementations.
- **Status:** **Newly Documented.** 