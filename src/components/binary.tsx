import { useState } from "react";
import "../css/ExtraCalculator.css";
import "../css/CalculatorShared.css";
import "../css/Binary.css";

import {
  Binary as BinaryIcon,
  ArrowRightLeft,
  Calculator,
  Info,
  Globe,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface ConversionResult {
  binary: string;
  ipv4: string;
  octets: string[];
}

function BinaryConverter() {
  const [input, setInput] = useState("11000000.10101000.00001010.00011001");

  const [result, setResult] = useState<ConversionResult | null>(null);

  const [error, setError] = useState("");

  function calculate() {
    try {
      const binary = input.trim().replace(/[\s.]/g, "");

      if (!/^[01]+$/.test(binary)) {
        throw new Error("Binary address must contain only 0 and 1.");
      }

      if (binary.length !== 32) {
        throw new Error("Binary IPv4 address must contain exactly 32 bits.");
      }

      const octets = Array.from({ length: 4 }, (_, index) =>
        binary.slice(index * 8, index * 8 + 8),
      );

      const decimalOctets = octets.map((octet) =>
        parseInt(octet, 2).toString(),
      );

      const ipv4 = decimalOctets.join(".");

      setResult({
        binary: octets.join("."),
        ipv4,
        octets: decimalOctets,
      });

      setError("");
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Conversion failed.");
    }
  }

  function reset() {
    setInput("");
    setResult(null);
    setError("");
  }

  return (
    <div className="extra-calculator binary-ipv4-calculator">
      <div className="extra-calculator-heading binary-heading">
        <div className="binary-heading-icon">
          <BinaryIcon size={24} />
        </div>

        <div className="binary-heading-text">
          <h2>Binary to IPv4</h2>
          <p>Convert 32-bit binary addresses into readable IPv4 addresses.</p>
        </div>
      </div>

      <div className="extra-calculator-form">
        <label htmlFor="binary-ipv4-input" className="binary-input-label">
          <BinaryIcon size={17} />
          <span>Binary IPv4 Address</span>
        </label>

        <input
          id="binary-ipv4-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") calculate();
          }}
          placeholder="11000000.10101000.00001010.00011001"
        />

        <button
          type="button"
          onClick={calculate}
          className="binary-convert-button"
        >
          <Calculator size={17} />
          <span>Convert to IPv4</span>
          <ArrowRightLeft size={17} />
        </button>
      </div>

      <div className="form-note binary-form-note">
        <Info size={16} />
        <span>
          Enter exactly 32 binary digits. Spaces or dots between octets are
          allowed.
        </span>
      </div>

      {error && (
        <div className="extra-error binary-error">
          <Info size={17} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="extra-results">
          <h3 className="binary-result-heading">
            <CheckCircle2 size={19} />
            <span>Conversion Result</span>
          </h3>

          <div className="extra-result-item binary-ipv4-highlight">
            <div className="binary-ipv4-result-label">
              <Globe size={19} />
              <span>Converted IPv4 Address</span>
            </div>

            <strong>{result.ipv4}</strong>
          </div>

          <h3 className="binary-breakdown-heading">
            <BinaryIcon size={18} />
            <span>Octet Breakdown</span>
          </h3>

          <div className="extra-results-grid">
            <Result
              label="Octet 1"
              value={`${result.octets[0]} (${result.binary.split(".")[0]})`}
            />

            <Result
              label="Octet 2"
              value={`${result.octets[1]} (${result.binary.split(".")[1]})`}
            />

            <Result
              label="Octet 3"
              value={`${result.octets[2]} (${result.binary.split(".")[2]})`}
            />

            <Result
              label="Octet 4"
              value={`${result.octets[3]} (${result.binary.split(".")[3]})`}
            />
          </div>

          <div className="binary-reset-container">
            <button
              type="button"
              className="binary-reset-button"
              onClick={reset}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="extra-result-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default BinaryConverter;
