export async function sleepAsync(ms: number, callback?: ()=>void): Promise<void>{
  return new Promise(resolve=> setTimeout(()=>{
    if(callback){
      callback();
    }
    resolve();
  }, ms));
}
export const API_PREFIX: string= '/api/v1';
export const INIT_WS_MSG_CP: string= 'initialize conversation zz00zz';
