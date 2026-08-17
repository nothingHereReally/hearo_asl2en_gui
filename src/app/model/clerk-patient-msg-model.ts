export interface UuidMessageModel{
  uuid: string;
}
export interface ClerkPatientMsgModel{
  user_a: string|undefined;
  user_b: string|undefined;
}


export const StrConnectWsEasyMsg: string= 'ConnectWsEasyMsg';
export const UserA: string= 'user_a';
export const UserB: string= 'user_b';
export interface ConnectWsEasyMsg{
  type: 'ConnectWsEasyMsg';
  data: {
    connection: string;
    you_are: 'user_a'|'user_b';
  };
}
export const StrWsEasyMsgUserA: string= 'WsEasyMsgUserA';
export interface WsEasyMsgUserA{
  type: 'WsEasyMsgUserA';
  data: {
    user_a: string
  };
}
export const StrWsEasyMsgUserB: string= 'WsEasyMsgUserB';
export interface WsEasyMsgUserB{
  type: 'WsEasyMsgUserB';
  data: {
    user_b: string
  };
}
