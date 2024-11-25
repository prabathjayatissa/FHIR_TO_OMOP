export const sampleFhirData = {
  resourceType: 'Bundle',
  id: 'sample-bundle',
  type: 'collection',
  entry: [{
    fullUrl: 'urn:uuid:patient1',
    resource: {
      resourceType: 'Patient',
      id: 'patient1',
      identifier: [{
        system: 'http://hospital.example.org',
        value: 'P123456'
      }],
      active: true,
      gender: 'female',
      birthDate: '1970-01-01',
      name: [{
        use: 'official',
        family: 'Doe',
        given: ['Jane', 'Maria']
      }],
      address: [{
        use: 'home',
        line: ['123 Main St'],
        city: 'Boston',
        state: 'MA',
        postalCode: '02108',
        country: 'USA'
      }]
    }
  }, {
    fullUrl: 'urn:uuid:medreq1',
    resource: {
      resourceType: 'MedicationRequest',
      id: 'medreq1',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '860975',
          display: 'Amoxicillin 500mg capsule'
        }]
      },
      subject: {
        reference: 'Patient/patient1'
      },
      authoredOn: '2023-12-01'
    }
  }, {
    fullUrl: 'urn:uuid:meddisp1',
    resource: {
      resourceType: 'MedicationDispense',
      id: 'meddisp1',
      status: 'completed',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: '860975',
          display: 'Amoxicillin 500mg capsule'
        }]
      },
      subject: {
        reference: 'Patient/patient1'
      },
      whenHandedOver: '2023-12-01T10:00:00Z',
      quantity: {
        value: 21,
        unit: 'capsule',
        system: 'http://unitsofmeasure.org',
        code: 'cap'
      },
      daysSupply: {
        value: 7,
        unit: 'days',
        system: 'http://unitsofmeasure.org',
        code: 'd'
      }
    }
  }]
};