"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Check, X, ChevronDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface MultiSelectComboboxProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  onSearchChange?: (searchValue: string) => void; // Nouvelle prop pour la recherche API
  placeholder?: string;
  searchPlaceholder?: string;
  maxItems?: number;
  className?: string;
  error?: boolean;
  loading?: boolean; // Nouvelle prop pour l'état de chargement
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  onSearchChange, // Nouvelle prop
  placeholder = "Sélectionner des éléments...",
  searchPlaceholder = "Rechercher ou saisir un nouveau nom...",
  maxItems = 5,
  className,
  error = false,
  loading = false, // Nouvelle prop
}: MultiSelectComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Filter options based on search term (pour le filtrage local si pas d'API)
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Gérer la recherche avec debounce
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    
    // Si onSearchChange est fourni, utiliser l'API
    if (onSearchChange) {
      // Annuler le timeout précédent
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Créer un nouveau timeout pour le debounce
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(newSearchTerm);
      }, 300);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Ne pas fermer si on clique sur le container principal
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // Ne pas fermer si on clique sur le dropdown portal
      const dropdownElement = document.querySelector(
        '[data-dropdown-portal="true"]'
      );
      if (dropdownElement && dropdownElement.contains(target)) {
        return;
      }

      setIsOpen(false);
      setSearchTerm("");
    };

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Écouter tous les événements de scroll
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleSelect = (option: string) => {
    if (!value.includes(option) && value.length < maxItems) {
      onChange([...value, option]);
    } else if (value.includes(option)) {
      // Si l'option est déjà sélectionnée, la désélectionner
      onChange(value.filter((item) => item !== option));
    }
    setSearchTerm("");
    // Réinitialiser la recherche API si nécessaire
    if (onSearchChange) {
      onSearchChange("");
    }
    // Garder le focus mais ne pas fermer le dropdown
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleRemove = (optionToRemove: string) => {
    onChange(value.filter((item) => item !== optionToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      if (onSearchChange) {
        onSearchChange("");
      }
    }
  };

  // Dropdown component pour le portal
  const renderDropdown = () => {
    if (!isOpen) return null;

    // Utiliser les options filtrées ou toutes les options selon la présence d'onSearchChange
    const displayOptions = onSearchChange ? options : filteredOptions;

    return (
      <div
        data-dropdown-portal="true"
        className="absolute z-[99999] bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          position: "fixed",
        }}
        onMouseDown={(e) => {
          // Empêcher la propagation pour éviter la fermeture
          e.stopPropagation();
        }}
      >
        {/* Indicateur de chargement */}
        {loading && (
          <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            Recherche en cours...
          </div>
        )}

        {/* Options existantes */}
        {!loading && displayOptions.length > 0 ? (
          displayOptions.map((option) => {
            const isSelected = value.includes(option);
            const isDisabled = !isSelected && value.length >= maxItems;

            return (
              <div
                key={option}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer flex items-center gap-2",
                  isSelected && "bg-accent text-accent-foreground",
                  !isSelected && !isDisabled && "hover:bg-accent/50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isDisabled) {
                    handleSelect(option);
                  }
                }}
              >
                <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center">
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </div>
                <span>{option}</span>
              </div>
            );
          })
        ) : !loading ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {searchTerm ? `Aucun résultat trouvé pour "${searchTerm}"` : "Aucun résultat trouvé"}
          </div>
        ) : null}

        {!loading && value.length >= maxItems && (
          <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border">
            Maximum {maxItems} éléments sélectionnés
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          error && "border-destructive focus-within:ring-destructive",
          className
        )}
        onClick={handleOpen}
      >
        <div className="flex flex-wrap gap-1 mb-1">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="text-xs px-2 py-1 bg-accent/80 text-accent-foreground hover:bg-accent/90"
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-accent-foreground/70 hover:text-accent-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Search className={cn(
            "h-4 w-4",
            loading ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : searchPlaceholder}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            onFocus={handleOpen}
          />
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Render dropdown via portal */}
      {typeof window !== "undefined" &&
        createPortal(renderDropdown(), document.body)}
    </div>
  );
}