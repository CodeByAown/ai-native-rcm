### Traditional RCM
=================

Eligibility → Prior-auth approval → Clinical documentation → 

Medical coding → Claims scrubbing → Claims submission → 

Remittance tracking → Denial management → Claims resubmission → Remittance tracking → Reconciliation.


### General Workflow 
====================

Eligibility → Clinical Docs → Prior Auth → Coding → Scrubbing → Submission
    ↓
   (Async Wait for Event)
    ↓
  Remittance Tracking → Reconciliation
  OR
  Denial Management → (possibly resubmission loop)


### 1️. System Architecture
======================

- The system is designed as a set of microservices (agents) deployed in containers, each handling a discrete RCM step (eligibility, clinical docs, prior auth, coding, scrubbing, submission).

- Each exists in its own docker container (microservices), grouped by a single docker compose file. Agents also have access to LLMs and any other tools they require.

- An orchestrator (LangGraph) manages workflow logic and async state across agents.

- There is a Postgres database for persistence of artifacts and state after each step.

- We can also use LangGraph checkpoint to handle async state - Although I havent included any async agents yet.

- A web dashboard (NextJS) provides the interface to start and check the progress of the workflow.


### 2. Key Layers
=======================

- Presentation Layer: NextJS application is the UI for the Providers and Patients.

- API layer: FastAPI handles requests between agents, the orchestrator, and the UI.

- Agentic Layer: Independent AI agents for each RCM task. Agents have access to LLMS.

- Workflow Layer: LangGraph orchestrator with with mostly synchronous event handling at the moment.

- Persistence Layer: Postgres for artifacts and state; and Langraph Checkpoints.

** Not included is how we can restart workflows using LangGraph Checkpoints. 


### 3. Data Flow
=======================
- User uploads Medical Insurance Card to trigger a new workflow. 

- A clinical documentation has been hardocded and acts as the single source of truth for subsequent steps.

- The Orchestrator receives this request from the UI.

- The Eligibility agent uses OCR to extract details from the card, and passes this to an LLM to clean and validate the data. 

- The Prior Auth agent uses the patient data and clinical docs to determine if the patient is eligible for insurance.

- The Clinical documentation agent format the clinical docs to the LLM for coding.

- The Medical coding isnt fully implemented yet - It also produces medical_codes from clinical docs.

- The Scrubbing agent cleans the clinical docs for submission.

- The Submission agent submits the data to the insurance company. it will also handle resubmissions.

** Not included here are the Denials Agent, Payment Agent and Reconciliation Agent. which are more async and have possibly a cyclic flow.