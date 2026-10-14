const AUTH_CONFIG = Object.freeze({passwordSalt:'skos-2026-8f4c2e91a7d35b60',passwordHash:'uBtrpupp4No87eVLhu7lvkvzBt/qY8e7hPn3r938thM=',authVersion:'A001_ONLY_V1',sessionPrefix:'APP_SESSION_',sessionSeconds:21600,maxAttempts:5,lockoutSeconds:600});

/** Validates the shared password, throttles failures, and returns one bootstrap payload. */
function authenticateWithPassword(password) {
  const cache=CacheService.getScriptCache(),attemptKey='AUTH_FAILURES',attempts=Number(cache.get(attemptKey)||0);
  const submitted=String(password||''),matchesPassword=constantTimeEquals_(hashPassword_(submitted,AUTH_CONFIG.passwordSalt),AUTH_CONFIG.passwordHash);
  if(!matchesPassword){if(attempts>=AUTH_CONFIG.maxAttempts)throw new Error('Terlalu banyak percubaan. Cuba semula selepas 10 minit.');cache.put(attemptKey,String(attempts+1),AUTH_CONFIG.lockoutSeconds);throw new Error('Kata laluan tidak sah.');}
  cache.remove(attemptKey);
  const token=Utilities.getUuid()+Utilities.getUuid();
  cache.put(AUTH_CONFIG.sessionPrefix+hashToken_(token),JSON.stringify({createdAt:new Date().toISOString(),authVersion:getAuthVersion_()}),AUTH_CONFIG.sessionSeconds);
  return {token:token,data:getBootstrapData_()};
}

/** Rejects protected server calls without a live application session. */
function requireAppSession_(token) {
  if(!token) throw new Error('Sesi telah tamat. Sila log masuk semula.');
  const cache=CacheService.getScriptCache(),key=AUTH_CONFIG.sessionPrefix+hashToken_(String(token)),session=cache.get(key);
  if(!session) throw new Error('Sesi telah tamat. Sila log masuk semula.');
  const parsed=JSON.parse(session),currentVersion=getAuthVersion_();
  if(parsed.authVersion!==currentVersion){cache.remove(key);throw new Error('Sesi telah tamat. Sila log masuk semula.');}
  cache.put(key,session,AUTH_CONFIG.sessionSeconds);
  return parsed;
}

function logoutAppSession(token){if(token)CacheService.getScriptCache().remove(AUTH_CONFIG.sessionPrefix+hashToken_(String(token)));return {success:true};}
function getAuthVersion_(){return AUTH_CONFIG.authVersion;}
function hashPassword_(password,salt){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+password,Utilities.Charset.UTF_8));}
function hashToken_(token){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,token,Utilities.Charset.UTF_8)).replace(/=+$/g,'');}
function constantTimeEquals_(left,right){if(left.length!==right.length)return false;let difference=0;for(let index=0;index<left.length;index+=1)difference|=left.charCodeAt(index)^right.charCodeAt(index);return difference===0;}
