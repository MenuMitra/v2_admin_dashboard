const FormInput = ({
  type = "text",
  label,
  placeholder,
  icon,
  fullWidth = true,
  className = "",
  required = false,
  pattern,
  name,
  value,
  onChange,
  ...props
}) => {
  const inputClasses = `dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
    icon ? "pl-11" : ""
  }`;

  return (
    <div className={`${fullWidth ? "w-full" : "w-1/2"} ${className}`}>
      {label && (
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute text-gray-500 -translate-y-1/2 left-3 md:left-4 top-1/2 dark:text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          pattern={pattern}
          className={`h-10 md:h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 md:px-4 py-2 text-xs md:text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
            icon ? "pl-9 md:pl-11" : ""
          }`}
          {...props}
        />
      </div>
    </div>
  );
};

const FormSelect = ({
  label,
  options,
  fullWidth = true,
  className = "",
  ...props
}) => {
  return (
    <div className={`${fullWidth ? "w-full" : "w-1/2"} px-2.5 ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative z-20 bg-transparent">
        <select
          className="dark:bg-dark-900 z-20 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          {...props}
        >
          {options.map((option, index) => (
            <option
              key={index}
              value={option.value}
              className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-4 top-1/2 dark:text-gray-400">
          <svg
            className="stroke-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

const FormLayout = ({
  title,
  children,
  onSubmit,
  submitText = "Submit",
  showCancel = false,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {title && (
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5 space-y-6 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <form onSubmit={onSubmit}>
          <div className="-mx-2.5 flex flex-wrap gap-y-5">{children}</div>
          <div className="w-full px-2.5 mt-5">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
              >
                {submitText}
              </button>
              {showCancel && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExampleUsage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <FormLayout title="Basic Form" onSubmit={handleSubmit}>
        <FormInput
          placeholder="Name"
          fullWidth={false}
        />
        <FormInput
          type="email"
          placeholder="Email address"
          fullWidth={false}
        />
        <FormInput
          type="password"
          placeholder="Password"
        />
        <FormInput
          type="password"
          placeholder="Confirm Password"
        />
      </FormLayout>

      <FormLayout 
        title="Example Form with Icons" 
        onSubmit={handleSubmit}
        submitText="Create Account"
        showCancel
      >
        <FormInput
          label="Username"
          placeholder="Username"
          icon={<UserIcon />}
        />
        <FormSelect
          label="Select Subject"
          options={[
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" },
          ]}
        />
        {/* Add more form fields as needed */}
      </FormLayout>
    </div>
  );
};

const FormTextarea = ({
  label,
  placeholder,
  rows = 6,
  fullWidth = true,
  className = "",
  ...props
}) => {
  return (
    <div className={`${fullWidth ? "w-full" : "w-1/2"} px-2.5 ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="dark:bg-dark-900 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        {...props}
      />
    </div>
  );
};

const FormRadioGroup = ({
  label,
  options,
  name,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`w-full px-2.5 ${className}`}>
      <div className="flex items-center gap-3">
        {label && (
          <label className="text-sm font-medium text-gray-800 dark:text-white/90">
            {label}:
          </label>
        )}
        <div className="flex flex-wrap items-center gap-4">
          {options.map((option, index) => (
            <div key={index}>
              <label className={`relative flex items-center gap-3 text-sm font-medium cursor-pointer select-none ${value === option.value ? 'text-gray-700 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <input
                  className="sr-only"
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                />
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${value === option.value ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}>
                  <span className={`w-2 h-2 bg-white rounded-full ${value === option.value ? 'block' : 'hidden'}`}></span>
                </span>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FormCheckbox = ({ label, checked, onChange, className = "" }) => {
  return (
    <div className={`w-full px-2.5 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer select-none dark:text-gray-400">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
          />
          <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] ${
            checked ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-700'
          }`}>
            <span className={checked ? '' : 'opacity-0'}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
        {label}
      </label>
    </div>
  );
};

const FormSectionHeader = ({ title }) => {
  return (
    <div className="w-full px-2.5">
      <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
        {title}
      </h4>
    </div>
  );
};

const CompleteFormExample = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    category: '',
    membership: '',
    rememberMe: false,
    message: '',
    // Add other form fields as needed
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <FormLayout 
        title="Complete Form Example" 
        onSubmit={handleSubmit}
        submitText="Save Changes"
        showCancel
      >
        <FormSectionHeader title="Personal Info" />
        
        <FormInput
          label="First Name"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          fullWidth={false}
        />
        
        <FormInput
          label="Last Name"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          fullWidth={false}
        />
        
        <FormSelect
          label="Gender"
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Others" }
          ]}
          value={formData.gender}
          onChange={(e) => setFormData({...formData, gender: e.target.value})}
        />
        
        <FormInput
          type="date"
          label="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        />
        
        <FormRadioGroup
          label="Membership"
          name="membership"
          value={formData.membership}
          onChange={(e) => setFormData({...formData, membership: e.target.value})}
          options={[
            { value: "free", label: "Free" },
            { value: "paid", label: "Paid" }
          ]}
        />
        
        <FormTextarea
          label="Message"
          placeholder="Enter your message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
        
        <FormCheckbox
          label="Remember me"
          checked={formData.rememberMe}
          onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
        />
      </FormLayout>
    </div>
  );
};

export {
  FormInput,
  FormSelect,
  FormLayout,
  FormTextarea,
  FormRadioGroup,
  FormCheckbox,
  FormSectionHeader,
  CompleteFormExample
};
