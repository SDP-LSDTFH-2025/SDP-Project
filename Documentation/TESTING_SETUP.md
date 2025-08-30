### 1. **Ensure You Are in the `frontend` Directory**

```bash
cd frontend
```

This command will make sure you're in the frontend directory of your project.

### 2. **Install Cypress as a Development Dependency**

Run the following command to install Cypress:

```bash
npm install cypress --save-dev
```

This will install Cypress and add it as a development dependency in your `package.json`.

### 3. **Open Cypress**

After installation, you can open Cypress using the command:

```bash
npx cypress open
```

This will trigger Cypress to open its GUI, and you'll see:

```
✔  Verified Cypress! C:\Users\<username>\AppData\Local\Cypress\Cache\<version>\Cypress
Opening Cypress...
```

### 4. **Select E2E Testing and Choose Browser**

1. In the Cypress GUI, you'll be prompted to choose between **E2E Testing** or **Component Testing**.

2. Select **E2E Testing** to initialize end-to-end testing.

3. Then, you will be asked to select a browser. Choose the browser that is installed on your system (Chrome, Edge, etc.).

### 5. **Cypress Folder Structure**

After initialization, a `cypress` folder will appear in your project directory. The structure of the folder should look like this:

```
cypress/
  ├── fixtures/
    ├── example.json
  ├── e2e/
    ├── ...(spec files)
  ├── support/
    ├── command.js
    ├── e2e.js
```

* **fixtures**: This folder stores static data that can be used in your tests.
* **e2e**: This is where your test specs (test files) are stored.
* **support**: Holds support files like commands and utilities to help with your tests.

### 6. **Create a New Test (Spec File)**

To create your first test, navigate to the `e2e` folder and create a new spec file.

For example, you can create a `sample_spec.js` file inside the `e2e` folder with the following basic test:

```js
describe('My First Test', () => {
  it('Visits the Frontend Website', () => {
    cy.visit('http://localhost:3000')  
  })
})
```

### 7. **Run the Test**

Once your spec file is created, you should see it appear in the Cypress test runner (GUI). Click on the test to run it.

### 9. **Run the Tests Locally or in CI**

* **Locally**: `npx cypress open` or `npx cypress run` for headless mode.



