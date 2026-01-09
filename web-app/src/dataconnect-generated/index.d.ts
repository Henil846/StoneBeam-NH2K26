import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Company_Key {
  id: UUIDString;
  __typename?: 'Company_Key';
}

export interface CreateDemoUserData {
  user_insert: User_Key;
}

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

export interface GetProjectDetailsVariables {
  id: UUIDString;
}

export interface ListAllServicesData {
  services: ({
    id: UUIDString;
    name: string;
    description: string;
    priceRange?: string | null;
    categories?: string[] | null;
  } & Service_Key)[];
}

export interface ProjectService_Key {
  projectId: UUIDString;
  serviceId: UUIDString;
  __typename?: 'ProjectService_Key';
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface UpdateProjectStatusData {
  project_update?: Project_Key | null;
}

export interface UpdateProjectStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateDemoUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateDemoUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateDemoUserData, undefined>;
  operationName: string;
}
export const createDemoUserRef: CreateDemoUserRef;

export function createDemoUser(): MutationPromise<CreateDemoUserData, undefined>;
export function createDemoUser(dc: DataConnect): MutationPromise<CreateDemoUserData, undefined>;

interface ListAllServicesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllServicesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllServicesData, undefined>;
  operationName: string;
}
export const listAllServicesRef: ListAllServicesRef;

export function listAllServices(): QueryPromise<ListAllServicesData, undefined>;
export function listAllServices(dc: DataConnect): QueryPromise<ListAllServicesData, undefined>;

interface GetProjectDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProjectDetailsVariables): QueryRef<GetProjectDetailsData, GetProjectDetailsVariables>;
  operationName: string;
}
export const getProjectDetailsRef: GetProjectDetailsRef;

export function getProjectDetails(vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;
export function getProjectDetails(dc: DataConnect, vars: GetProjectDetailsVariables): QueryPromise<GetProjectDetailsData, GetProjectDetailsVariables>;

interface UpdateProjectStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectStatusVariables): MutationRef<UpdateProjectStatusData, UpdateProjectStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProjectStatusVariables): MutationRef<UpdateProjectStatusData, UpdateProjectStatusVariables>;
  operationName: string;
}
export const updateProjectStatusRef: UpdateProjectStatusRef;

export function updateProjectStatus(vars: UpdateProjectStatusVariables): MutationPromise<UpdateProjectStatusData, UpdateProjectStatusVariables>;
export function updateProjectStatus(dc: DataConnect, vars: UpdateProjectStatusVariables): MutationPromise<UpdateProjectStatusData, UpdateProjectStatusVariables>;

