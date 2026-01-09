# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllServices*](#listallservices)
  - [*GetProjectDetails*](#getprojectdetails)
- [**Mutations**](#mutations)
  - [*CreateDemoUser*](#createdemouser)
  - [*UpdateProjectStatus*](#updateprojectstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllServices
You can execute the `ListAllServices` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllServices(): QueryPromise<ListAllServicesData, undefined>;

interface ListAllServicesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllServicesData, undefined>;
}
export const listAllServicesRef: ListAllServicesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllServices(dc: DataConnect): QueryPromise<ListAllServicesData, undefined>;

interface ListAllServicesRef {
  ...
  (dc: DataConnect): QueryRef<ListAllServicesData, undefined>;
}
export const listAllServicesRef: ListAllServicesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllServicesRef:
```typescript
const name = listAllServicesRef.operationName;
console.log(name);
```

### Variables
The `ListAllServices` query has no variables.
### Return Type
Recall that executing the `ListAllServices` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllServicesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllServicesData {
  services: ({
    id: UUIDString;
    name: string;
    description: string;
    priceRange?: string | null;
    categories?: string[] | null;
  } & Service_Key)[];
}
```
### Using `ListAllServices`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllServices } from '@dataconnect/generated';


// Call the `listAllServices()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllServices();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllServices(dataConnect);

console.log(data.services);

// Or, you can use the `Promise` API.
listAllServices().then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

### Using `ListAllServices`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllServicesRef } from '@dataconnect/generated';


// Call the `listAllServicesRef()` function to get a reference to the query.
const ref = listAllServicesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllServicesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.services);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

## GetProjectDetails
You can execute the `GetProjectDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getProjectDetails(vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;

interface GetProjectDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
}
export const getProjectDetailsRef: GetProjectDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProjectDetails(dc: DataConnect, vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;

interface GetProjectDetailsRef {
  ...
  (dc: DataConnect, vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
}
export const getProjectDetailsRef: GetProjectDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProjectDetailsRef:
```typescript
const name = getProjectDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetProjectDetails` query requires an argument of type `GetProjectDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProjectDetailsVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProjectDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProjectDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetProjectDetailsData {
  project?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    budget?: number | null;
    startDate?: DateString | null;
    endDate?: DateString | null;
    status: string;
    company: {
      id: UUIDString;
      name: string;
    } & Company_Key;
      clientUser?: {
        id: UUIDString;
        displayName?: string | null;
      } & User_Key;
        projectServices_on_project: ({
          agreedPrice?: number | null;
          quantity: number;
          service: {
            id: UUIDString;
            name: string;
          } & Service_Key;
        })[];
  } & Project_Key;
}
```
### Using `GetProjectDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProjectDetails, GetProjectDetailsVariables } from '@dataconnect/generated';

// The `GetProjectDetails` query requires an argument of type `GetProjectDetailsVariables`:
const getProjectDetailsVars: GetProjectDetailsVariables = {
  id: ..., 
};

// Call the `getProjectDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProjectDetails(getProjectDetailsVars);
// Variables can be defined inline as well.
const { data } = await getProjectDetails({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProjectDetails(dataConnect, getProjectDetailsVars);

console.log(data.project);

// Or, you can use the `Promise` API.
getProjectDetails(getProjectDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.project);
});
```

### Using `GetProjectDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProjectDetailsRef, GetProjectDetailsVariables } from '@dataconnect/generated';

// The `GetProjectDetails` query requires an argument of type `GetProjectDetailsVariables`:
const getProjectDetailsVars: GetProjectDetailsVariables = {
  id: ..., 
};

// Call the `getProjectDetailsRef()` function to get a reference to the query.
const ref = getProjectDetailsRef(getProjectDetailsVars);
// Variables can be defined inline as well.
const ref = getProjectDetailsRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProjectDetailsRef(dataConnect, getProjectDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.project);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.project);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateDemoUser
You can execute the `CreateDemoUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface CreateDemoUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
}
export const createDemoUserRef: CreateDemoUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDemoUserRef:
```typescript
const name = createDemoUserRef.operationName;
console.log(name);
```

### Variables
The `CreateDemoUser` mutation has no variables.
### Return Type
Recall that executing the `CreateDemoUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDemoUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDemoUserData {
  user_insert: User_Key;
}
```
### Using `CreateDemoUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDemoUser } from '@dataconnect/generated';


// Call the `createDemoUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDemoUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDemoUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createDemoUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateDemoUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDemoUserRef } from '@dataconnect/generated';


// Call the `createDemoUserRef()` function to get a reference to the mutation.
const ref = createDemoUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDemoUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateProjectStatus
You can execute the `UpdateProjectStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateProjectStatus(vars: UpdateProjectStatusVariables): MutationPromise<UpdateProjectStatusData, UpdateProjectStatusVariables>;

interface UpdateProjectStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectStatusVariables): MutationRef<UpdateProjectStatusData, UpdateProjectStatusVariables>;
}
export const updateProjectStatusRef: UpdateProjectStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProjectStatus(dc: DataConnect, vars: UpdateProjectStatusVariables): MutationPromise<UpdateProjectStatusData, UpdateProjectStatusVariables>;

interface UpdateProjectStatusRef {
  ...
  (dc: DataConnect, vars: UpdateProjectStatusVariables): MutationRef<UpdateProjectStatusData, UpdateProjectStatusVariables>;
}
export const updateProjectStatusRef: UpdateProjectStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProjectStatusRef:
```typescript
const name = updateProjectStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateProjectStatus` mutation requires an argument of type `UpdateProjectStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProjectStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateProjectStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProjectStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProjectStatusData {
  project_update?: Project_Key | null;
}
```
### Using `UpdateProjectStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProjectStatus, UpdateProjectStatusVariables } from '@dataconnect/generated';

// The `UpdateProjectStatus` mutation requires an argument of type `UpdateProjectStatusVariables`:
const updateProjectStatusVars: UpdateProjectStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateProjectStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProjectStatus(updateProjectStatusVars);
// Variables can be defined inline as well.
const { data } = await updateProjectStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProjectStatus(dataConnect, updateProjectStatusVars);

console.log(data.project_update);

// Or, you can use the `Promise` API.
updateProjectStatus(updateProjectStatusVars).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

### Using `UpdateProjectStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProjectStatusRef, UpdateProjectStatusVariables } from '@dataconnect/generated';

// The `UpdateProjectStatus` mutation requires an argument of type `UpdateProjectStatusVariables`:
const updateProjectStatusVars: UpdateProjectStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateProjectStatusRef()` function to get a reference to the mutation.
const ref = updateProjectStatusRef(updateProjectStatusVars);
// Variables can be defined inline as well.
const ref = updateProjectStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProjectStatusRef(dataConnect, updateProjectStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.project_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.project_update);
});
```

