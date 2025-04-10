import { useState } from "react";
import "../styles/formSection.css";

const batch_sizes = [16, 32, 64];
const worker_counts = [2, 4, 6];
const machine_types = [
  "n1-standard-4",
  "n1-standard-8",
  "e2-standard-16",
  "n1-highcpu-16",
  "n1-highcpu-32",
  "e2-highmem-8",
  "e2-highmem-16",
];

const machine_resources = {
  "n1-standard-4": { CPU: 4, Memory: 15, Disk: 100, Network: 2 },
  "n1-standard-8": { CPU: 8, Memory: 30, Disk: 100, Network: 2 },
  "e2-standard-16": { CPU: 16, Memory: 64, Disk: 100, Network: 2 },
  "n1-highcpu-16": { CPU: 16, Memory: 14.4, Disk: 100, Network: 2 },
  "n1-highcpu-32": { CPU: 32, Memory: 28.8, Disk: 100, Network: 2 },
  "e2-highmem-8": { CPU: 8, Memory: 64, Disk: 100, Network: 2 },
  "e2-highmem-16": { CPU: 16, Memory: 128, Disk: 100, Network: 2 },
};

function FormSection({ setChatHistory }) {
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "machine_type") {
      const resources = machine_resources[value];
      setFormData((prev) => ({
        ...prev,
        machine_type: value,
        CPU: resources.CPU,
        Memory: resources.Memory,
        Disk: resources.Disk,
        Network: resources.Network,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTrainingTime = async () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "user", action: "get_time", data: formData },
    ]);

    try {
      const response = await fetch("http://localhost:5000/api/predict-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "Hyperparameters_# of Epochs": Number(formData.epochs),
          "Hyperparameters_# of Model Parameters": Number(
            formData.model_parameters
          ),
          "Hyperparameters_# of Workers": Number(formData.workers),
          "Hyperparameters_Batch Size": Number(formData.batch_size),
          "Hyperparameters_Learning Rate": Number(formData.learning_rate),
          Instance_Config_CPU_Numeric: Number(formData.CPU),
          Instance_Config_Memory_Numeric: Number(formData.Memory),
          Instance_Config_Disk_Numeric: Number(formData.Disk),
          Instance_Config_Network_Bandwidth_Numeric: Number(
            formData.instance_network_bandwidth
          ),
          Additional_Config_Framework: formData.framework,
          Hyperparameters_Optimizer: formData.optimizer,
          Instance_Config_instance_name: formData.machine_type,
        }),
      });

      const data = await response.json();
      console.log("Frontend got:", data);

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Estimated Training Time: ${data.estimated_time || "N/A"}`,
        },
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", text: "Error fetching training time." },
      ]);
    }
  };

  const handleTrainingCost = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "user", action: "get_cost", data: formData },
    ]);

    const response = { estimated_cost: "$120" }; // dummy response
    setChatHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `Estimated Training Cost: ${response.estimated_cost}`,
      },
    ]);
  };

  return (
    <>
      <h1 style={{ color: "white", padding: "20px", margin: "0" }}>
        AI Cost Estimator
      </h1>
      <div className="form-section">
        <div className="form-grid">
          {/* Resource Inputs */}
          <div className="resource-group">
            <h3>Resource Allocation</h3>
            <select
              name="batch_size"
              value={formData.batch_size}
              onChange={handleChange}
            >
              <option value="" disabled>
                Batch Size
              </option>
              {batch_sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <select
              name="workers"
              value={formData.workers}
              onChange={handleChange}
            >
              <option value="" disabled>
                # of Workers
              </option>
              {worker_counts.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>

            <select
              name="machine_type"
              value={formData.machine_type}
              onChange={handleChange}
            >
              <option value="" disabled>
                Machine Type
              </option>
              {machine_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="readonly-fields-inline">
              <div>
                <input
                  type="text"
                  name="CPU"
                  value={`${formData.CPU} vCPUs`}
                  readOnly
                />
                <small>CPU</small>
              </div>
              <div>
                <input
                  type="text"
                  name="Memory"
                  value={`${formData.Memory} GB`}
                  readOnly
                />
                <small>Memory</small>
              </div>
              <div>
                <input
                  type="text"
                  name="Disk"
                  value={`${formData.Disk} GB`}
                  readOnly
                />
                <small>Disk</small>
              </div>
              <div>
                <input
                  type="text"
                  name="Network"
                  value={`${formData.Network} Gbps`}
                  readOnly
                />
                <small>Network</small>
              </div>
            </div>
          </div>

          {/* Model Inputs */}
          <div className="model-group">
            <h3>Model Configuration</h3>
            <input
              type="number"
              name="epochs"
              value={formData.epochs}
              onChange={handleChange}
              placeholder="Number of Epochs"
            />
            <input
              type="text"
              name="model_parameters"
              value={formData.model_parameters}
              onChange={handleChange}
              placeholder="Model Parameters"
            />
            <input
              type="number"
              name="learning_rate"
              value={formData.learning_rate}
              onChange={handleChange}
              placeholder="Learning Rate"
            />
            {/* <select
              name="instance_CPU"
              value={formData.instance_CPU}
              onChange={handleChange}
            >
              <option value="">Instance CPU</option>
              {[4, 8, 16, 32].map((cpu) => (
                <option key={cpu} value={cpu}>
                  {cpu} vCPUs
                </option>
              ))}
            </select> */}
            {/* <input
              type="number"
              name="instance_network_bandwidth"
              value={formData.instance_network_bandwidth}
              onChange={handleChange}
              placeholder="Network Bandwidth (Gbps)"
            /> */}
            <input
              type="text"
              name="framework"
              value={formData.framework}
              readOnly
            />
            <select
              name="optimizer"
              value={formData.optimizer}
              onChange={handleChange}
            >
              <option value="" disabled>
                Optimizer
              </option>
              {["Adam", "AdamW", "SGD"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two Buttons */}
        <div className="button-group">
          <button onClick={handleTrainingTime}>Get Training Time</button>
          <button onClick={handleTrainingCost}>Get Training Cost</button>
        </div>
      </div>
    </>
  );
}

export default FormSection;
