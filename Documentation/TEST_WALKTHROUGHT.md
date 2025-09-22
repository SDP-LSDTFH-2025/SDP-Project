# Issues

## npm Packages 2025-09-21

    180 packages are looking for funding
    run `npm fund` for details

    1 low severity vulnerability

    To address all issues, run:
    npm audit fix

    Run `npm audit` for details.

## Env files being tracked fix

    git rm --cached frontend/.env
    git rm --cached frontend/.env.*
    git rm --cached backend/.env
    git rm --cached backend/.env.*

    git commit -m "Stop tracking .env files in frontend and backend"

# Tests

## Backend

* [x] **Test-Api-Info**

  **desc**: Information about our Api shows.

  **reason**: To easily check if our Api is up.

* [x] **Test-Public-Course-Get-Endpoint**

  **desc**: Get the all courses from public endpoint.

  **reason**: Have public endpoint for external use.

* [x] **Test-Private-Course-Get-Endpoint**

  **desc**: Get the all courses from private endpoint.

  **reason**: Have private endpoint for getting courses.

* [x] **Test-Private-Resources-Get-Endpoint**

  **desc**: Get the all resources from private endpoint.

  **reason**: Have private endpoint for getting resources or specific resource.

* [x] **Test-User-Get-Endpoint**

  **desc**: Check if we can get users by Id or All.

  **reason**: To get all users or specific users.

* ~~[ ] **Authentication**~~

  **desc**: Testing the authentication endpoint directly.

  **reason**: The test is not done because it is indirectly tested via login functionality

## Frontend

* [x] **Test-Login**

  **desc**: Test if user can correctly with Google email.
  
  **reason**: If user cannot login they cannot use the app.

* [x] **Test-Saving-State**

  **desc**: Saving the Login state for all tests to use

  **reason**: To avoid being block for automated testing by Google.




