FHIR to OMOP Conversion

![Screenshot 2024-11-25 at 10 07 09](https://github.com/user-attachments/assets/ee6ebda3-7098-47cf-9777-25ea6fc9dc66)

![Screenshot 2024-11-25 at 09 53 12](https://github.com/user-attachments/assets/66c94fbb-a055-462a-b854-e881008def3a)

![Screenshot 2024-11-25 at 09 53 35](https://github.com/user-attachments/assets/e4ef2e46-7a5d-45af-9999-5b67fd9c5a65)

![Screenshot 2024-11-25 at 09 53 55](https://github.com/user-attachments/assets/fc56c203-3f4b-417d-a020-432d1fff898a)


Created a modular Node.js/TypeScript program that converts FHIR data to OMOP CDM format.

User Registration:

*  Email and password registration
  
*  Password confirmation
  
*  Error handling
 
*  Navigation to converter after successful registration
  
  Forgot Password:

Email input for password reset
  
  Success/error messages
  
  Link back to login

  Reset Password:

New password and confirmation inputs
  
  Handles reset token from URL
  
  Redirects to login after successful reset
  
Enhanced Login:
  
  Added links to registration and forgot password
 
  Improved error handling

  Better UI/UX with Material-UI components

  Updated Auth Context:

Added password reset functions
 
  Improved type safety
 
  Better error handling
  
  The application now has a complete authentication flow with proper validation and error handling. Users can register, login, reset their password, and securely access the converter.


Here's what each file does:
  
 * src/index.ts: Main entry point that sets up the database and runs the converter
 * src/database.ts: Database setup using SQLite (in-memory for demo) with OMOP schema
 * src/converter.ts: Core conversion logic with type validation using Zod
 * src/sample-data.ts: Sample FHIR data for testing
 * src/__tests__/converter.test.ts: Unit tests for the converter

Key features:
    Type safety with TypeScript
    Data validation using Zod
    SQLite database with Knex.js ORM
    Unit testing with Vitest
    Modular design for easy expansion
    Currently implements Patient → Person conversion. To extend:
    Add more OMOP tables in database.ts
    Create new conversion methods in converter.ts
    Add schemas for other FHIR resources
    Implement vocabulary mapping service


Added a modern React-based UI with Material-UI components that includes:

    Split-pane view with FHIR input and OMOP output
    JSON formatting for better readability
    Error handling and loading states
    Sample data reset button
    Clean, responsive design
    Syntax-highlighted text areas
    Real-time conversion
    The UI allows you to:

Edit FHIR patient data in JSON format
    Convert it to OMOP format with a single click
    View the conversion results
    Reset to sample data if needed
    See any validation errors or conversion issues
To run:

    Tests: npm test
    Program: npm start

To run the docker immage
    
    npm install
    npm run dev
    docker-compose up -d
    docker run -p 3000:3000 fhir_omop

Example FHIR buddles are given to check the installation. 
    
    AMedicationDispenseBundle.json
    CompleteDischageSummary.json
    DiagnosticreportBudle.json
    EncounterMultipleDiagnosis.json
    ImmunizationBudle.json
    MinimalPatientandObservationBundle.json
    SearchsetBundle.json
    TransactionBundle.json
    simpleCollectionBundle.json
    

