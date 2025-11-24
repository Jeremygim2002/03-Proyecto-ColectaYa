import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, X } from "lucide-react";
import type { Member } from "../hooks/useCollectionForm";
import { getInitials } from "@/utils/string";

interface MembersStepProps {
  members: Member[];
  onAddMember: (identifier: string) => boolean;
  onRemoveMember: (id: string) => void;
}

export function MembersStep({ members, onAddMember, onRemoveMember }: MembersStepProps) {
  const [newMember, setNewMember] = useState("");

  const handleAdd = () => {
    if (onAddMember(newMember)) {
      setNewMember("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Agregar miembros */}
      <div className="space-y-2">
        <Label htmlFor="newMember">Añadir miembros</Label>
        <div className="flex gap-2">
          <Input
            id="newMember"
            placeholder="Correo electrónico"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd} type="button" variant="secondary">
            Añadir
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Presiona Enter o haz clic en "Añadir" para agregar cada miembro
        </p>
      </div>

      {/* Lista de miembros*/}
      {members.length > 0 ? (
        <div className="space-y-3">
          <Label>Miembros añadidos ({members.length})</Label>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.identifier)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.identifier}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.type === "email" ? "Correo electrónico" : "Teléfono"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMember(member.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
          <Users className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No hay miembros añadidos</p>
          <p className="mt-1 text-xs text-muted-foreground">Puedes añadirlos ahora o más tarde</p>
        </div>
      )}
    </div>
  );
}
