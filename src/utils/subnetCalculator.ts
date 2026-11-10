import type {
  CalculationMode,
  CalculationResult,
  SubnetRow,
} from "../types/subnet";

function ipToNumber(ip: string): number {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    throw new Error("Invalid IPv4 address.");
  }

  const octets = parts.map(Number);

  if (
    parts.some((part) => !/^\d+$/.test(part)) ||
    octets.some(
      (part) =>
        !Number.isInteger(part) ||
        part < 0 ||
        part > 255
    )
  ) {
    throw new Error("Invalid IPv4 address.");
  }

  return (
    octets[0] * 16777216 +
    octets[1] * 65536 +
    octets[2] * 256 +
    octets[3]
  );
}

function numberToIp(value: number): string {
  return [
    Math.floor(value / 16777216) % 256,
    Math.floor(value / 65536) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join(".");
}

function getSubnetMask(prefix: number): string {
  const mask =
    prefix === 0
      ? 0
      : (0xffffffff << (32 - prefix)) >>> 0;

  return numberToIp(mask);
}

function getUsableHosts(prefix: number): number {
  const hostBits = 32 - prefix;

  return hostBits >= 2 ? 2 ** hostBits - 2 : 0;
}

function getHostPrefix(hosts: number): number {
  if (!Number.isSafeInteger(hosts) || hosts < 1) {
    throw new Error(
      "Host requirements must be positive whole numbers."
    );
  }

  let hostBits = 2;

  while (2 ** hostBits - 2 < hosts) {
    hostBits++;
  }

  return 32 - hostBits;
}

function getClassInfo(ip: string) {
  const firstOctet = Number(ip.split(".")[0]);

  if (firstOctet >= 1 && firstOctet <= 126) {
    return { name: "Class A", defaultPrefix: 8 };
  }

  if (firstOctet >= 128 && firstOctet <= 191) {
    return { name: "Class B", defaultPrefix: 16 };
  }

  if (firstOctet >= 192 && firstOctet <= 223) {
    return { name: "Class C", defaultPrefix: 24 };
  }

  throw new Error(
    "Regular subnetting supports Class A, B, and C addresses only."
  );
}

function createSubnetRow(
  network: number,
  prefix: number,
  requiredHosts?: number
): SubnetRow {
  const blockSize = 2 ** (32 - prefix);
  const broadcast = network + blockSize - 1;
  const usableHosts = getUsableHosts(prefix);

  return {
    networkAddress: numberToIp(network),
    subnetMask: getSubnetMask(prefix),
    cidr: prefix,
    firstHost:
      usableHosts > 0
        ? numberToIp(network + 1)
        : "N/A",
    lastHost:
      usableHosts > 0
        ? numberToIp(broadcast - 1)
        : "N/A",
    broadcastAddress: numberToIp(broadcast),
    totalAddresses: blockSize,
    usableHosts,
    requiredHosts,
  };
}

export function calculateSubnets(
  baseNetwork: string,
  required: number | number[],
  mode: CalculationMode
): CalculationResult {
  const parts = baseNetwork.trim().split("/");

  if (parts.length !== 2) {
    throw new Error(
      "Enter a valid network with CIDR, e.g. 192.168.10.0/24."
    );
  }

  const ipNumber = ipToNumber(parts[0]);
  const basePrefix = Number(parts[1]);

  if (
    !Number.isInteger(basePrefix) ||
    basePrefix < 0 ||
    basePrefix > 32
  ) {
    throw new Error("Invalid CIDR prefix.");
  }

  const baseBlockSize = 2 ** (32 - basePrefix);

  const networkNumber =
    Math.floor(ipNumber / baseBlockSize) * baseBlockSize;

  const networkEnd = networkNumber + baseBlockSize;

  const subnets: SubnetRow[] = [];

  let newPrefix: number;
  let requiredBits: number;
  let totalSubnets: number;
  let networksRequired: number | undefined;

  if (mode === "regular") {
    const classInfo = getClassInfo(parts[0]);

    if (basePrefix < classInfo.defaultPrefix) {
      throw new Error(
        `Class ${classInfo.name.slice(-1)} requires a prefix of /${classInfo.defaultPrefix} or higher for subnetting.`
      );
    }

    newPrefix = basePrefix;

    const borrowedBits =
      newPrefix - classInfo.defaultPrefix;

    requiredBits = 32 - newPrefix;
    totalSubnets = 2 ** borrowedBits;

    const blockSize = 2 ** (32 - newPrefix);

    for (let i = 0; i < totalSubnets; i++) {
      const currentNetwork =
        networkNumber + i * blockSize;

      subnets.push(
        createSubnetRow(currentNetwork, newPrefix)
      );
    }
  } else if (mode === "hosts") {
    const hostRequirements = Array.isArray(required)
      ? required
      : [required];

    if (hostRequirements.length === 0) {
      throw new Error("Enter at least one host requirement.");
    }

    if (
      hostRequirements.some(
        (host) =>
          !Number.isSafeInteger(host) || host < 1
      )
    ) {
      throw new Error(
        "All host requirements must be positive whole numbers."
      );
    }

    const sortedHosts = [...hostRequirements].sort(
      (a, b) => b - a
    );

    let currentNetwork = networkNumber;

    for (const hosts of sortedHosts) {
      const prefix = getHostPrefix(hosts);
      const blockSize = 2 ** (32 - prefix);

      currentNetwork =
        Math.ceil(currentNetwork / blockSize) * blockSize;

      if (currentNetwork + blockSize > networkEnd) {
        throw new Error(
          `Not enough address space for ${hosts} hosts. Try a larger base network.`
        );
      }

      subnets.push(
        createSubnetRow(currentNetwork, prefix, hosts)
      );

      currentNetwork += blockSize;
    }

    newPrefix = subnets[0].cidr;
    requiredBits = 32 - newPrefix;
    totalSubnets = subnets.length;
  } else {
    const value = Array.isArray(required)
      ? required[0]
      : required;

    if (!Number.isSafeInteger(value) || value < 1) {
      throw new Error(
        "Required value must be a positive whole number."
      );
    }

    networksRequired = value;

    const networkBits = Math.ceil(Math.log2(value));

    newPrefix = basePrefix + networkBits;

    if (newPrefix > 32) {
      throw new Error(
        "The requested number of networks cannot fit in this base network."
      );
    }

    requiredBits = 32 - newPrefix;

    const blockSize = 2 ** requiredBits;

    totalSubnets = 2 ** (newPrefix - basePrefix);

    const maxRows = 256;

    const displayedSubnets = Math.min(
      totalSubnets,
      maxRows
    );

    for (let i = 0; i < displayedSubnets; i++) {
      const currentNetwork =
        networkNumber + i * blockSize;

      subnets.push(
        createSubnetRow(currentNetwork, newPrefix)
      );
    }
  }

  const firstSubnet = subnets[0];

  const totalAddresses = subnets.reduce(
    (sum, subnet) => sum + subnet.totalAddresses,
    0
  );

  const totalUsableHosts = subnets.reduce(
    (sum, subnet) => sum + subnet.usableHosts,
    0
  );

  return {
    mode,
    baseNetwork: numberToIp(networkNumber),
    baseCidr: basePrefix,
    requiredBits,
    newSubnetMask: firstSubnet.subnetMask,
    newCidr: newPrefix,
    blockSize: firstSubnet.totalAddresses,
    subnetsAvailable: totalSubnets,
    networksRequired,
    usableHostsPerSubnet: firstSubnet.usableHosts,
    totalAddresses,
    totalUsableHosts,
    subnets,
    truncated: mode !== "hosts" && totalSubnets > 256,
  };
}