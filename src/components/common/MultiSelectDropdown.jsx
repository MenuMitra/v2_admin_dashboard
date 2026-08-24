// src/components/common/MultiSelectDropdown.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { createSearchChangeHandler } from "../../utils/inputValidation";
import "./MultiSelectDropdown.css";

const MultiSelectDropdown = ({
  label,
  options,
  selectedValues,
  onChange,
  displayKey,
  valueKey,
  searchKeys = [],
  required,
  placeholder = "Select items",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  primaryValue = null,
  onPrimaryChange = null,
}) => {
  const isDisabled = Boolean(disabled);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selectedValues) ? selectedValues : [];
  const searchFields = searchKeys.length ? searchKeys : [displayKey];

  const filteredOptions = safeOptions.filter((option) => {
    if (!searchTerm) return true;
    return searchFields.some((key) =>
      option[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const isValueSelected = (value) =>
    safeSelected.some((selected) => String(selected) === String(value));

  const handleSelect = (value) => {
    const newSelectedValues = isValueSelected(value)
      ? safeSelected.filter((selected) => String(selected) !== String(value))
      : [...safeSelected, value];
    onChange(newSelectedValues);
  };

  const getOptionLabel = (value) => {
    const option = safeOptions.find(
      (opt) => String(opt[valueKey]) === String(value)
    );
    return option?.[displayKey] || String(value);
  };

  const getSelectedText = () => {
    if (safeSelected.length === 0) return placeholder;
    const names = safeSelected.map(getOptionLabel).filter(Boolean);
    if (names.length) return names.join(", ");
    return `${safeSelected.length} item${safeSelected.length > 1 ? "s" : ""} selected`;
  };

  return (
    <div
      className={`relative w-full flex flex-col multi-select-dropdown ${
        isOpen ? "z-[9999]" : "z-auto"
      }`}
      ref={dropdownRef}
    >
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        {required && <span className="text-error-600 text-red-500 mr-1">*</span>}
        {label}
      </label>

      <div className="relative">
        <div
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          className={`w-full p-2 text-left border shadow-sm min-h-[42px] ${className || "rounded-lg"}
                   ${
                     isDisabled
                       ? "bg-gray-100 cursor-not-allowed text-gray-400"
                       : "bg-white hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                   }`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`${
                safeSelected.length === 0
                  ? "text-gray-500"
                  : isDisabled
                    ? "text-gray-400"
                    : "text-gray-900"
              } truncate`}
            >
              {getSelectedText()}
            </span>
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform ${
                isDisabled ? "text-gray-300" : "text-gray-400"
              } ${isOpen ? "transform rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && !isDisabled && (
          <div className="absolute left-0 right-0 top-full mt-1 z-[9999] w-full min-w-[250px] bg-white border rounded-lg shadow-xl">
            <div className="p-2 border-b bg-white">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={createSearchChangeHandler((e) =>
                    setSearchTerm(e.target.value)
                  )}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchTerm("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[250px] overflow-y-auto overflow-x-hidden">
              {safeOptions.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  No modules found
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const optionValue = option[valueKey];
                  const isSelected = isValueSelected(optionValue);
                  const isPrimary =
                    String(primaryValue) === String(optionValue);

                  return (
                    <div
                      key={optionValue}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        isSelected
                          ? "bg-brand-50 border-l-4 border-brand-500"
                          : "border-l-4 border-transparent"
                      }`}
                      onClick={() => handleSelect(optionValue)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(optionValue)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium text-gray-900 truncate"
                              style={{ textTransform: "capitalize" }}
                            >
                              {option[displayKey]}
                            </div>
                            {option.secondary && (
                              <div className="text-sm text-gray-500 truncate">
                                {option.secondary}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && onPrimaryChange && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-600">
                              Primary
                            </span>
                            <input
                              type="radio"
                              name="primary-owner"
                              checked={isPrimary}
                              onChange={(e) => {
                                e.stopPropagation();
                                onPrimaryChange(
                                  isPrimary ? null : optionValue
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 flex-shrink-0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {safeSelected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {safeSelected.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm"
            >
              <span
                className="truncate max-w-[150px]"
                style={{ textTransform: "capitalize" }}
              >
                {getOptionLabel(value)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(value);
                }}
                className="ml-1 text-brand-500 hover:text-brand-700 flex-shrink-0"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  options: PropTypes.arrayOf(PropTypes.object),
  selectedValues: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  displayKey: PropTypes.string.isRequired,
  valueKey: PropTypes.string.isRequired,
  searchKeys: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  primaryValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPrimaryChange: PropTypes.func,
};

export default MultiSelectDropdown;
