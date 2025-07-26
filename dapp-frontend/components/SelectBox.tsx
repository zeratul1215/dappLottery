"use client";

import { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectBoxProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export default function SelectBox({
  options,
  value,
  onChange,
  placeholder = "请选择...",
  className = "",
  disabled = false,
  label,
}: SelectBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 获取当前选中选项的显示文本
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div ref={selectRef} className="relative">
        {/* 选择框显示区域 */}
        <button
          type="button"
          onClick={handleSelectClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full px-4 py-2 text-sm border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-200 text-left
            ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-900 hover:border-purple-400 cursor-pointer"
            }
            ${!selectedOption ? "text-gray-500" : "text-gray-900"}
          `}
        >
          <span className="block truncate">{displayText}</span>
        </button>

        {/* 下拉箭头 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* 下拉菜单 */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50
                    transition-colors duration-150
                    ${
                      option.value === value
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-medium"
                        : "text-gray-700"
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
