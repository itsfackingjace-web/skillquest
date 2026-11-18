let cb=null;export const getAuth=()=>({});export const getRedirectResult=async()=>null;
export function onAuthStateChanged(a,f){cb=f;setTimeout(()=>f(window.__fakeUser||null),300);return()=>{}}
export class GoogleAuthProvider{setCustomParameters(){}}
export async function signInWithPopup(){window.__fakeUser={uid:window.__uid||'me',displayName:(window.__uid||'me')+' Test'};cb(window.__fakeUser)}
export const signInWithRedirect=signInWithPopup;export async function signOut(){cb(null)}
