import { GitBranch } from "lucide-react";
import type { CalculationResult } from "../types/subnet";

interface Props {
  results: CalculationResult | null;
  subnetNames: string[];
  originalCidr: number;
}

function getMagicNumber(subnetMask: string): number {
  const octets = subnetMask.split(".").map(Number);

  const interestingOctet = octets.find((octet) => octet !== 255);

  if (interestingOctet === undefined) {
    return 0;
  }

  return 256 - interestingOctet;
}

function VLSMResults({ results, subnetNames, originalCidr }: Props) {
  if (!results || results.subnets.length === 0) {
    return (
      <section className="vlsm-empty-state">
        <div className="vlsm-empty-icon">
          <GitBranch size={25} strokeWidth={1.8} />
        </div>

        <h3>No VLSM Results Yet</h3>

        <p>
          Your subnet allocation results will appear here after you calculate
          your VLSM.
        </p>

        <span className="vlsm-empty-hint">
          Configure your network and add subnet requirements to get started.
        </span>
      </section>
    );
  }

  return (
    <section className="vlsm-results">
      <div className="vlsm-results-heading">
        <div>
          <h2>VLSM Results</h2>
          <p>Individual subnet allocation results.</p>
        </div>

        <span className="vlsm-results-count">
          {results.subnets.length} Subnets Allocated
        </span>
      </div>

      <div className="vlsm-result-list">
        {results.subnets.map((subnet, index) => {
          const borrowedBits = subnet.cidr - originalCidr;
          const magicNumber = getMagicNumber(subnet.subnetMask);

          return (
            <div
              className="vlsm-result-card"
              key={`${subnet.networkAddress}-${index}`}
            >
              <div className="vlsm-result-card-heading">
                <h3>
                  {subnetNames[index] || `LAN${index + 1}`}
                  <span> ({subnet.requiredHosts} hosts needed)</span>
                </h3>

                <span>Subnet {index + 1}</span>
              </div>

              <div className="vlsm-result-details">
                <div className="vlsm-result-item">
                  <label>Network Address</label>
                  <strong>{subnet.networkAddress}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Borrowed Bits</label>
                  <strong>{borrowedBits} bits</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Subnet Mask</label>
                  <strong>{subnet.subnetMask}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Magic Number</label>
                  <strong>{magicNumber}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>First Host</label>
                  <strong>{subnet.firstHost}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Last Host</label>
                  <strong>{subnet.lastHost}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Broadcast Address</label>
                  <strong>{subnet.broadcastAddress}</strong>
                </div>

                <div className="vlsm-result-item">
                  <label>Total Usable Hosts</label>
                  <strong>{subnet.usableHosts}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default VLSMResults;
