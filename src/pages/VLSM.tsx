import { useState } from "react";
import { GitBranch, Calculator, Plus, Trash2 } from "lucide-react";

import { calculateSubnets } from "../utils/subnetCalculator";
import type { CalculationResult } from "../types/subnet";

import VLSMResults from "../components/VLSMResults";

import "../css/VLSM.css";

interface SubnetRequirement {
  id: number;
  name: string;
  hosts: string;
}

function maskToCidr(mask: string): number {
  const octets = mask.trim().split(".");

  if (octets.length !== 4) {
    throw new Error("Please enter a valid subnet mask.");
  }

  const numbers = octets.map(Number);

  if (
    numbers.some(
      (value, index) =>
        !/^\d+$/.test(octets[index]) || value < 0 || value > 255,
    )
  ) {
    throw new Error("Please enter a valid subnet mask.");
  }

  const binary = numbers
    .map((octet) => octet.toString(2).padStart(8, "0"))
    .join("");

  if (!/^1*0*$/.test(binary)) {
    throw new Error("Subnet mask must contain consecutive 1s followed by 0s.");
  }

  const cidr = binary.indexOf("0");

  return cidr === -1 ? 32 : cidr;
}

function validateIPv4(ip: string): void {
  const octets = ip.trim().split(".");

  if (octets.length !== 4) {
    throw new Error("Please enter a valid IPv4 network address.");
  }

  const valid = octets.every(
    (octet) =>
      /^\d+$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255,
  );

  if (!valid) {
    throw new Error("Please enter a valid IPv4 network address.");
  }
}

function VLSM() {
  const [network, setNetwork] = useState("192.168.10.0");
  const [subnetMask, setSubnetMask] = useState("255.255.255.0");

  const [requirements, setRequirements] = useState<SubnetRequirement[]>([
    { id: 1, name: "LAN1", hosts: "50" },
    { id: 2, name: "LAN2", hosts: "25" },
  ]);

  const [nextId, setNextId] = useState(3);

  const [results, setResults] = useState<CalculationResult | null>(null);

  const [resultNames, setResultNames] = useState<string[]>([]);
  const [error, setError] = useState("");

  function updateRequirement(
    id: number,
    field: "name" | "hosts",
    value: string,
  ) {
    setRequirements((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addSubnet() {
    setRequirements((current) => [
      ...current,
      {
        id: nextId,
        name: `LAN${nextId}`,
        hosts: "",
      },
    ]);

    setNextId((current) => current + 1);
    setResults(null);
    setResultNames([]);
    setError("");
  }

  function removeSubnet(id: number) {
    setRequirements((current) => current.filter((item) => item.id !== id));

    setResults(null);
    setResultNames([]);
    setError("");
  }

  function handleCalculate() {
    try {
      const cleanNetwork = network.trim();
      const cleanMask = subnetMask.trim();

      if (!cleanNetwork) {
        throw new Error("Please enter a network address.");
      }

      validateIPv4(cleanNetwork);

      if (!cleanMask) {
        throw new Error("Please enter an original subnet mask.");
      }

      const baseCidr = maskToCidr(cleanMask);

      if (baseCidr < 1 || baseCidr > 30) {
        throw new Error("Please use a subnet mask from /1 to /30 for VLSM.");
      }

      if (requirements.length === 0) {
        throw new Error("Please add at least one subnet requirement.");
      }

      const preparedRequirements = requirements.map((item) => {
        const name = item.name.trim();
        const hostsText = item.hosts.trim();

        if (!name) {
          throw new Error("Please enter a name for every LAN.");
        }

        if (!hostsText) {
          throw new Error(`Please enter the required hosts for ${name}.`);
        }

        const hosts = Number(hostsText);

        if (!Number.isSafeInteger(hosts) || hosts <= 0) {
          throw new Error(
            `Required hosts for ${name} must be a positive whole number.`,
          );
        }

        return {
          id: item.id,
          name,
          hosts,
        };
      });

      // VLSM allocates the largest host requirement first.
      const sortedRequirements = [...preparedRequirements].sort(
        (a, b) => b.hosts - a.hosts,
      );

      const calculated = calculateSubnets(
        `${cleanNetwork}/${baseCidr}`,
        sortedRequirements.map((item) => item.hosts),
        "hosts",
      );

      if (calculated.subnets.length !== sortedRequirements.length) {
        throw new Error(
          "Not all LAN requirements were allocated. Try a larger network.",
        );
      }

      setResults(calculated);
      setResultNames(sortedRequirements.map((item) => item.name));
      setError("");
    } catch (err) {
      setResults(null);
      setResultNames([]);

      setError(
        err instanceof Error ? err.message : "Unable to calculate VLSM.",
      );
    }
  }

  return (
    <>
      <div className="page-top">
        <div className="page-heading">
          <div className="heading-icon">
            <GitBranch size={23} />
          </div>

          <div>
            <h1>VLSM Calculator</h1>
            <p>Calculate variable-length subnet masks for multiple networks.</p>
          </div>
        </div>

        <div className="mode-tabs">
          <button type="button" className="active" disabled>
            Variable Length Subnetting
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>ⓘ</span>
          {error}
        </div>
      )}

      <div className="calculator-card vlsm-calculator-card">
        <section className="vlsm-form">
          <div className="vlsm-section-heading">
            <div>
              <h2>Network Configuration</h2>
              <p>Enter your network address and original subnet mask.</p>
            </div>
          </div>

          <div className="vlsm-fields">
            <div className="vlsm-field">
              <label htmlFor="vlsm-network">Network Address</label>

              <input
                id="vlsm-network"
                type="text"
                value={network}
                onChange={(event) => {
                  setNetwork(event.target.value);
                  setResults(null);
                }}
                placeholder="192.168.10.0"
              />
            </div>

            <div className="vlsm-field">
              <label htmlFor="vlsm-mask">Original Subnet Mask</label>

              <input
                id="vlsm-mask"
                type="text"
                value={subnetMask}
                onChange={(event) => {
                  setSubnetMask(event.target.value);
                  setResults(null);
                }}
                placeholder="255.255.255.0"
              />
            </div>
          </div>

          <div className="vlsm-requirements">
            <div className="vlsm-section-heading">
              <div>
                <h2>Subnet Requirements</h2>
                <p>Add each LAN and its required number of hosts.</p>
              </div>
            </div>

            <div className="vlsm-requirement-list">
              {requirements.map((item) => (
                <div className="vlsm-requirement-row" key={item.id}>
                  <input
                    type="text"
                    aria-label={`LAN ${item.id} name`}
                    value={item.name}
                    onChange={(event) =>
                      updateRequirement(item.id, "name", event.target.value)
                    }
                    placeholder="LAN name"
                  />

                  <input
                    type="number"
                    min="1"
                    aria-label={`Required hosts for ${item.name}`}
                    value={item.hosts}
                    onChange={(event) =>
                      updateRequirement(item.id, "hosts", event.target.value)
                    }
                    placeholder="Required hosts"
                  />

                  <button
                    type="button"
                    className="vlsm-delete-button"
                    onClick={() => removeSubnet(item.id)}
                    aria-label={`Remove ${item.name}`}
                    title="Remove subnet"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="vlsm-add-button"
              onClick={addSubnet}
            >
              <Plus size={18} />
              Add Subnet
            </button>
          </div>

          <div className="vlsm-form-actions">
            <button
              type="button"
              className="vlsm-calculate-button"
              onClick={handleCalculate}
            >
              <Calculator size={18} />
              Calculate VLSM
            </button>
          </div>
        </section>

        <VLSMResults
          results={results}
          subnetNames={resultNames}
          originalCidr={maskToCidr(subnetMask)}
        />
      </div>
    </>
  );
}

export default VLSM;
