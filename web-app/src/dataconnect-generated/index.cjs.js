const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'startup',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createDemoUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDemoUser');
}
createDemoUserRef.operationName = 'CreateDemoUser';
exports.createDemoUserRef = createDemoUserRef;

exports.createDemoUser = function createDemoUser(dc) {
  return executeMutation(createDemoUserRef(dc));
};

const listAllServicesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllServices');
}
listAllServicesRef.operationName = 'ListAllServices';
exports.listAllServicesRef = listAllServicesRef;

exports.listAllServices = function listAllServices(dc) {
  return executeQuery(listAllServicesRef(dc));
};

const getProjectDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetProjectDetails', inputVars);
}
getProjectDetailsRef.operationName = 'GetProjectDetails';
exports.getProjectDetailsRef = getProjectDetailsRef;

exports.getProjectDetails = function getProjectDetails(dcOrVars, vars) {
  return executeQuery(getProjectDetailsRef(dcOrVars, vars));
};

const updateProjectStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateProjectStatus', inputVars);
}
updateProjectStatusRef.operationName = 'UpdateProjectStatus';
exports.updateProjectStatusRef = updateProjectStatusRef;

exports.updateProjectStatus = function updateProjectStatus(dcOrVars, vars) {
  return executeMutation(updateProjectStatusRef(dcOrVars, vars));
};
