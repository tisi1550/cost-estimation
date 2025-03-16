import { useState } from "react";
import "../styles/ConfigForm.css";

const numerical_features = [
  "Hyperparameters_# of Epochs",
  "Hyperparameters_# of Model Parameters",
  "Hyperparameters_# of Workers",
  "Hyperparameters_Batch Size",
  "Hyperparameters_Learning Rate",
  "Instance_Config_CPU_Numeric",
  "Instance_Config_Memory_Numeric",
  "Instance_Config_Disk_Numeric",
  "Instance_Config_Network_Bandwidth_Numeric",
];

const categorical_features = {
  Additional_Config_Framework: ["TensorFlow", "PyTorch", "XGBoost", "Other"],
  Hyperparameters_Optimizer: ["Adam", "SGD", "RMSprop", "Other"],
  Instance_Config_instance_name: [
    "n1-standard-4",
    "n1-highmem-8",
    "custom-instance",
    "Other",
  ],
};

export default function ConfigForm({ setChatHistory, chatHistory }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const totalFields =
      numerical_features.length + Object.keys(categorical_features).length;
    if (Object.keys(formData).length < totalFields) {
      alert("Please fill out all fields.");
      return;
    }

    const userMessage = {
      role: "user",
      text: "User provided input",
      data: formData,
    };
    setChatHistory([...chatHistory, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(
        "https://your-cloud-run-url/run-estimation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        text: `Estimated Cost: ${data.estimated_cost || "N/A"} USD`,
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", text: "Error fetching estimate." },
      ]);
    }

    setLoading(false);
    setFormData({});
  };

  return (
    <div className="config-form">
      <h2>Enter Configuration</h2>
      <div className="form-grid">
        {numerical_features.map((feat, idx) => (
          <input
            key={idx}
            type="number"
            name={feat}
            placeholder={feat}
            value={formData[feat] || ""}
            onChange={handleChange}
          />
        ))}
        {Object.keys(categorical_features).map((feat, idx) => (
          <select
            key={idx}
            name={feat}
            value={formData[feat] || ""}
            onChange={handleChange}
          >
            <option value="">Select {feat}</option>
            {categorical_features[feat].map((option, optIdx) => (
              <option key={optIdx} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={loading} className="submit-btn">
        {loading ? "Estimating..." : "Submit"}
      </button>
    </div>
  );
}
