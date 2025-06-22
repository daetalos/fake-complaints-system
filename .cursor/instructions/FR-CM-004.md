### Execution Plan: FR-CM-004 Complaint Subcategory Selection

**1. Database: Create and Seed Complaint Category Table** (`@database-architecture`, `@type-safety`, `@lint-code-format`)
- [x] Define and create a database migration for a `complaint_categories` table based on the ERD.
- [x] **Schema:**
    - [x] `category_id` (Primary Key, e.g., UUID)
    - [x] `main_category` (Text, Not Null)
    - [x] `sub_category` (Text, Not Null)
    - [x] Add a unique constraint on `(main_category, sub_category)`.
- [x] Create a seed script to populate the `complaint_categories` table with initial data for development and testing.
- [x] Update the `complaints` table migration to include a non-nullable `category_id` foreign key referencing `complaint_categories(category_id)`.

**2. Backend: Implement Category API & Update Complaint Creation** (`@type-safety`, `@database-architecture`, `@lint-code-format`)
- [x] Create a new `GET /complaint-categories` endpoint.
- [x] **Logic:**
    - [x] Fetch all records from the `complaint_categories` table.
    - [x] Transform the flat list into a structured response, grouped by `main_category`, to simplify frontend logic.
    - [x] Example response: `[{ "main_category": "Clinical", "sub_categories": [{ "id": "uuid-...", "name": "Diagnosis" }] }]`
- [x] Update the `POST /complaints` endpoint.
- [x] **Logic:**
    - [x] Ensure the existing validation for `category_id` confirms it is a valid UUID corresponding to an existing category. Return a 400 error if not.
    - [x] Ensure the `category_id` is persisted correctly when creating the new complaint record.

**3. Frontend: Develop Dynamic Category Selection UI** (`@frontend-react-best-practices`, `@type-safety`, `@logging-standards-frontend`, `@lint-code-format`)
- [x] Update the complaint registration page (e.g., `/complaints/new`).
- [x] **Data Fetching:**
    - [x] On component mount, call the new `GET /complaint-categories` endpoint to retrieve available categories.
- [x] **UI Components:**
    - [x] A dropdown/select field for "Main Category", populated from the fetched data.
    - [x] A second dropdown for "Subcategory," which is disabled until a Main Category is selected.
- [x] **Functionality:**
    - [x] When a user selects a "Main Category", dynamically populate the "Subcategory" dropdown with the corresponding options.
    - [x] Upon form submission, include the selected `category_id` (from the subcategory) in the `POST /complaints` request body.
    - [x] Ensure the form's validation logic now also checks that both category fields have been selected.

**4. Testing: Write End-to-End Test for Category Selection** (`@testing-tools`, `@lint-code-format`)
- [x] Create a new E2E test for the category selection and submission process.
- [x] **Test Flow:**
    - [x] Navigate to the `/complaints/new` page.
    - [x] Select a main category from the first dropdown.
    - [x] Verify that the subcategory dropdown is enabled and populated with the correct options.
    - [x] Select a subcategory.
    - [x] Fill in the other required form fields (e.g., description).
    - [x] Submit the form.
    - [x] Confirm a success message is displayed.
    - [x] (Recommended) Intercept the API call to verify the `POST /complaints` request payload contains the correct `category_id`.

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
- **Status:** **Partially Implemented.** Achieved the core goal using an `entrypoint.sh` script which waits for the DB and runs migrations.

---
### New Learnings from FR-CM-004

**1. Automate Database Migrations via an Entrypoint Script**
- **Action:** Implement a `entrypoint.sh` script for the backend container that waits for the database to be available before running `alembic upgrade head`.
- **Prevents:** Eliminates manual migration steps and prevents startup race conditions where the application fails because the database schema is not up-to-date.

**2. Ensure E2E Tests are Self-Contained with Full API Mocking**
- **Action:** In Playwright tests, mock the responses for all API calls (`GET` and `POST`) that a component makes. This ensures the test validates the component's logic in isolation.
- **Prevents:** Flaky tests that fail due to network timeouts, backend errors, or unpredictable data. It makes tests faster and more reliable.

**3. Rigorously Verify Dockerfile `COPY` Instructions**
- **Action:** When a tool inside a container fails due to a missing file, the first step is to audit the `Dockerfile` and ensure all necessary config files (e.g., `alembic.ini`) and scripts are explicitly included in the `COPY` instructions.
- **Prevents:** Debugging cycles where the container is missing critical files that exist locally but were not added to the Docker image. 