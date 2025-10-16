import type { CollectionFormData } from '@/components/collection-modal/hooks/useCollectionForm';
import type { CreateCollectionData, CollectionRuleType } from '@/types';

/**
 * Mapea los tipos de reglas del formulario a los tipos del backend
 */
export const mapRuleType = (withdrawalType: string): CollectionRuleType => {
  switch (withdrawalType) {
    case 'al100':
      return 'GOAL_ONLY';
    case 'alporciento':
      return 'THRESHOLD';
    case 'cuandoquiera':
      return 'ANYTIME';
    default:
      return 'GOAL_ONLY';
  }
};

/**
 * Convierte los datos del formulario a la estructura esperada por la API
 */
export const mapFormToApiData = (formData: CollectionFormData): CreateCollectionData => {
  const goalAmount = parseFloat(formData.goal) || 0;
  const ruleType = mapRuleType(formData.withdrawalType);
  
  // Calcular ruleValue basado en el tipo
  let ruleValue: number | undefined;
  if (ruleType === 'THRESHOLD') {
    // Para THRESHOLD, usar un valor por defecto del 50% si no se especifica
    ruleValue = 50;
  }

  // Calcular deadlineAt basado en endDate
  let deadlineAt: string | undefined;
  if (formData.endDate) {
    deadlineAt = new Date(formData.endDate).toISOString();
  }

  return {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    goalAmount,
    ruleType,
    ruleValue,
    isPrivate: formData.members.length > 0, // Privada si tiene miembros específicos
    deadlineAt,
  };
};

/**
 * Valida que los datos del formulario son correctos para enviar a la API
 */
export const validateFormData = (formData: CollectionFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push('El título es requerido');
  }

  const goalAmount = parseFloat(formData.goal);
  if (!goalAmount || goalAmount <= 0) {
    errors.push('El monto de la meta debe ser mayor a 0');
  }

  if (formData.endDate) {
    const endDate = new Date(formData.endDate);
    const now = new Date();
    if (endDate <= now) {
      errors.push('La fecha de finalización debe ser futura');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};