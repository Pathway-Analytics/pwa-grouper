# Process Management

## Functions, Queues, Topics, Events, State Machines

The choice around how processes are moudularised and orchestrated determines how understandable and manageable the code base becomes.

### Event Bus

The event bus can be seen as the single point from which key processes are triggered either by user events or other processes.

There are three types of events the bus can trigger; a post to a queue; a call to a function or a post to a log group.

An event can be triggered by any function, including user initiated functions other functions

### State Machine

We can use a state machine to track a process lifecyle.  This is most useful when a process has multiples steps that need to be chunked and sequenced.  The state machine can make sure necessary processes are completed before passing on to the next process.  A process in this case can be one or more functions.

### Queues

We may want to sequence some processes or make them wait until resources become available or simply make a list (eg of errors).  The queue allows us to store messages and pass these on to an event or a function

### Topics

Subscribe/publish construct allowing elements to receive notification of an event.

### Core

A folder with shared business logic used in the sveltkit app.  Code here is not run as a specific function unless it called in a construct at build time.  In short, the /packages/core code files are imported into whatever construct is using it at build time.

### Functions

A folder with functions that are api endpoints, event bus handlers, s3 event handlers, queue targets or cron tasks.  Files here are used as lambda functions in their own right if they are referred to in the stacks at build time.

## Design

### Highlevel Processes

#### adminAreaSpider

Fetch data from api, transform where necessary and import if not already present into cluster.

A number of queues can handle the process as each item simply requires its parent to be known.

#### dataMigrationSpider

Fetch data from api, create local IDs if required, lookup and translate an local foreign key Ids, transform where necessary and import if not already present into cluster.

Inter-table dependencies require the data from some tables proir to processing others, some inter-table dependencies will require a recursive processing as they are self-referencing.

State machine can handle the process.

#### fileUPload

The file upload and validation process involves the following steps:

    - validateFileData 
    - multiple files can be uploaded by the user
    - each upload triggers a validation
    - validation includes reading the file, check the data, and writing to db. Chunked process.

The time between an uplaod and a submission may be indefinate, state machines allow a state to exist for 1 year before requiring it to be reintiated, and there is a charge associated with the length of time of a state.  Therefore it is best to decouple the fileUpload from the submission process.

The file upload process can be handled with chunking and simple queues.

#### submission

The overall submission process will be managed in a state machine, it will include the following sub-processes:

    - dataCurrencyTriggers - parsing the data against the config. A queue of each chunked process.
    - currencyInvalidCombinations - parsing the data against the config. A queue of each chunked process.
    - currencyTariffValues - parsing the data against the config. A queue of each chunked process.
    - kpiCalculations - running kpi queries against data. A queue of each kpi/submission.

#### reportCollation

Collate a report for a given data set based on start date, period, provider and commissioner.  Compile the data into an excel file and make it availble to a user for a given period in a download link.

State machine can handle the process.

#### subscription managment

User is assigend roles and organsiations based on the subscription they have.  Subscriptions are billed with an invoice to an organisation and cover a period of time.  The user's active roles are based on their current subscription.  These are long ruinning states and probably better handled in database.
