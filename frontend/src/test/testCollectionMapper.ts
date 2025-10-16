// Test file to validate the collection creation flow
// This file will be removed after testing

import { mapFormToApiData, validateFormData } from '../utils/collectionMapper';
import type { CollectionFormData } from '../components/collection-modal/hooks/useCollectionForm';

// Test data that simulates a filled form
const testFormData: CollectionFormData = {
  title: "Viaje Grupal a Europa",
  description: "Colecta para financiar nuestro viaje de fin de año",
  goal: "5000",
  withdrawalType: "alporciento", // Should map to THRESHOLD
  splitEqually: "no",
  paymentMode: "unico",
  period: "mensual",
  endDate: "2025-06-15",
  members: [
    {
      id: "1",
      identifier: "juan@example.com",
      type: "email",
      name: "Juan Pérez",
    },
    {
      id: "2",
      identifier: "maria@example.com", 
      type: "email",
      name: "María García",
    }
  ],
};

// Test the mapping function
console.log('Testing form data mapping...');
const apiData = mapFormToApiData(testFormData);
console.log('Mapped API data:', apiData);

// Test validation
const validation = validateFormData(testFormData);
console.log('Validation result:', validation);

// Expected output should be:
// {
//   title: "Viaje Grupal a Europa",
//   description: "Colecta para financiar nuestro viaje de fin de año",
//   goalAmount: 5000,
//   ruleType: "THRESHOLD",
//   ruleValue: 50,
//   isPrivate: true, // because it has members
//   deadlineAt: "2025-06-15T00:00:00.000Z"
// }