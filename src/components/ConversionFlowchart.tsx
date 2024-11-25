import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Paper, Typography, Box } from '@mui/material';
import type { FhirBundle } from '../models/fhir';

interface ConversionFlowchartProps {
  input: FhirBundle;
  output: Record<string, unknown> | null;
}

export function ConversionFlowchart({ input, output }: ConversionFlowchartProps) {
  const flowchartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initFlowchart = async () => {
      if (!flowchartRef.current || !input) return;

      const resources = input?.entry?.map((e) => e.resource.resourceType) || [];
      const outputTables = Object.keys(output || {});

      const resourceToTableMap: Record<string, string> = {
        Patient: 'person',
        Condition: 'condition_occurrence',
        Observation: 'measurement',
        Procedure: 'procedure_occurrence',
        MedicationRequest: 'drug_exposure',
        Encounter: 'visit_occurrence',
        CarePlan: 'care_site',
        Organization: 'care_site',
        Location: 'location',
        Practitioner: 'provider',
        MedicationDispense: 'drug_exposure',
        MedicationAdministration: 'drug_exposure',
        AllergyIntolerance: 'condition_occurrence',
        DiagnosticReport: 'note',
        DocumentReference: 'note',
        Device: 'device_exposure',
        Immunization: 'drug_exposure',
        Coverage: 'payer_plan_period'
      };

      const generateFlowchart = () => {
        let diagram = 'graph LR\n';
        
        // Style definitions
        diagram += '  classDef fhirClass fill:#f9f,stroke:#333,stroke-width:2px;\n';
        diagram += '  classDef omopClass fill:#bbf,stroke:#333,stroke-width:2px;\n';
        
        // FHIR Resources subgraph
        diagram += '  subgraph FHIR[FHIR Resources]\n';
        resources.forEach((resource: string, index: number) => {
          diagram += `    ${resource}${index}[${resource}]:::fhirClass\n`;
        });
        diagram += '  end\n\n';
        
        // OMOP Tables subgraph
        diagram += '  subgraph OMOP[OMOP CDM Tables]\n';
        const uniqueOmopTables = new Set(outputTables);
        // Add any missing OMOP tables that could be mapped to
        resources.forEach(resource => {
          const mappedTable = resourceToTableMap[resource];
          if (mappedTable) {
            uniqueOmopTables.add(mappedTable);
          }
        });
        
        Array.from(uniqueOmopTables).sort().forEach(table => {
          diagram += `    ${table}[${table.toUpperCase()}]:::omopClass\n`;
        });
        diagram += '  end\n\n';

        // Add connections with specific styling
        resources.forEach((resource: string, index: number) => {
          const mappedTable = resourceToTableMap[resource];
          if (mappedTable) {
            diagram += `  ${resource}${index} -->|Transform| ${mappedTable}\n`;
          }
        });

        // Add linkStyle for better visibility
        diagram += '  linkStyle default stroke:#2196f3,stroke-width:2px;\n';

        return diagram;
      };

      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          padding: 15,
          useMaxWidth: true,
          rankSpacing: 100,
          nodeSpacing: 50,
          diagramPadding: 8
        }
      });

      try {
        flowchartRef.current.innerHTML = '';
        const id = `flowchart-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, generateFlowchart());
        flowchartRef.current.innerHTML = svg;

        // Style the SVG
        const svgElement = flowchartRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.maxHeight = '800px';
          svgElement.style.minHeight = '400px';
        }
      } catch (error) {
        console.error('Failed to render flowchart:', error);
      }
    };

    initFlowchart();
  }, [input, output]);

  if (!input) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mt: 4, overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom>
        FHIR to OMOP Conversion Flow
      </Typography>
      <Box sx={{ 
        width: '100%',
        overflowX: 'auto',
        '& svg': {
          minWidth: '800px',
          maxWidth: '100%'
        }
      }}>
        <div ref={flowchartRef} />
      </Box>
    </Paper>
  );
}