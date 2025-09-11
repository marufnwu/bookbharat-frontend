'use client';

import { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
  value?: any;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  selectedFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onApplyFilters,
  onClearFilters,
  totalResults
}: MobileFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(selectedFilters);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleFilterChange = (groupId: string, value: any, type: string) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'checkbox') {
        if (!newFilters[groupId]) {
          newFilters[groupId] = [];
        }
        const index = newFilters[groupId].indexOf(value);
        if (index > -1) {
          newFilters[groupId] = newFilters[groupId].filter((v: string) => v !== value);
        } else {
          newFilters[groupId] = [...newFilters[groupId], value];
        }
        if (newFilters[groupId].length === 0) {
          delete newFilters[groupId];
        }
      } else if (type === 'radio') {
        newFilters[groupId] = value;
      } else if (type === 'range') {
        newFilters[groupId] = value;
      }
      
      return newFilters;
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).reduce((count, key) => {
      const value = localFilters[key];
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    }, 0);
  };

  const activeCount = getActiveFilterCount();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden animate-slide-up">
        <div className="bg-background rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold">Filters</h2>
              {activeCount > 0 && (
                <Badge variant="secondary" className="px-2 py-0.5">
                  {activeCount} active
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Groups */}
          <div className="flex-1 overflow-y-auto">
            {filters.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const hasActiveFilters = localFilters[group.id] && 
                (Array.isArray(localFilters[group.id]) ? localFilters[group.id].length > 0 : true);

              return (
                <div key={group.id} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{group.label}</span>
                      {hasActiveFilters && (
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {group.type === 'checkbox' && group.options?.map((option) => {
                        const isChecked = localFilters[group.id]?.includes(option.value);
                        
                        return (
                          <label
                            key={option.value}
                            className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleFilterChange(group.id, option.value, 'checkbox')}
                                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary"
                              />
                              <span className="text-sm">{option.label}</span>
                            </div>
                            {option.count !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                ({option.count})
                              </span>
                            )}
                          </label>
                        );
                      })}

                      {group.type === 'radio' && group.options?.map((option) => {
                        const isChecked = localFilters[group.id] === option.value;
                        
                        return (
                          <label
                            key={option.value}
                            className="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name={group.id}
                                checked={isChecked}
                                onChange={() => handleFilterChange(group.id, option.value, 'radio')}
                                className="h-4 w-4 text-primary border-input focus:ring-2 focus:ring-primary"
                              />
                              <span className="text-sm">{option.label}</span>
                            </div>
                            {option.count !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                ({option.count})
                              </span>
                            )}
                          </label>
                        );
                      })}

                      {group.type === 'range' && (
                        <div className="space-y-3 py-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              placeholder={`Min ${group.label}`}
                              value={localFilters[group.id]?.min || ''}
                              onChange={(e) => handleFilterChange(group.id, {
                                ...localFilters[group.id],
                                min: e.target.value ? Number(e.target.value) : undefined
                              }, 'range')}
                              className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                              type="number"
                              placeholder={`Max ${group.label}`}
                              value={localFilters[group.id]?.max || ''}
                              onChange={(e) => handleFilterChange(group.id, {
                                ...localFilters[group.id],
                                max: e.target.value ? Number(e.target.value) : undefined
                              }, 'range')}
                              className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border safe-bottom">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleClear}
                disabled={activeCount === 0}
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear all
              </button>
              {totalResults !== undefined && (
                <span className="text-sm text-muted-foreground">
                  {totalResults} results
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="min-h-touch"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="min-h-touch"
              >
                Apply Filters
                {activeCount > 0 && ` (${activeCount})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface MobileSortDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function MobileSortDrawer({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelect
}: MobileSortDrawerProps) {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden animate-slide-up">
        <div className="bg-background rounded-t-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Sort By</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Options */}
          <div className="py-2 safe-bottom">
            {options.map((option) => {
              const isSelected = option.value === selectedValue;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    isSelected && 'font-medium text-primary'
                  )}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}