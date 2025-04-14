import { useState } from "react";
import "../styles/formSection.css";

const BATCH_SIZES = [16, 32, 64];
const WORKER_COUNTS = [2, 4, 6];
const MACHINE_TYPES = [
  "n1-standard-4",
  "n1-standard-8",
  "e2-standard-16",
  "n1-highcpu-16",
  "n1-highcpu-32",
  "e2-highmem-8",
  "e2-highmem-16",
];

const MACHINE_RESOURCES = {
  "n1-standard-4": { CPU: 4, Memory: 15, Disk: 100, Network: 2 },
  "n1-standard-8": { CPU: 8, Memory: 30, Disk: 100, Network: 2 },
  "e2-standard-16": { CPU: 16, Memory: 64, Disk: 100, Network: 2 },
  "n1-highcpu-16": { CPU: 16, Memory: 14.4, Disk: 100, Network: 2 },
  "n1-highcpu-32": { CPU: 32, Memory: 28.8, Disk: 100, Network: 2 },
  "e2-highmem-8": { CPU: 8, Memory: 64, Disk: 100, Network: 2 },
  "e2-highmem-16": { CPU: 16, Memory: 128, Disk: 100, Network: 2 },
};

const API_BASE_URL = process.env.REACT_APP_BASE_BACKEND || "http://localhost:5000";
const ENDPOINTS = {
  predictTime: `${API_BASE_URL}/api/predict-time`,
  predictCost: `${API_BASE_URL}/api/predict-cost`,
};

const defaultFormState = {
  batch_size: "",
  workers: "",
  machine_type: "",
  CPU: "",
  Memory: "",
  Disk: "",
  Network: "",
  epochs: "",
  model_parameters: "",
  learning_rate: "",
  framework: "PyTorch",
  optimizer: "",
};

function FormSection({ setChatHistory }) {
  const [formData, setFormData] = useState(defaultFormState);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    if (name === "machine_type" && MACHINE_RESOURCES[value]) {
      const { CPU, Memory, Disk, Network } = MACHINE_RESOURCES[value];
      setFormData((prev) => ({
        ...prev,
        machine_type: value,
        CPU,
        Memory,
        Disk,
        Network,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const makeRequestPayload = () => ({
    "Hyperparameters_# of Epochs": Number(formData.epochs),
    "Hyperparameters_# of Model Parameters": Number(formData.model_parameters),
    "Hyperparameters_# of Workers": Number(formData.workers),
    "Hyperparameters_Batch Size": Number(formData.batch_size),
    "Hyperparameters_Learning Rate": Number(formData.learning_rate),
    Instance_Config_CPU_Numeric: Number(formData.CPU),
    Instance_Config_Memory_Numeric: Number(formData.Memory),
    Instance_Config_Disk_Numeric: Number(formData.Disk),
    Instance_Config_Network_Bandwidth_Numeric: Number(formData.Network),
    Additional_Config_Framework: formData.framework,
    Hyperparameters_Optimizer: formData.optimizer,
    Instance_Config_instance_name: formData.machine_type,
  });

  const handlePredict = async (type) => {
    const endpoint = type === "time" ? ENDPOINTS.predictTime : ENDPOINTS.predictCost;
    const userAction = type === "time" ? "get_time" : "get_cost";
    setChatHistory((prev) => [...prev, { role: "user", action: userAction, data: formData }]);

    if (type === "cost") {
      try {
        const response = await fetch(ENDPOINTS.predictCost, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(makeRequestPayload()),
        });

        const result = await response.json();
        setChatHistory((prev) => [...prev, { role: "assistant", text: `Estimated Training Cost: $${Math.max(0, result.estimated_cost || 0).toFixed(2) || "N/A"}` }]);

      } catch (error) {
        console.error(error);
        setChatHistory((prev) => [...prev, { role: "assistant", text: `Error fetching training cost.` }]);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(makeRequestPayload()),
      });
      const result = await response.json();
      const estimatedTime = Math.max(0, result.estimated_time || 0);
      setChatHistory((prev) => [...prev, { role: "assistant", text: `Estimated Training Time: ${estimatedTime}` }]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [...prev, { role: "assistant", text: `Error fetching training ${type}.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonUpload = async ({ target: { files } }) => {
    if (!files[0]) return;
    try {
      const json = JSON.parse(await files[0].text());
      const updatedFormData = {
        epochs: json["Hyperparameters_# of Epochs"] || "",
        model_parameters: json["Hyperparameters_# of Model Parameters"] || "",
        workers: json["Hyperparameters_# of Workers"] || "",
        batch_size: json["Hyperparameters_Batch Size"] || "",
        learning_rate: json["Hyperparameters_Learning Rate"] || "",
        CPU: json["Instance_Config_CPU_Numeric"] || "",
        Memory: json["Instance_Config_Memory_Numeric"] || "",
        Disk: json["Instance_Config_Disk_Numeric"] || "",
        Network: json["Instance_Config_Network_Bandwidth_Numeric"] || "",
        framework: json["Additional_Config_Framework"] || "PyTorch",
        optimizer: json["Hyperparameters_Optimizer"] || "",
        machine_type: json["Instance_Config_instance_name"] || "",
      };
      setFormData(updatedFormData);
    } catch (error) {
      alert("Invalid JSON file");
      console.error(error);
    }
  };

  const isFormValid = () => {
    return (
      formData.batch_size &&
      formData.workers &&
      formData.machine_type &&
      formData.epochs &&
      formData.model_parameters &&
      formData.learning_rate &&
      formData.optimizer
    );
  };


  return (
    <div className="form-section">
      <div className="form-columns">

        <div className="card">
          <h3 className="card-title">Resource Allocation</h3>
          <div className="form-grid">
            <label htmlFor="batch_size">
              Batch Size
              <select name="batch_size" value={formData.batch_size} onChange={handleChange}>
                <option value="" disabled>Select</option>
                {BATCH_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>

            <label htmlFor="workers">
              Workers
              <select name="workers" value={formData.workers} onChange={handleChange}>
                <option value="" disabled>Select</option>
                {WORKER_COUNTS.map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>

            <label htmlFor="machine_type">
              Machine Type
              <select name="machine_type" value={formData.machine_type} onChange={handleChange}>
                <option value="" disabled>Select</option>
                {MACHINE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
          </div>

          <div className="readonly-fields">
            {["CPU", "Memory", "Disk", "Network"].map((key) => (
              <div key={key}>
                <small>{key}</small>
                <input
                  type="text"
                  name={key}
                  value={`${formData[key]} ${key === "CPU" ? "vCPUs" : key === "Network" ? "Gbps" : "GB"}`}
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Model Configuration</h3>
          <div className="form-grid">
            <label htmlFor="epochs">
              Epochs
              <input type="number" name="epochs" value={formData.epochs} onChange={handleChange} placeholder="e.g. 10" />
            </label>

            <label htmlFor="model_parameters">
              Model Parameters
              <input type="text" name="model_parameters" value={formData.model_parameters} onChange={handleChange} placeholder="e.g. 1.5B" />
            </label>

            <label htmlFor="learning_rate">
              Learning Rate
              <input type="number" name="learning_rate" value={formData.learning_rate} onChange={handleChange} placeholder="e.g. 0.001" />
            </label>

            <label htmlFor="framework">
              Framework
              <input type="text" name="framework" value={formData.framework} readOnly />
            </label>

            <label htmlFor="optimizer">
              Optimizer
              <select name="optimizer" value={formData.optimizer} onChange={handleChange}>
                <option value="" disabled>Select</option>
                {["Adam", "AdamW", "SGD"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Upload JSON Config (Recommended)</h3>
        <input type="file" accept="application/json" onChange={handleJsonUpload} className="file-upload" />
      </div>

      <div className="button-group">
        <button onClick={() => handlePredict("time")} disabled={isLoading || !isFormValid()}>Get Training Time</button>
        <button onClick={() => handlePredict("cost")} disabled={isLoading || !isFormValid()}>Get Training Cost</button>
      </div>
    </div>
  );
}

export default FormSection;