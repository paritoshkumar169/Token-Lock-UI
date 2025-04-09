export enum PermissionType {
  NONE = 0,
  RECIPIENT = 1,
  CREATOR = 2,
  BOTH = 3,
}

export type LockFormData = {
  title: string;
  amount: number;
  recipientAddress: string;
  cancelPermission: PermissionType;
  changeRecipientPermission: PermissionType;
  releaseTime: string;
  lockDuration: number;
}
