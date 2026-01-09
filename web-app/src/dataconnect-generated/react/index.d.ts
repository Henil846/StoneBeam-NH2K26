import { CreateDemoUserData, ListAllServicesData, GetProjectDetailsData, GetProjectDetailsVariables, UpdateProjectStatusData, UpdateProjectStatusVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateDemoUser(options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;
export function useCreateDemoUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDemoUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateDemoUserData, undefined>;

export function useListAllServices(options?: useDataConnectQueryOptions<ListAllServicesData>): UseDataConnectQueryResult<ListAllServicesData, undefined>;
export function useListAllServices(dc: DataConnect, options?: useDataConnectQueryOptions<ListAllServicesData>): UseDataConnectQueryResult<ListAllServicesData, undefined>;

export function useGetProjectDetails(vars: GetProjectDetailsVariables, options?: useDataConnectQueryOptions<GetProjectDetailsData>): UseDataConnectQueryResult<GetProjectDetailsData, GetProjectDetailsVariables>;
export function useGetProjectDetails(dc: DataConnect, vars: GetProjectDetailsVariables, options?: useDataConnectQueryOptions<GetProjectDetailsData>): UseDataConnectQueryResult<GetProjectDetailsData, GetProjectDetailsVariables>;

export function useUpdateProjectStatus(options?: useDataConnectMutationOptions<UpdateProjectStatusData, FirebaseError, UpdateProjectStatusVariables>): UseDataConnectMutationResult<UpdateProjectStatusData, UpdateProjectStatusVariables>;
export function useUpdateProjectStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProjectStatusData, FirebaseError, UpdateProjectStatusVariables>): UseDataConnectMutationResult<UpdateProjectStatusData, UpdateProjectStatusVariables>;
