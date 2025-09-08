import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner une option...",
  searchPlaceholder = "Rechercher...",
  className,
  disabled = false,
  error = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Calculate dropdown position
  const updateDropdownPosition = React.useCallback(() => {
    if (triggerRef.current && open) {
      const rect = triggerRef.current.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (open) {
      updateDropdownPosition();

      // Update position on every frame when dropdown is open
      let animationFrameId: number;

      const updatePosition = () => {
        updateDropdownPosition();
        animationFrameId = requestAnimationFrame(updatePosition);
      };

      animationFrameId = requestAnimationFrame(updatePosition);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [open, updateDropdownPosition]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchValue("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, updateDropdownPosition]);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setOpen(false);
    setSearchValue("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ zIndex: open ? 9998 : "auto" }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "w-full justify-between px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 bg-white hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-0 text-left",
          error
            ? "border-red-300 focus:border-red-500 shadow-red-100 focus:shadow-red-200"
            : "border-gray-200 focus:border-blue-500 hover:border-gray-300 focus:shadow-blue-100",
          error ? "focus:shadow-lg" : "focus:shadow-md",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start">
            {selectedOption ? (
              <>
                <span className="font-medium">{selectedOption.label}</span>
                {selectedOption.description && (
                  <span className="text-xs text-gray-500">
                    {selectedOption.description}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform",
              open && "transform rotate-180"
            )}
          />
        </div>
      </button>

      {open &&
        dropdownPosition &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              left: dropdownPosition.left,
              top: dropdownPosition.top,
              width: dropdownPosition.width,
              zIndex: 50000,
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              maxHeight: "240px",
              overflow: "hidden",
            }}
          >
            {/* Search Input */}
            <div
              className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2"
              style={{ zIndex: 50001 }}
            >
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 text-sm outline-none placeholder:text-muted-foreground bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto overflow-x-hidden">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Aucun résultat trouvé.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0",
                      value === option.value && "bg-blue-50 hover:bg-blue-100"
                    )}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-xs text-gray-500 truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-blue-600 ml-2 flex-shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
