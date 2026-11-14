import type { CalculationMode } from "../types/subnet";
import "../css/CalculatorForm.css";
import "../css/CalculatorShared.css";
import {
  Settings2,
  Network,
  Users,
  GitBranch,
  Calculator,
  Info,
  ArrowRight,
} from "lucide-react";

interface Props {
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  network: string;
  setNetwork: (value: string) => void;
  required: string;
  setRequired: (value: string) => void;
  onCalculate: () => void;
}

function CalculatorForm({
  mode,
  network,
  setNetwork,
  required,
  setRequired,
  onCalculate,
}: Props) {
  const RequirementIcon = mode === "hosts" ? Users : GitBranch;

  return (
    <section className="calculator-form">
      <div className="panel-heading">
        <span className="section-icon">
          <Settings2 size={21} strokeWidth={1.9} />
        </span>

        <div>
          <h2>Configuration</h2>
          <p>Enter your network details.</p>
        </div>
      </div>

      <div className="form-field">
        <label>
          <Network size={16} />
          Base Network
        </label>

        <input
          type="text"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          placeholder="192.168.10.0/24"
        />
      </div>

      {mode !== "regular" && (
        <div className="form-field">
          <label>
            <RequirementIcon size={16} />

            {mode === "hosts" ? "Required Hosts" : "Required Networks"}
          </label>

          <input
            type={mode === "hosts" ? "text" : "number"}
            min="1"
            value={required}
            onChange={(e) => setRequired(e.target.value)}
            placeholder={mode === "hosts" ? "e.g. 100, 50, 25, 10" : "e.g. 4"}
          />

          {mode === "hosts" && (
            <small className="input-hint">
              Separate multiple host requirements with commas.
            </small>
          )}
        </div>
      )}

      <button className="calculate-button" type="button" onClick={onCalculate}>
        <Calculator size={18} />
        Calculate Subnet
        <ArrowRight size={18} />
      </button>

      <div className="form-note">
        <Info size={16} />
        Enter a valid IPv4 network with CIDR notation.
      </div>
    </section>
  );
}

export default CalculatorForm;
