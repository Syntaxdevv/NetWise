
import { useState } from "react";
import {
  Network,
  GitBranch,
  Globe,
  Wrench,
} from "lucide-react";

import Navbar from "../components/Navbar";
import CalculatorForm from "../components/CalculatorForm";
import ResultsTable from "../components/ResultsTable";
import IPv4Calculator from "../components/IPv4Calculator";
import IPConverter from "../components/IPConverter";
import CIDRCalculator from "../components/CIDRCalculator";
import BinaryConverter from "../components/binary";
import VLSM from "./VLSM";

import { calculateSubnets } from "../utils/subnetCalculator";

import type {
  CalculationMode,
  CalculationResult,
} from "../types/subnet";

import "../css/Home.css";

type CalculatorType =
  | "subnetting"
  | "vlsm"
  | "ipv4"
  | "more-tools";

function Home() {
  const [selectedCalculator, setSelectedCalculator] =
    useState<CalculatorType>("subnetting");

  const [mode, setMode] =
    useState<CalculationMode>("regular");

  const [network, setNetwork] =
    useState("192.168.10.0/24");

  const [required, setRequired] = useState("26");

  const [results, setResults] =
    useState<CalculationResult | null>(null);

  const [error, setError] = useState("");

  function handleCalculate() {
    try {
      const requiredValue =
        mode === "hosts"
          ? required
              .split(",")
              .map((value) => Number(value.trim()))
          : Number(required);

      const calculated = calculateSubnets(
        network,
        requiredValue,
        mode
      );

      setResults(calculated);
      setError("");
    } catch (err) {
      setResults(null);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  }

  function handleCalculatorChange(type: CalculatorType) {
    setSelectedCalculator(type);
    setResults(null);
    setError("");

    if (type === "subnetting") {
      setMode("regular");
      setRequired("26");
    } else if (type === "vlsm") {
      setMode("hosts");
      setRequired("100, 50, 25, 10");
    }
  }

  function handleModeChange(newMode: CalculationMode) {
    setMode(newMode);
    setResults(null);
    setError("");

    if (newMode === "regular") {
      setRequired("26");
    } else if (newMode === "hosts") {
      setRequired(
        selectedCalculator === "vlsm"
          ? "100, 50, 25, 10"
          : "26"
      );
    } else {
      setRequired("4");
    }
  }

  return (
    <div className="app">
      <Navbar />

      {/* MAIN NAVIGATION */}
      <div className="calculator-selector-wrap">
        <div className="calculator-selector">
          <button
            type="button"
            className={
              selectedCalculator === "subnetting"
                ? "active"
                : ""
            }
            onClick={() =>
              handleCalculatorChange("subnetting")
            }
            title="Subnetting"
            aria-label="Subnetting"
          >
            <Network size={21} />
            <span>Subnetting</span>
          </button>

          <button
            type="button"
            className={
              selectedCalculator === "vlsm"
                ? "active"
                : ""
            }
            onClick={() =>
              handleCalculatorChange("vlsm")
            }
            title="VLSM Calculator"
            aria-label="VLSM Calculator"
          >
            <GitBranch size={21} />
            <span>VLSM Calculator</span>
          </button>

          <button
            type="button"
            className={
              selectedCalculator === "ipv4"
                ? "active"
                : ""
            }
            onClick={() =>
              handleCalculatorChange("ipv4")
            }
            title="IPv4 Calculator"
            aria-label="IPv4 Calculator"
          >
            <Globe size={21} />
            <span>IPv4 Calculator</span>
          </button>

          <button
            type="button"
            className={
              selectedCalculator === "more-tools"
                ? "active"
                : ""
            }
            onClick={() =>
              handleCalculatorChange("more-tools")
            }
            title="More Tools"
            aria-label="More Tools"
          >
            <Wrench size={21} />
            <span>More Tools</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="main-container">
        {/* MORE TOOLS */}
        {selectedCalculator === "more-tools" ? (
          <>
            <div className="page-top">
              <div className="page-heading">
                <div className="heading-icon">⌘</div>

                <div>
                  <h1>More Networking Tools</h1>
                  <p>
                    Additional tools for IP addressing and
                    network calculations.
                  </p>
                </div>
              </div>
            </div>

            <div className="more-tools-panel">
              <div className="more-tools-grid">
                <section className="tool-content">
                  <IPConverter />
                </section>

                <section className="tool-content">
                  <CIDRCalculator />
                </section>

                <section className="tool-content">
                  <BinaryConverter />
                </section>
              </div>
            </div>
          </>
        ) : selectedCalculator === "vlsm" ? (
          <VLSM />
        ) : (
          <>
            <div className="page-top">
              <div className="page-heading">
                <div className="heading-icon">⌗</div>

                <div>
                  <h1>
                    {selectedCalculator === "subnetting"
                      ? "Subnet Calculator"
                      : "IPv4 Calculator"}
                  </h1>

                  <p>
                    {selectedCalculator === "subnetting"
                      ? "Calculate subnet information, host requirements, and network requirements."
                      : "Calculate IPv4 address and network information."}
                  </p>
                </div>
              </div>

              {selectedCalculator === "subnetting" && (
                <div className="mode-tabs">
                  <button
                    type="button"
                    className={
                      mode === "regular" ? "active" : ""
                    }
                    onClick={() =>
                      handleModeChange("regular")
                    }
                  >
                    Regular
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "hosts" ? "active" : ""
                    }
                    onClick={() =>
                      handleModeChange("hosts")
                    }
                  >
                    By Hosts
                  </button>

                  <button
                    type="button"
                    className={
                      mode === "networks" ? "active" : ""
                    }
                    onClick={() =>
                      handleModeChange("networks")
                    }
                  >
                    By Networks
                  </button>
                </div>
              )}
            </div>

            {error && selectedCalculator !== "ipv4" && (
              <div className="error-message">
                <span>ⓘ</span>
                {error}
              </div>
            )}

            {selectedCalculator === "ipv4" ? (
              <div className="calculator-card">
                <IPv4Calculator />
              </div>
            ) : (
              <div className="calculator-card">
                <CalculatorForm
                  mode={mode}
                  setMode={setMode}
                  network={network}
                  setNetwork={setNetwork}
                  required={required}
                  setRequired={setRequired}
                  onCalculate={handleCalculate}
                />

                <ResultsTable results={results} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
