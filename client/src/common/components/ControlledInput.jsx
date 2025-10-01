const ControlledInput = ({
  label,
  name,
  value,
  onChange,
  editable = true,
  readOnly = false,
  type = "text",
}) => {
  const disabled = readOnly || !editable;

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`border px-3 py-2 rounded ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
      />
    </div>
  );
};

export default ControlledInput;
