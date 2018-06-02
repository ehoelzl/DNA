/*Set of constants for the app*/
const Constants = {
  EMAIL: 'email',
  HASH: 'hash',
  NAME: 'name',
  POST: 'post',
  FILE: 'file',
  SIGNATURE: 'signature',
  MAX_FILE_SIZE: 10000000 //Max file size of 10 MB, to avoid crashing the app
};

const RequestStatus = {
  NOT_REQUESTED: 0,
  PENDING: 1,
  REJECTED: 2,
  CANCELLED: 3,
  ACCEPTED: 4
};

const RequestStatus_String = {
  NOT_REQUESTED: "-",
  PENDING: "Pending",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  ACCEPTED: "Accepted"
};

/*Returns the string associated to the given status (Between 0 and 3)*/
const getStatusString = (status) => {
  switch (status.toNumber()) {
    case RequestStatus.NOT_REQUESTED:
      return RequestStatus_String.NOT_REQUESTED;
    case RequestStatus.PENDING:
      return RequestStatus_String.PENDING;
    case RequestStatus.REJECTED:
      return RequestStatus_String.REJECTED;
    case RequestStatus.CANCELLED:
      return RequestStatus_String.CANCELLED;
    case RequestStatus.ACCEPTED:
      return RequestStatus_String.ACCEPTED;
    default :
      return ""
  }
};

module.exports = {Constants, RequestStatus_String, RequestStatus, getStatusString};