`nlx supabase gen types --lang=typescript --project-id ${PROJECT_ID} --schema public > src/lib/supabase/types.ts`

# Features

## Calendar

- [ ] Display schedule events with details such as school name, class name, and time range.
- [ ] Add filters to allow users to view events by specific schools.

## Chat

- [x] Show a "Currently under maintenance" message with an appropriate icon and description to inform users.

## Profile

- [ ] Add a button to fetch the latest profile data. Include an ℹ️ icon to indicate the process may take time.
- [ ] Provide an option to generate a QR code to link the user's profile to a new school.
- [ ] Clear cached data when the user logs out to ensure sensitive information is removed.

## Register

- [ ] When the user completes registration:
    - [ ] Hash the user's data for security.
    - [ ] Store the hashed data in local storage.
    - [ ] Redirect the user to an information screen on how to validate their account.
- [ ] On the account validation page:
    - [ ] Inform the user (teacher) that they need to scan the school's QR code where they are employed.
    - [ ] Automatically create the user's account upon scanning.
    - [ ] Send an email validation to the user's registered email.
    - [ ] Establish a link between the user and the school (marking the user as a teacher at the school).
    - [ ] Assign the "Teacher" role to the user's account.
    - [ ] Redirect the user to the OTP (One-Time Password) screen for verification.
    - [ ] If the correct OTP is entered:
        - [ ] Finalize the account creation process.
        - [ ] Clear the registration information from the cache.
        - [ ] Allow the user to log in successfully.

## Login

- [ ] On the login screen:
    - [ ] If the user's email is not verified:
        - [ ] Automatically resend the email verification.
        - [ ] Redirect the user to the OTP screen for email validation.