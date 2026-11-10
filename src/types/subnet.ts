export type CalculationMode = "regular" | "hosts" | "networks";

export interface SubnetRow {
  networkAddress: string;
  subnetMask: string;
  cidr: number;
  firstHost: string;
  lastHost: string;
  broadcastAddress: string;
  totalAddresses: number;
  usableHosts: number;
  requiredHosts?: number;
}

export interface CalculationResult {
  mode: CalculationMode;
  baseNetwork: string;
  baseCidr: number;
  requiredBits: number;
  newSubnetMask: string;
  newCidr: number;
  blockSize: number;
  subnetsAvailable: number;
  networksRequired?: number;
  usableHostsPerSubnet: number;
  totalAddresses: number;
  totalUsableHosts: number;
  subnets: SubnetRow[];
  truncated: boolean;
}