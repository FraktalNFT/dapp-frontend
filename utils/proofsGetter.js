import proofs from './merkleTreeProofs.json'

export function getProofs(address){
    const addr = String(address).toLowerCase();
    return proofs[addr];
}