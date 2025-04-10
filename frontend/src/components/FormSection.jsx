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
      const response = { estimated_cost: "$120" }; // Placeholder
      setChatHistory((prev) => [...prev, { role: "assistant", text: `Estimated Training Cost: ${response.estimated_cost}` }]);
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
      setChatHistory((prev) => [...prev, { role: "assistant", text: `Estimated Training Time: ${result.estimated_time || "N/A"}` }]);
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

  return (
    <div className="form-section">
      <h1 className="form-title">AI Cost Estimator</h1>

      <div className="form-grid">
        <div className="resource-group">
          <h3>Resource Allocation</h3>
          <select name="batch_size" value={formData.batch_size} onChange={handleChange}>
            <option value="" disabled>Batch Size</option>
            {BATCH_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>

          <select name="workers" value={formData.workers} onChange={handleChange}>
            <option value="" disabled># of Workers</option>
            {WORKER_COUNTS.map((count) => <option key={count} value={count}>{count}</option>)}
          </select>

          <select name="machine_type" value={formData.machine_type} onChange={handleChange}>
            <option value="" disabled>Machine Type</option>
            {MACHINE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>

          <div className="readonly-fields-inline">
            {["CPU", "Memory", "Disk", "Network"].map((key) => (
              <div key={key}>
                <input
                  type="text"
                  name={key}
                  value={`${formData[key]} ${key === "CPU" ? "vCPUs" : key === "Network" ? "Gbps" : "GB"}`}
                  readOnly
                />
                <small>{key}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="model-group">
          <h3>Model Configuration</h3>
          <input type="number" name="epochs" value={formData.epochs} onChange={handleChange} placeholder="Number of Epochs" />
          <input type="text" name="model_parameters" value={formData.model_parameters} onChange={handleChange} placeholder="Model Parameters" />
          <input type="number" name="learning_rate" value={formData.learning_rate} onChange={handleChange} placeholder="Learning Rate" />
          <input type="text" name="framework" value={formData.framework} readOnly />

          <select name="optimizer" value={formData.optimizer} onChange={handleChange}>
            <option value="" disabled>Optimizer</option>
            {["Adam", "AdamW", "SGD"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <h3>OR</h3>
      <h3>Upload Model Config</h3>
      <input type="file" accept="application/json" onChange={handleJsonUpload} className="file-upload" />

      <div className="button-group">
        <button onClick={() => handlePredict("time")} disabled={isLoading}>Get Training Time</button>
        <button onClick={() => handlePredict("cost")} disabled={isLoading}>Get Training Cost</button>
      </div>
    </div>
  );
}

export default FormSection;