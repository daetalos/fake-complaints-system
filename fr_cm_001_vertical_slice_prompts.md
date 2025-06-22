# FR-CM-001: Complaint Entry Form – Vertical Slice Prompts (Tech-Specific)

# Project Initialization & Structure

## 0.1. Backend Setup (Python, Poetry, FastAPI, Alembic)
- **Prompt:** Initialize a new Python project for the backend using Poetry:
  - `poetry new backend && cd backend`
  - `poetry add fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic fastapi-jwt-auth pytest httpx`
- **Prompt:** Initialize Alembic for migrations:
  - `alembic init alembic`
- **Prompt:** Create a `Dockerfile` for the backend:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-root
COPY . .
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- **Prompt:** Create a `.env` file for secrets (not committed to VCS):
```
DATABASE_URL=postgresql://myuser:mypass@db:5432/mydb
JWT_SECRET_KEY=your_jwt_secret
```
- **Prompt:** Add `.env` to `.gitignore`.

## 0.2. Frontend Setup (Next.js, Material-UI, npm/yarn)
- **Prompt:** Initialize a new Next.js app in a `frontend` directory:
  - `npx create-next-app@latest frontend --typescript`
  - `cd frontend && npm install @mui/material @emotion/react @emotion/styled axios react-hook-form @testing-library/react cypress`
- **Prompt:** Create a `Dockerfile` for the frontend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```
- **Prompt:** Create a `.env.local` file for frontend secrets (not committed to VCS):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
- **Prompt:** Add `.env.local` to `.gitignore`.

## 0.3. Makefile for Common Commands
- **Prompt:** In the project root, create a `Makefile` with targets for:
```
up:
	docker-compose up --build

down:
	docker-compose down

backend-migrate:
	cd backend && poetry run alembic upgrade head

backend-test:
	cd backend && poetry run pytest

frontend-test:
	cd frontend && npm run test

e2e:
	cd frontend && npx cypress open
```

## 0.4. Minimal README & Onboarding
- **Prompt:** Create a `README.md` with:
  - Project overview
  - Prerequisites (Docker, Poetry, Node.js)
  - Setup instructions (clone, env files, make up)
  - How to run tests
  - How to contribute

## 0.5. Linting & Code Style

### Backend (Python)
- **Prompt:** Add linting and formatting tools to the backend:
  - `poetry add --dev flake8 black isort`
- **Prompt:** Create config files in `backend/`:
  - `.flake8` for flake8 rules (e.g., max-line-length=88)
  - `pyproject.toml` for black and isort settings (if not already present)
- **Prompt:** Add Makefile targets:
```
lint-backend:
	cd backend && poetry run flake8 .

format-backend:
	cd backend && poetry run black . && poetry run isort .
```

### Frontend (Next.js)
- **Prompt:** Add linting and formatting tools to the frontend:
  - `npm install --save-dev eslint prettier eslint-config-next eslint-plugin-react eslint-plugin-jsx-a11y eslint-plugin-import`
- **Prompt:** Initialize ESLint and Prettier configs in `frontend/`:
  - `npx eslint --init` (choose Next.js, React, TypeScript, Airbnb or Next.js config)
  - Create `.prettierrc` (e.g., `{ "singleQuote": true, "semi": true }`)
- **Prompt:** Add Makefile targets:
```
lint-frontend:
	cd frontend && npm run lint

format-frontend:
	cd frontend && npx prettier --write .
```

---

## 1. Database Layer (PostgreSQL, SQLAlchemy, Alembic, Docker Compose)

### 1.1. Set Up PostgreSQL with Docker Compose
- **Prompt:** Add a `docker-compose.yml` service for PostgreSQL (e.g., image: postgres:15, with environment variables for POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD). Ensure the database is accessible to your backend service.
- **Acceptance Criteria:** Running `docker-compose up` starts a working PostgreSQL instance.
- **Test Prompt:** Use `psql` or a database client to connect and verify the database is running.

### 1.2. Create/Update Complaint Table with Alembic Migration
- **Prompt:** Use Alembic to generate a migration that creates a `complaints` table with the following columns:
  - `complaint_id` (UUID, primary key, default generated)
  - `description` (TEXT, NOT NULL)
  - `created_at` (TIMESTAMP, NOT NULL, default now())
  - `updated_at` (TIMESTAMP, NOT NULL, default now(), auto-updated)
- **Example Alembic command:** `alembic revision --autogenerate -m "create complaints table"`
- **Acceptance Criteria:** Table and fields exist in PostgreSQL with correct types and constraints.
- **Test Prompt:** Write a Pytest test that uses SQLAlchemy to inspect the table and verify schema correctness.

### 1.3. Add Foreign Key Associations
- **Prompt:** Update the Alembic migration to add nullable foreign keys for `patient_id`, `case_id`, and `complainant_id` (all UUID, referencing their respective tables).
- **Acceptance Criteria:** Foreign key constraints exist and reference correct tables.
- **Test Prompt:** Write a Pytest test to verify foreign key constraints are present and enforce referential integrity.

### 1.4. Ensure Automatic Timestamps
- **Prompt:** Use SQLAlchemy event listeners or database triggers to auto-update `updated_at` on row update.
- **Acceptance Criteria:** `updated_at` is updated automatically on modification.
- **Test Prompt:** Write a Pytest test that updates a row and checks the timestamp changes.

## 2. Backend Logic (Python, FastAPI, SQLAlchemy, Pydantic, Pytest)

### 2.1. Implement SQLAlchemy Complaint Model
- **Prompt:** Create a `Complaint` SQLAlchemy model in `models.py` with fields: `complaint_id` (UUID, primary key, default=uuid4), `description` (Text, nullable=False), `created_at` (DateTime, default=datetime.utcnow), `updated_at` (DateTime, default=datetime.utcnow, onupdate=datetime.utcnow), `patient_id`, `case_id`, `complainant_id` (all UUID, nullable=True, ForeignKey to respective tables).
- **Example:**
```python
class Complaint(Base):
    __tablename__ = 'complaints'
    complaint_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.patient_id'), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey('cases.case_id'), nullable=True)
    complainant_id = Column(UUID(as_uuid=True), ForeignKey('complainants.complainant_id'), nullable=True)
```
- **Acceptance Criteria:** Model matches the database schema and supports CRUD operations.
- **Test Prompt:** Write Pytest unit tests to verify model instantiation, defaults, and type enforcement.

### 2.2. Create Pydantic Schemas for Complaint
- **Prompt:** Define Pydantic models in `schemas.py` for request/response validation:
  - `ComplaintCreate` (description: str, patient_id/case_id/complainant_id: Optional[UUID])
  - `ComplaintRead` (all fields, for API responses)
- **Example:**
```python
class ComplaintCreate(BaseModel):
    description: str
    patient_id: Optional[UUID]
    case_id: Optional[UUID]
    complainant_id: Optional[UUID]

class ComplaintRead(BaseModel):
    complaint_id: UUID
    description: str
    created_at: datetime
    updated_at: datetime
    patient_id: Optional[UUID]
    case_id: Optional[UUID]
    complainant_id: Optional[UUID]
```
- **Acceptance Criteria:** Schemas are used for FastAPI request/response validation.
- **Test Prompt:** Write Pytest tests for schema validation and serialization.

### 2.3. Implement Complaint Service Logic
- **Prompt:** In `services/complaints.py`, implement a function `create_complaint(db: Session, complaint: ComplaintCreate) -> Complaint` that validates input, creates a new Complaint, and persists it using SQLAlchemy.
- **Acceptance Criteria:** Service creates and returns a Complaint, raises exceptions for invalid data.
- **Test Prompt:** Write Pytest unit tests for the service, including success and failure cases.

### 2.4. Add Validation for Required Fields and Associations
- **Prompt:** Ensure the service checks that `description` is present and not empty. If patient_id, case_id, or complainant_id are provided, verify they exist in the database (raise HTTP 400 if not).
- **Acceptance Criteria:** Invalid or missing data is rejected with clear errors.
- **Test Prompt:** Write tests for all validation and error scenarios.

### 2.5. Automatic Timestamps
- **Prompt:** Ensure `created_at` and `updated_at` are set automatically by SQLAlchemy and updated on modification.
- **Acceptance Criteria:** Timestamps are correct on create and update.
- **Test Prompt:** Write tests to verify timestamp behavior.

## 3. API Layer (FastAPI, OpenAPI/Swagger, HTTPX, Pytest, JWT Auth)

### 3.1. Implement Complaint Creation Endpoint
- **Prompt:** In `main.py` or `routers/complaints.py`, create a POST endpoint `/complaints` using FastAPI that accepts a `ComplaintCreate` Pydantic model and returns a `ComplaintRead` model. Require JWT authentication (e.g., using fastapi-jwt-auth or fastapi-users).
- **Example:**
```python
@router.post("/complaints", response_model=ComplaintRead, status_code=201)
async def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ...
```
- **Acceptance Criteria:** Endpoint is documented in OpenAPI/Swagger UI, requires JWT, and returns 201 with created complaint or 400 with error.
- **Test Prompt:** Use HTTPX and Pytest to test successful creation and authentication failure.

### 3.2. Example Request/Response Payloads
- **Prompt:** Document example request and response JSON in the OpenAPI schema and in code comments.
- **Example Request:**
```json
{
  "description": "Patient reported long wait time.",
  "patient_id": "b1a7c2e0-1234-4cde-8f2a-123456789abc"
}
```
- **Example Response:**
```json
{
  "complaint_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "description": "Patient reported long wait time.",
  "created_at": "2024-06-01T12:00:00Z",
  "updated_at": "2024-06-01T12:00:00Z",
  "patient_id": "b1a7c2e0-1234-4cde-8f2a-123456789abc",
  "case_id": null,
  "complainant_id": null
}
```
- **Acceptance Criteria:** Example payloads are visible in Swagger UI and code.
- **Test Prompt:** Write HTTPX tests that use these payloads.

### 3.3. Input Validation and Error Handling
- **Prompt:** Use FastAPI's validation to return 422 for invalid input. Return 400 with a custom error message for invalid associations (e.g., patient not found).
- **Acceptance Criteria:** API returns correct status codes and error messages.
- **Test Prompt:** Write HTTPX tests for all error scenarios.

### 3.4. Standardized API Responses
- **Prompt:** Ensure all responses follow a consistent JSON structure. Use FastAPI's response_model and error handling features.
- **Acceptance Criteria:** All responses are documented and consistent.
- **Test Prompt:** Write tests to verify response structure.

### 3.5. JWT Authentication and Authorization
- **Prompt:** Implement JWT authentication using fastapi-jwt-auth or fastapi-users. Only authenticated users can create complaints.
- **Acceptance Criteria:** Unauthenticated requests receive 401; authenticated users succeed.
- **Test Prompt:** Write HTTPX tests for both scenarios.

## 4. Frontend/UI (Next.js, Material-UI, React Testing Library, Cypress)

### 4.1. Create Basic Complaint Entry Form Page
- **Prompt:** In your Next.js app, create a page at `/complaints/new` with a form using Material-UI components. The form should have a required multiline `description` field and a submit button. Use React Hook Form or Formik for form state management.
- **Example:**
```jsx
import { TextField, Button, Container } from '@mui/material';
// ...
<TextField label="Description" name="description" required multiline rows={4} />
<Button type="submit">Submit</Button>
```
- **Acceptance Criteria:** User can enter a description and submit the form; successful submissions show a confirmation message.
- **Test Prompt:** Use React Testing Library to test field rendering and successful submission.

### 4.2. Add Required Field Validation
- **Prompt:** Add client-side validation to ensure the description field is not empty before allowing submission. Display a Material-UI error message if validation fails.
- **Acceptance Criteria:** Form cannot be submitted with an empty description; error is shown to the user.
- **Test Prompt:** Write React Testing Library tests for validation and error display.

### 4.3. Connect to FastAPI Backend with JWT
- **Prompt:** On form submit, send a POST request to the FastAPI `/complaints` endpoint using fetch or axios. Include the JWT token in the Authorization header. Handle and display API errors using Material-UI Alert components.
- **Example:**
```js
fetch('/api/complaints', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ description })
})
```
- **Acceptance Criteria:** API errors are shown; successful creation is confirmed.
- **Test Prompt:** Use React Testing Library to test error handling and feedback display.

### 4.4. Add Fields for Associations (Patient, Case, Complainant)
- **Prompt:** Extend the form to include optional dropdowns or autocomplete fields for patient, case, and complainant (fetch options from backend endpoints). Use Material-UI Autocomplete.
- **Acceptance Criteria:** User can select associations; values are sent in the API request.
- **Test Prompt:** Write tests for field rendering, selection, and submission.

### 4.5. Accessibility and Usability Enhancements
- **Prompt:** Ensure the form is accessible (keyboard navigation, screen reader support, proper labels) and user-friendly (clear instructions, logical tab order). Use Material-UI's accessibility features and test with axe-core.
- **Acceptance Criteria:** Form meets WCAG 2.1 AA standards.
- **Test Prompt:** Use React Testing Library and axe-core for accessibility tests.

### 4.6. End-to-End Testing with Cypress
- **Prompt:** Write Cypress tests that simulate a user filling out the form, submitting it, and verifying the complaint is created (mock backend or use test DB). Test both success and error scenarios.
- **Acceptance Criteria:** E2E tests cover all user flows and error cases.

## 5. End-to-End Testing & Deployment (Cypress, HTTPX, Docker Compose)

### 5.1. End-to-End Test for Complaint Entry (Cypress)
- **Prompt:** Write a Cypress test that launches the Next.js app, navigates to `/complaints/new`, fills out the form, submits it, and verifies the complaint is created (by checking for confirmation or querying the backend API). Use a test JWT for authentication.
- **Acceptance Criteria:** The E2E test covers the full flow from UI to backend, including error handling and feedback.

### 5.2. API Integration Test (HTTPX + Pytest)
- **Prompt:** Write HTTPX-based integration tests in Pytest that start the FastAPI app (with a test database), send POST requests to `/complaints`, and verify correct database state and API responses.
- **Acceptance Criteria:** Integration tests cover all API flows, including validation and authentication.

### 5.3. Docker Compose for Full Stack
- **Prompt:** Create a `docker-compose.yml` file that defines services for:
  - `db`: PostgreSQL (with persistent volume)
  - `backend`: FastAPI app (build from Dockerfile, depends_on db)
  - `frontend`: Next.js app (build from Dockerfile, depends_on backend)
- Expose necessary ports (e.g., 5432 for db, 8000 for backend, 3000 for frontend). Use environment variables for configuration and secrets.
- **Example Service Block:**
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypass
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://myuser:mypass@db:5432/mydb
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
volumes:
  db_data:
```
- **Acceptance Criteria:** Running `docker-compose up` starts the full stack, accessible at the expected ports.
- **Test Prompt:** Use Cypress and HTTPX tests against the running stack to verify end-to-end functionality.

### 5.4. Regression and Usability Testing
- **Prompt:** Regularly run all tests (unit, integration, E2E) in CI. Conduct usability tests with real users to identify pain points and improve the form.
- **Acceptance Criteria:** No regressions are introduced; usability feedback is incorporated iteratively.

_This completes the tech-specific, implementation-ready vertical slice prompt set for FR-CM-001: Complaint Entry Form. Each section is concrete, test-driven, and ready for robust, incremental delivery._ 