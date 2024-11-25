import { useState, useEffect } from 'react';
import { type FhirConfig } from '../types/fhir';

const defaultConfig: FhirConfig = {
  baseUrl: 'https://hapi.fhir.org/baseR4',
  useAuth: false
};

export function useFhirConfig() {
  const [config, setConfig] = useState<FhirConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('fhirConfig');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Failed to parse FHIR config:', error);
        }
      }
      setLoading(false);
    };

    loadConfig();
  }, []);

  const saveConfig = (newConfig: FhirConfig) => {
    try {
      localStorage.setItem('fhirConfig', JSON.stringify(newConfig));
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Failed to save FHIR config:', error);
      return false;
    }
  };

  return {
    config,
    saveConfig,
    loading,
    isConfigured: !!config.baseUrl
  };
}