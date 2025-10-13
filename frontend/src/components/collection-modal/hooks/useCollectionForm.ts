import { useState } from "react";
import { toast } from "sonner";

export interface Member {
  id: string;
  identifier: string;
  type: "email" | "phone";
  name: string;
}

export interface CollectionFormData {
  title: string;
  description: string;
  goal: string;
  withdrawalType: string;
  splitEqually: "yes" | "no";
  paymentMode: "unico" | "recurrente";
  period: string;
  endDate: string;
  members: Member[];
}

interface UseCollectionFormProps {
  initialData?: Partial<CollectionFormData>;
}

export function useCollectionForm({ initialData }: UseCollectionFormProps = {}) {
  const [formData, setFormData] = useState<CollectionFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    goal: initialData?.goal || "",
    withdrawalType: initialData?.withdrawalType || "al100",
    splitEqually: initialData?.splitEqually || "no",
    paymentMode: initialData?.paymentMode || "unico",
    period: initialData?.period || "mensual",
    endDate: initialData?.endDate || "",
    members: initialData?.members || [],
  });

  const updateField = <K extends keyof CollectionFormData>(
    field: K,
    value: CollectionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1 && !formData.title.trim()) {
      toast.error("El nombre de la colecta es requerido");
      return false;
    }
    if (step === 2 && (!formData.goal || parseFloat(formData.goal) <= 0)) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }
    return true;
  };

  const addMember = (identifier: string): boolean => {
    if (!identifier.trim()) {
      toast.error("Ingresa un celular o correo electrónico");
      return false;
    }

    const isEmail = identifier.includes("@");
    const isPhone = /^[0-9\s\-+()]+$/.test(identifier);

    if (!isEmail && !isPhone) {
      toast.error("Ingresa un correo o número de teléfono válido");
      return false;
    }

    if (formData.members.some((m) => m.identifier === identifier)) {
      toast.error("Este miembro ya fue añadido");
      return false;
    }

    const member: Member = {
      id: Date.now().toString(),
      identifier,
      type: isEmail ? "email" : "phone",
      name: identifier,
    };

    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, member],
    }));

    toast.success(`${identifier} añadido correctamente`);
    return true;
  };

  const removeMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
    toast.success("Miembro eliminado");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      goal: "",
      withdrawalType: "al100",
      splitEqually: "no",
      paymentMode: "unico",
      period: "mensual",
      endDate: "",
      members: [],
    });
  };

  return {
    formData,
    updateField,
    validateStep,
    addMember,
    removeMember,
    resetForm,
  };
}
