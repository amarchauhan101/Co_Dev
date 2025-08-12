// utils/decodeJWT.js
export function decodeJWT(token) {
  try {
    const base64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload;
  } catch (e) {
    console.error("JWT decode error", e);
    return null;
  }
}
