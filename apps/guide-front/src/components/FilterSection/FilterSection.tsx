'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './FilterSection.module.css';

interface FilterState {
  category: string;
  difficulty: string;
  duration: string;
  rating: string;
}

interface FilterSectionProps {
  onFilterChange: (filters: FilterState) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ onFilterChange }) => {
  const t = useTranslations('FilterSection');
  const [filters, setFilters] = useState<FilterState>({
    category: t('allCategories'),
    difficulty: t('allLevels'),
    duration: t('anyDuration'),
    rating: t('anyRating')
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filterOptions = {
    category: [
      t('allCategories'),
      t('pcBuilding'),
      t('monitorSetup'),
      t('keyboardAssembly'),
      t('audioSetup'),
      t('networking'),
      t('gamingSetup'),
      t('workstation')
    ],
    difficulty: [
      t('allLevels'),
      t('beginner'),
      t('intermediate'),
      t('advanced'),
      t('expert')
    ],
    duration: [
      t('anyDuration'),
      t('under30min'),
      t('30to60min'),
      t('1to2hours'),
      t('2to4hours'),
      t('4plusHours')
    ],
    rating: [
      t('anyRating'),
      t('45plusStars'),
      t('40plusStars'),
      t('35plusStars'),
      t('30plusStars')
    ]
  };

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setOpenDropdown(null);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: t('allCategories'),
      difficulty: t('allLevels'),
      duration: t('anyDuration'),
      rating: t('anyRating')
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getDefaultFilterValue = (key: string): string => {
    switch (key) {
      case 'category': return t('allCategories');
      case 'difficulty': return t('allLevels');
      case 'duration': return t('anyDuration');
      case 'rating': return t('anyRating');
      default: return '';
    }
  };

  return (
    <section className={styles.filterSection}>
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersHeader}>
            <h3 className={styles.filtersTitle}>{t('filters')}</h3>
            <button className={styles.clearButton} onClick={clearAllFilters}>
              {t('clearAll')}
            </button>
          </div>

          <div className={styles.filtersGrid}>
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  {t(key as keyof typeof filterOptions)}
                </label>

                <div className={styles.customSelect}>
                  <button
                    className={`${styles.selectTrigger} ${
                      openDropdown === key ? styles.activeTrigger : ''
                    }`}
                    onClick={() =>
                      setOpenDropdown(openDropdown === key ? null : key)
                    }
                  >
                    {filters[key as keyof FilterState]}
                    <span className={styles.arrow}>▼</span>
                  </button>

                  {openDropdown === key && (
                    <ul className={styles.selectDropdown}>
                      {options.map(option => (
                        <li
                          key={option}
                          className={`${styles.selectOption} ${
                            filters[key as keyof FilterState] === option
                              ? styles.active
                              : ''
                          }`}
                          onClick={() =>
                            handleFilterChange(key as keyof FilterState, option)
                          }
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Active Filters Display */}
          <div className={styles.activeFilters}>
            {Object.entries(filters).map(([key, value]) => {
              if (
                value === t('allCategories') || 
                value === t('allLevels') || 
                value === t('anyDuration') || 
                value === t('anyRating')
              ) return null;
              
              return (
                <div key={key} className={styles.activeFilter}>
                  <span className={styles.activeFilterText}>{value}</span>
                  <button
                    className={styles.removeFilter}
                    onClick={() =>
                      handleFilterChange(
                        key as keyof FilterState,
                        getDefaultFilterValue(key)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;