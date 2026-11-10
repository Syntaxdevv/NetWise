
import { useState } from "react";
import {
  Binary,
  Globe,
  ArrowRight,
  Copy,
  RotateCcw,
  Info,
  CheckCircle2,
} from "lucide-react";

import "../css/IPConverter.css";

function ipv4ToBinary(ip: string): string {
  const octets = ip.trim().split(".");

  if (octets.length !== 4) {
    throw new Error("Enter a valid IPv4 address with 4 octets.");
  }

  return octets.map((octet) => {
    if (!/^\d+$/.test(octet)) {
      throw new Error("IPv4 address must contain numbers only.");
    }

    const value = Number(octet);

    if (value < 0 || value > 255) {
      throw new Error("Each IPv4 octet must be between 0 and 255.");
    }

    return value.toString(2).padStart(8, "0");
  }).join(".");
}

function IPConverter() {
  const [input, setInput] = useState("192.168.10.25");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    try {
      const converted = ipv4ToBinary(input);
      setResult(converted);
      setError("");
      setCopied(false);
    } catch (err) {
      setResult("");
      setError(
        err instanceof Error ? err.message : "Conversion failed."
      );
    }
  }

  function handleReset() {
    setInput("");
    setResult("");
    setError("");
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setError("Unable to copy result. Please copy it manually.");
    }
  }

  return (
    <div className="extra-calculator ipv4-binary-calculator">
      <div className="extra-calculator-heading">
        <div className="ip-binary-heading-icon">
          <Binary size={24} />
        </div>

        <div className="ip-binary-heading-text">
          <h2>IPv4 to Binary Converter</h2>
          <p>
            Convert IPv4 addresses into their 32-bit binary representation.
          </p>
        </div>
      </div>

      <div className="extra-calculator-form">
        <label
          htmlFor="ipv4-binary-input"
          className="ip-binary-label"
        >
          <Globe size={17} />
          <span>IPv4 Address</span>
        </label>

        <input
          id="ipv4-binary-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConvert();
          }}
          placeholder="192.168.10.25"
        />

        <button
          type="button"
          className="ip-binary-convert-button"
          onClick={handleConvert}
        >
          <Binary size={17} />
          <span>Convert to Binary</span>
          <ArrowRight size={17} />
        </button>
      </div>

      <div className="form-note ip-binary-note">
        <Info size={16} />
        <span>
          Enter a valid IPv4 address with four octets.
        </span>
      </div>

      {error && (
        <div className="extra-error">
          <Info size={17} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="extra-results">
          <h3 className="ip-binary-result-heading">
            <CheckCircle2 size={19} />
            <span>Conversion Result</span>
          </h3>

          <div className="binary-ipv4-output">
            <div className="binary-ipv4-output-content">
              <span>Converted Binary Address</span>
              <strong>{result}</strong>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="ip-binary-copy-button"
            >
              <Copy size={15} />
              <span>{copied ? "Copied!" : "Copy Result"}</span>
            </button>
          </div>

          <h3 className="ip-binary-breakdown-heading">
            <Globe size={18} />
            <span>Octet Breakdown</span>
          </h3>

          <div className="extra-results-grid">
            {result.split(".").map((octet, index) => (
              <div className="extra-result-item" key={index}>
                <span>Octet {index + 1}</span>
                <strong>{octet}</strong>
                <span>Decimal: {parseInt(octet, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="binary-ipv4-reset">
        <button
          type="button"
          onClick={handleReset}
          className="ip-binary-reset-button"
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

export default IPConverter;
