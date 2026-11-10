
import { useState } from "react";
import "../css/ExtraCalculator.css";
import "../css/CalculatorShared.css";
import "../css/CIDRCalculator.css";
import {
  Binary,
  Network,
  Calculator,
  Info,
  Hash,
} from "lucide-react";

interface CIDRResult {
  prefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkBits: number;
  hostBits: number;
  totalAddresses: string;
  usableHosts: string;
}

function CIDRCalculator() {
  const [input, setInput] = useState("24");
  const [result, setResult] = useState<CIDRResult | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    try {
      const value = input.trim();

      // Accept both 24 and /24
      if (!/^\/?\d+$/.test(value)) {
        throw new Error(
          "Enter a valid CIDR prefix, e.g. 24 or /24."
        );
      }

      const prefix = Number(value.replace("/", ""));

      if (prefix < 0 || prefix > 32) {
        throw new Error("CIDR prefix must be between 0 and 32.");
      }

      const mask =
        prefix === 0
          ? 0
          : (0xffffffff << (32 - prefix)) >>> 0;

      const wildcard = (~mask) >>> 0;

      const toIP = (value: number) =>
        [
          (value >>> 24) & 255,
          (value >>> 16) & 255,
          (value >>> 8) & 255,
          value & 255,
        ].join(".");

      const hostBits = 32 - prefix;
      const totalAddresses = 2 ** hostBits;

      const usableHosts =
        prefix === 32
          ? 1
          : prefix === 31
            ? 2
            : Math.max(0, totalAddresses - 2);

      setResult({
        prefix,
        subnetMask: toIP(mask),
        wildcardMask: toIP(wildcard),
        networkBits: prefix,
        hostBits,
        totalAddresses: totalAddresses.toLocaleString(),
        usableHosts: usableHosts.toLocaleString(),
      });

      setError("");
    } catch (err) {
      setResult(null);
      setError(
        err instanceof Error
          ? err.message
          : "Calculation failed."
      );
    }
  }

  return (
    <div className="extra-calculator">
      <div className="extra-calculator-heading">
        <div>
          <h2>
            <Binary
              size={22}
              style={{
                marginRight: "9px",
                color: "#2563eb",
                verticalAlign: "middle",
              }}
            />
            CIDR Calculator
          </h2>

          <p>
            Calculate subnet mask, wildcard mask, network bits,
            host bits, and address capacity using CIDR prefix.
          </p>
        </div>
      </div>

      <div className="extra-calculator-form">
        <label htmlFor="cidr-input">
          <Hash
            size={16}
            style={{
              marginRight: "6px",
              verticalAlign: "middle",
            }}
          />
          CIDR Prefix
        </label>

        <input
          id="cidr-input"
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") calculate();
          }}
          placeholder="Enter CIDR, e.g. 24"
        />

        <button type="button" onClick={calculate}>
          <Calculator
            size={16}
            style={{
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          Calculate CIDR →
        </button>
      </div>

      <div className="form-note">
        <Info size={15} />
        Enter only a CIDR prefix from 0 to 32. Example: /24.
      </div>

      {error && (
        <div className="extra-error">
          {error}
        </div>
      )}

      {result && (
        <div className="extra-results">
          <h3 className="cidr-results-heading">
            <Network size={19} />
            CIDR Information
          </h3>

          <div className="extra-results-grid">
            <Result
              label="CIDR Prefix"
              value={`/${result.prefix}`}
            />

            <Result
              label="Subnet Mask"
              value={result.subnetMask}
            />

            <Result
              label="Wildcard Mask"
              value={result.wildcardMask}
            />

            <Result
              label="Network Bits"
              value={`${result.networkBits} bits`}
            />

            <Result
              label="Host Bits"
              value={`${result.hostBits} bits`}
            />

            <Result
              label="Total Addresses"
              value={result.totalAddresses}
            />

            <Result
              label="Usable Hosts"
              value={result.usableHosts}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Result({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="extra-result-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default CIDRCalculator;
