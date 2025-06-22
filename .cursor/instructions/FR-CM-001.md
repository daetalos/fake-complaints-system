### Execution Plan: FR-CM-001 Complaint Entry Form

**1. Database: Create Complaint Table**
- [x] Define and create a database migration for a `complaints` table.
- [x] **Schema:**
    - [x] `complaint_id` (Primary Key, e.g., UUID)
    - [x] `description` (Text, Not Null)
    - [x] `created_at` (Timestamp, Not Null)
    - [x] `updated_at` (Timestamp, Not Null)

**2. Backend: Implement Complaint Creation API**
- [x] Create a `POST /complaints` endpoint.
- [x] The endpoint accepts a JSON body with a `description` field.
- [x] **Logic:**
    - [x] Validate that the `description` is not empty. Return a 400 error if it is.
    - [x] On successful validation, save the new complaint to the database.
    - [x] Return the complete complaint object (including `complaint_id` and timestamps) with a 201 status code.

**3. Frontend: Develop Complaint Entry Form**
- [x] Create a new page at `/complaints/new`.
- [x] **UI Components:**
    - [x] A multi-line text field for `Description`.
    - [x] A "Submit" button.
- [x] **Functionality:**
    - [x] Implement required-field validation on the `Description` field, showing an error message if it's empty on submission attempt.
    - [x] On submit, send a POST request with the form data to the `/complaints` backend endpoint.
    - [x] Display a success notification upon successful creation.
    - [x] Display an error notification if the API returns an error.

**4. Testing: Write End-to-End Test**
- [ ] Create an E2E test for the complaint submission process.
- [ ] **Test Flow:**
    - [ ] Navigate to the `/complaints/new` page.
    - [ ] Verify that submitting the form with an empty description shows a validation error.
    - [ ] Fill in the description and submit the form.
    - [ ] Confirm that a success message is displayed.
    - [ ] (Optional) Verify the data was persisted by making a separate API call.