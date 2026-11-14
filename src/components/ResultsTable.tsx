import type { CalculationResult } from "../types/subnet";
import "../css/ResultsTable.css";

interface Props {
  results: CalculationResult | null;
}

function getIpClass(ip: string): {
  name: string;
  defaultPrefix: number;
} {
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

  if (firstOctet >= 224 && firstOctet <= 239) {
    return { name: "Class D", defaultPrefix: 0 };
  }

  return { name: "Class E", defaultPrefix: 0 };
}

function getMagicNumber(mask: string): number {
  const octets = mask.split(".").map(Number);

  const partialOctet = octets.find((octet) => octet !== 255 && octet !== 0);

  return partialOctet === undefined ? 256 : 256 - partialOctet;
}

function getValidSubnets(
  subnets: CalculationResult["subnets"],
  prefix: number,
): string {
  const octetIndex = Math.min(Math.floor(prefix / 8), 3);

  return subnets
    .map((subnet) => {
      return subnet.networkAddress.split(".")[octetIndex];
    })
    .join(", ");
}

function ResultsTable({ results }: Props) {
  if (!results) {
    return (
      <section className="results-section">
        <div className="results-heading">
          <h2>Subnet Results</h2>
          <p>Your calculated network information.</p>
        </div>

        <div className="empty-results">
          <span className="empty-icon">⌘</span>
          <h3>No results yet</h3>
          <p>Enter your network details and calculate.</p>
        </div>
      </section>
    );
  }

  const isRegular = results.mode === "regular";
  const isHosts = results.mode === "hosts";

  const ipClass = getIpClass(results.baseNetwork);

  const borrowedBits = results.newCidr - ipClass.defaultPrefix;

  const magicNumber = getMagicNumber(results.newSubnetMask);

  const validSubnets = getValidSubnets(results.subnets, results.newCidr);

  return (
    <section className="results-section">
      <div className="results-heading">
        <h2>Subnet Results</h2>
        <p>Your calculated network information.</p>
      </div>

      {isRegular ? (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Class Address</span>
              <strong>{ipClass.name}</strong>
            </div>

            <div className="summary-card">
              <span>Borrowed Bits</span>
              <strong>{borrowedBits}</strong>
            </div>

            <div className="summary-card">
              <span>Subnet Mask</span>
              <strong>{results.newSubnetMask}</strong>
            </div>

            <div className="summary-card">
              <span>Magic Number</span>
              <strong>{magicNumber}</strong>
            </div>

            <div className="summary-card">
              <span>Total Number of Subnets</span>
              <strong>{results.subnetsAvailable.toLocaleString()}</strong>
            </div>

            <div className="summary-card">
              <span>Total Number of Hosts</span>
              <strong>{results.blockSize.toLocaleString()}</strong>
            </div>

            <div className="summary-card">
              <span>Total Usable Hosts/Subnet</span>
              <strong>{results.usableHostsPerSubnet.toLocaleString()}</strong>
            </div>

            <div className="summary-card">
              <span>Valid Subnet</span>
              <strong className="valid-subnet-values">
                {validSubnets || "N/A"}
              </strong>
            </div>
          </div>

          <div className="table-heading">
            <h3>Table Details</h3>
            <span>
              Showing {results.subnets.length} of {results.subnetsAvailable}{" "}
              subnets
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Valid Subnet</th>
                  <th>First Host</th>
                  <th>Last Host</th>
                  <th>Broadcast Address</th>
                </tr>
              </thead>

              <tbody>
                {results.subnets.map((subnet, index) => (
                  <tr key={`${subnet.networkAddress}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{subnet.networkAddress}</td>
                    <td>{subnet.firstHost}</td>
                    <td>{subnet.lastHost}</td>
                    <td>{subnet.broadcastAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : isHosts ? (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Bits</span>
              <strong>{results.requiredBits}</strong>
            </div>

            <div className="summary-card">
              <span>New Subnet Mask</span>
              <strong>{results.newSubnetMask}</strong>
            </div>

            <div className="summary-card">
              <span>New CIDR</span>
              <strong>/{results.newCidr}</strong>
            </div>

            <div className="summary-card">
              <span>Magic Number</span>
              <strong>{magicNumber}</strong>
            </div>

            <div className="summary-card">
              <span>Total Number of Subnets (inside base)</span>
              <strong>{results.subnetsAvailable.toLocaleString()}</strong>
            </div>

            <div className="summary-card">
              <span>Usable Hosts per Subnet</span>
              <strong>{results.usableHostsPerSubnet.toLocaleString()}</strong>
            </div>
          </div>

          <div className="table-heading">
            <h3>Table Details</h3>
            <span>
              Showing {results.subnets.length} of {results.subnetsAvailable}{" "}
              subnets
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Required Hosts</th>
                  <th>Network Address</th>
                  <th>Subnet Mask</th>
                  <th>CIDR</th>
                  <th>First Host</th>
                  <th>Last Host</th>
                  <th>Broadcast Address</th>
                  <th>Usable Hosts</th>
                </tr>
              </thead>

              <tbody>
                {results.subnets.map((subnet, index) => (
                  <tr key={`${subnet.networkAddress}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{subnet.requiredHosts}</td>
                    <td>{subnet.networkAddress}</td>
                    <td>{subnet.subnetMask}</td>
                    <td>/{subnet.cidr}</td>
                    <td>{subnet.firstHost}</td>
                    <td>{subnet.lastHost}</td>
                    <td>{subnet.broadcastAddress}</td>
                    <td>{subnet.usableHosts.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Borrowed Bits</span>
              <strong>{results.newCidr - results.baseCidr}</strong>
            </div>

            <div className="summary-card">
              <span>New Subnet Mask</span>
              <strong>{results.newSubnetMask}</strong>
            </div>

            <div className="summary-card">
              <span>New CIDR</span>
              <strong>/{results.newCidr}</strong>
            </div>

            <div className="summary-card">
              <span>Magic Number (inc)</span>
              <strong>{magicNumber}</strong>
            </div>

            <div className="summary-card">
              <span>Networks Required</span>
              <strong>
                {results.networksRequired?.toLocaleString() ?? "N/A"}
              </strong>
            </div>

            <div className="summary-card">
              <span>Actual Networks (inside base)</span>
              <strong>{results.subnetsAvailable.toLocaleString()}</strong>
            </div>

            <div className="summary-card">
              <span>Usable Hosts per Subnet</span>
              <strong>{results.usableHostsPerSubnet.toLocaleString()}</strong>
            </div>
          </div>

          <div className="table-heading">
            <h3>Subnet Details</h3>
            <span>
              Showing {results.subnets.length} of {results.subnetsAvailable}{" "}
              subnets
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Network Address</th>
                  <th>Subnet Mask</th>
                  <th>CIDR</th>
                  <th>First Host</th>
                  <th>Last Host</th>
                  <th>Broadcast</th>
                  <th>Usable Hosts</th>
                </tr>
              </thead>

              <tbody>
                {results.subnets.map((subnet, index) => (
                  <tr key={`${subnet.networkAddress}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{subnet.networkAddress}</td>
                    <td>{subnet.subnetMask}</td>
                    <td>/{subnet.cidr}</td>
                    <td>{subnet.firstHost}</td>
                    <td>{subnet.lastHost}</td>
                    <td>{subnet.broadcastAddress}</td>
                    <td>{subnet.usableHosts.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {results.truncated && (
        <p className="table-note">Only the first 256 subnets are displayed.</p>
      )}
    </section>
  );
}

export default ResultsTable;
