export interface UuidInitMessageModel{
  uuid: string;
}
export interface InitWsMessageModel{
  connection: string;
  you_are: string;
}
export interface ClerkPatientWsMsgModel{
  user_a: string|undefined;
  user_b: string|undefined;
}
