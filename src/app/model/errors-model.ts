export const StrResponseWarning: string= 'ResponseWarning';
export interface ResponseWarning{
  type: 'ResponseWarning';
  data: {
    details: string|undefined;
  };
}
