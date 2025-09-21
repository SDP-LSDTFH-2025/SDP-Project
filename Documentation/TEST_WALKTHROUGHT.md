# Issues

## Running Backend: 2025-09-21

    ...\GitHub\SDP-Project\backend> npm run dev

    > sdp-backend@1.0.0 dev
    > nodemon server.js

    [nodemon] 3.1.10
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching path(s): *.*
    [nodemon] watching extensions: js,mjs,cjs,json
    [nodemon] starting `node server.js`
    Courses model loaded: true
    Not all input has been taken into account at your final specification.
    Here's the report:


    Error in ./routes/Courses.js :
    YAMLSyntaxError: All collection items must start at the same column at line 2, column 3:

    delete:
    ^^^^^^^…

    YAMLSyntaxError: All collection items must start at the same column at line 13, column 5:

        - created_by: id
        ^^^^^^^^^^^^^^^^…

    YAMLSemanticError: Nested mappings are not allowed in compact mappings at line 14, column 16:

        required: true
                ^^^^…

    YAMLSemanticError: Implicit map keys need to be on a single line at line 14, column 16:

        required: true
                ^^^^…
    ,Error in ./routes/Courses.js :
    YAMLSemanticError: Nested mappings are not allowed in compact mappings at line 9, column 22:

            description: Number of courses to return (default: 10)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^…
    ,Error in ./routes/UserCourses.js :
    YAMLSemanticError: Nested mappings are not allowed in compact mappings at line 9, column 22:

            description: Number of enrollments to return (default: 10)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^…
    ,Error in ./routes/UserCourses.js :
    YAMLSemanticError: Nested mappings are not allowed in compact mappings at line 9, column 22:

            description: Number of courses to return (default: 10)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^…

    Executing (default): SELECT 1+1 AS result
    ✅ Database connection established successfully.
    ✅ Database synchronized successfully.
    🚀 Server is running on port 3000
    📚 API Documentation available at: http://localhost:3000/api-docs

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

