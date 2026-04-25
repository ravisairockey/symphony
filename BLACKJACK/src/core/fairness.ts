export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateClientSeed(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function generateServerSeed(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createFairnessRound(nonce: number): Promise<{
  clientSeed: string;
  serverSeed: string;
  serverSeedHash: string;
}> {
  const clientSeed = generateClientSeed();
  const serverSeed = generateServerSeed();
  const serverSeedHash = await sha256(serverSeed);
  return { clientSeed, serverSeed, serverSeedHash };
}

export function combineSeeds(clientSeed: string, serverSeed: string, nonce: number): string {
  return `${clientSeed}:${serverSeed}:${nonce}`;
}
