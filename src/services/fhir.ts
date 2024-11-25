import { type FhirConfig } from '../types/fhir';

export async function testFhirConnection(config: FhirConfig): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json'
    };

    if (config.useAuth) {
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      } else if (config.username && config.password) {
        headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
      }
    }

    // Try to fetch the server's capability statement
    const response = await fetch(`${config.baseUrl}/metadata`, { headers });
    
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    return data.resourceType === 'CapabilityStatement';
  } catch (error) {
    console.error('FHIR connection test failed:', error);
    return false;
  }
}

export async function fetchFhirData(
  config: FhirConfig, 
  resourceType: string, 
  id?: string,
  search?: string
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/fhir+json',
    'Accept': 'application/fhir+json'
  };

  if (config.useAuth) {
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.username && config.password) {
      headers['Authorization'] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
    }
  }

  let url = `${config.baseUrl}/${resourceType}`;
  if (id) {
    url += `/${id}`;
  } else if (search) {
    url += `?${search}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`FHIR API error: ${response.statusText}`);
  }

  const data = await response.json();

  // If it's already a Bundle (search result), return it
  if (data.resourceType === 'Bundle') {
    return data;
  }
  
  // If it's a single resource, wrap it in a Bundle
  return {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: [{
      resource: data
    }]
  };
}