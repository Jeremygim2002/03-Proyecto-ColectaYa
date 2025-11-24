"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/string";
import { getDaysRemaining } from "@/utils/date";

interface CollectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  progress: number;
  goal: number;
  status: "active" | "completed" | "closed";
  deadline?: string;
  memberCount?: number;
}

const statusConfig = {
  active: {
    label: "En curso",
    variant: "default" as const,
    className: "bg-success text-success-foreground",
  },
  completed: {
    label: "Completado",
    variant: "secondary" as const,
    className: "bg-primary text-primary-foreground",
  },
  closed: {
    label: "Cerrada",
    variant: "outline" as const,
    className: "bg-muted text-muted-foreground",
  },
};

export function CollectCard({
  id,
  title,
  description,
  imageUrl,
  ownerName,
  ownerAvatar,
  progress,
  goal,
  status,
  deadline,
  memberCount = 0,
}: CollectCardProps) {
  const percentage = Math.round((progress / goal) * 100);
  const config = statusConfig[status];
  const daysRemaining = getDaysRemaining(deadline);

  return (
    <Link to={`/collections/${id}`} className="block">
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="group overflow-hidden p-0 gap-0">
          <div className="flex flex-col sm:flex-row">
            {/* Imagen */}
            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-48">
              {imageUrl ? (
                <motion.img
                  src={imageUrl}
                  alt={`Imagen de colecta: ${title}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-primary">
                  <span className="text-4xl font-bold text-primary-foreground opacity-50" aria-hidden="true">
                    {getInitials(title)}
                  </span>
                </div>
              )}
              {/* Status*/}
              <Badge className={`absolute left-3 top-3 shadow-sm ${config.className}`}>
                {config.label}
              </Badge>
            </div>

            {/* Contenido */}
            <div className="flex flex-1 flex-col justify-between p-4 md:p-5">
              {/* Header */}
              <div>
                <motion.h3
                  className="mb-2 text-base md:text-lg font-bold text-foreground line-clamp-2"
                  whileHover={{ color: "hsl(var(--primary))" }}
                  transition={{ duration: 0.2 }}
                >
                  {title}
                </motion.h3>
                <p className="mb-4 line-clamp-2 text-xs md:text-sm text-muted-foreground">
                  {description}
                </p>
              </div>

              {/* Progreso */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between text-sm">
                  <div>
                    <span className="text-base md:text-lg font-bold text-foreground">
                      S/ {progress.toLocaleString("es-PE")}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {" "}/ S/ {goal.toLocaleString("es-PE")}
                    </span>
                  </div>
                  <span className="text-sm md:text-base font-semibold text-primary">
                    {percentage}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2" aria-label={`Progreso: ${percentage}%`} />

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-muted-foreground">
                  {/* Owner */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={ownerAvatar} alt={`Avatar de ${ownerName}`} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(ownerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-[120px] sm:max-w-none">{ownerName}</span>
                  </div>

                  {/* Miembros */}
                  {memberCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{memberCount} {memberCount === 1 ? "miembro" : "miembros"}</span>
                    </div>
                  )}

                  {/* Fecha final */}
                  {daysRemaining && status === "active" && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {daysRemaining === "Vencido" ? (
                          <span className="text-destructive font-medium">{daysRemaining}</span>
                        ) : (
                          <span>Quedan {daysRemaining}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
