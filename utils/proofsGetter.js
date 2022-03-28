import proofs from './merkleTreeProofs.json'
import proofs2 from './merkleTreeProofsV2.json'

export function getProofs(address){
    const addr = String(address).toLowerCase();
    return proofs[addr];
}

export function getProofs2(address){
    const addr = String(address).toLowerCase();
    return proofs2[addr];
}