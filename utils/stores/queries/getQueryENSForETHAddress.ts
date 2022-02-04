import { gql } from 'graphql-request'

export function getQueryENSForETHAddress(ensAddress: string) {
  return gql`
    {
      domains(first: 1, where:{name:"${ensAddress.toLowerCase()}"}) {
        name
        labelName
        owner {
          id
          domains {
            id
          }
        }
      }
    }`
}

export function getQueryENSForETHAddressByLabelName(ensAddress: string) {
  return gql`
    {
      domains(first: 1, where:{labelName:"${ensAddress.toLowerCase()}"}) {
        name
        labelName
        owner {
          id
          domains {
            id
          }
        }
      }
    }`
}