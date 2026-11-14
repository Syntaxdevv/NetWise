import { useState } from "react";
import "../css/IPv4Calculator.css";

interface IPv4Result {
  address: string;
  cidr: number;
  subnetMask: string;
  borrowedBits: number;
  magicNumber: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    throw new Error("Invalid IPv4 address.");
  }

  let result = 0;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      throw new Error("Invalid IPv4 address.");
    }

    const value = Number(part);

    if (value < 0 || value > 255) {
      throw new Error("Each IPv4 octet must be between 0 and 255.");
    }

    result = result * 256 + value;
  }

  return result;
}

function numberToIp(number: number): string {
  return [
    Math.floor(number / 16777216) % 256,
    Math.floor(number / 65536) % 256,
    Math.floor(number / 256) % 256,
    number % 256,
  ].join(".");
}

function getDefaultClassCidr(firstOctet: number): number {
  if (firstOctet >= 1 && firstOctet <= 127) return 8;
  if (firstOctet >= 128 && firstOctet <= 191) return 16;
  if (firstOctet >= 192 && firstOctet <= 223) return 24;

  throw new Error(
    "Borrowed bits are not applicable to Class D or Class E addresses.",
  );
}

function calculateIPv4(input: string): IPv4Result {
  const parts = input.trim().split("/");

  if (parts.length !== 2) {
    throw new Error("Enter an IPv4 address with CIDR, e.g. 192.168.10.25/24.");
  }

  const address = parts[0].trim();
  const cidrText = parts[1].trim();

  if (!/^\d+$/.test(cidrText)) {
    throw new Error("CIDR must be a number from 0 to 32.");
  }

  const cidr = Number(cidrText);

  if (cidr < 0 || cidr > 32) {
    throw new Error("CIDR must be between 0 and 32.");
  }

  const ipNumber = ipToNumber(address);
  const firstOctet = Number(address.split(".")[0]);

  const defaultCidr = getDefaultClassCidr(firstOctet);

  const borrowedBits = Math.max(0, cidr - defaultCidr);

  const totalAddresses = Math.pow(2, 32 - cidr);
  const blockSize = totalAddresses;

  const networkNumber = Math.floor(ipNumber / blockSize) * blockSize;

  const broadcastNumber = networkNumber + blockSize - 1;

  const maskNumber = cidr === 0 ? 0 : 4294967296 - Math.pow(2, 32 - cidr);

  const subnetMask = numberToIp(maskNumber);

  const maskOctets = subnetMask.split(".").map(Number);

  const interestingOctet = maskOctets.find((octet) => octet !== 255);

  const magicNumber =
    interestingOctet === undefined ? 1 : 256 - interestingOctet;

  let firstHost = "";
  let lastHost = "";
  let usableHosts = 0;

  if (cidr <= 30) {
    firstHost = numberToIp(networkNumber + 1);
    lastHost = numberToIp(broadcastNumber - 1);
    usableHosts = totalAddresses - 2;
  } else if (cidr === 31) {
    firstHost = numberToIp(networkNumber);
    lastHost = numberToIp(broadcastNumber);
    usableHosts = 2;
  } else {
    firstHost = address;
    lastHost = address;
    usableHosts = 1;
  }

  return {
    address,
    cidr,
    subnetMask,
    borrowedBits,
    magicNumber,
    networkAddress: numberToIp(networkNumber),
    broadcastAddress: numberToIp(broadcastNumber),
    firstHost,
    lastHost,
    totalAddresses,
    usableHosts,
  };
}

function IPv4Calculator() {
  const [input, setInput] = useState("192.168.10.25/24");
  const [result, setResult] = useState<IPv4Result | null>(null);
  const [error, setError] = useState("");

  function handleCalculate() {
    try {
      const calculated = calculateIPv4(input);

      setResult(calculated);
      setError("");
    } catch (err) {
      setResult(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate IPv4 address.",
      );
    }
  }

  function handleReset() {
    setInput("");
    setResult(null);
    setError("");
  }

  return (
    <div className="ipv4-calculator">
      <section className="ipv4-form">
        <div className="panel-heading">
          <span className="section-number">01</span>

          <div>
            <h2>IPv4 Configuration</h2>
            <p>Enter an IPv4 address with CIDR notation.</p>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="ipv4-address">IPv4 Address / CIDR</label>

          <input
            id="ipv4-address"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCalculate();
              }
            }}
            placeholder="192.168.10.25/24"
          />
        </div>

        {error && (
          <div className="error-message">
            <span>ⓘ</span>
            {error}
          </div>
        )}

        <div className="ipv4-actions">
          <button
            className="calculate-button"
            type="button"
            onClick={handleCalculate}
          >
            Calculate IPv4
            <span>→</span>
          </button>

          <button
            className="ipv4-reset-button"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className="form-note">
          <span>ⓘ</span>
          Example: 192.168.10.25/24
        </div>
      </section>

      <section className="ipv4-results">
        <div className="results-heading">
          <h2>IPv4 Results</h2>
          <p>Calculated address and network information.</p>
        </div>

        {!result ? (
          <div className="empty-results">
            <div className="empty-icon">⌘</div>
            <h3>No results yet</h3>
            <p>Enter your IPv4 address and CIDR to calculate.</p>
          </div>
        ) : (
          <>
            <div className="ipv4-cidr-card">
              <span>IPv4 Address / CIDR</span>
              <strong>
                {result.address}/{result.cidr}
              </strong>
            </div>

            <div className="ipv4-summary-grid">
              <div className="summary-card">
                <span>Network Address</span>
                <strong>{result.networkAddress}</strong>
              </div>

              <div className="summary-card">
                <span>Broadcast Address</span>
                <strong>{result.broadcastAddress}</strong>
              </div>

              <div className="summary-card">
                <span>Subnet Mask</span>
                <strong>{result.subnetMask}</strong>
              </div>

              <div className="summary-card">
                <span>Borrowed Bits</span>
                <strong>{result.borrowedBits} bits</strong>
              </div>

              <div className="summary-card">
                <span>Magic Number</span>
                <strong>{result.magicNumber}</strong>
              </div>

              <div className="summary-card">
                <span>First Usable Host</span>
                <strong>{result.firstHost}</strong>
              </div>

              <div className="summary-card">
                <span>Last Usable Host</span>
                <strong>{result.lastHost}</strong>
              </div>

              <div className="summary-card">
                <span>Total IP Addresses</span>
                <strong>{result.totalAddresses.toLocaleString()}</strong>
              </div>

              <div className="summary-card">
                <span>Usable Hosts</span>
                <strong>{result.usableHosts.toLocaleString()}</strong>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default IPv4Calculator;
