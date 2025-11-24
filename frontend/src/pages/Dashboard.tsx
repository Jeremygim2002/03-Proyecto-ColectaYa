"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CollectCard } from "@/components/common/CollectCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { CollectionSkeletonGrid } from "@/components/common/skeletons";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { useCollections } from "@/hooks/queries";
import { useDebounced } from "@/hooks/useReact19";
import { getDashboardMetadata } from "@/lib/utils";
import { mapCollectionStatus } from "@/constants/status";
import type { CollectionStatus } from "@/types";

type FilterType = "all" | "active" | "completed";

export default function Dashboard() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // React 19: Debounced search for non-blocking UI
  const { deferredValue: deferredSearch, isPending: isSearchPending } = useDebounced(searchQuery, 300);

  // TanStack Query: Fetch collections with filters
  const { data: collectionsData, isLoading, isError } = useCollections({
    status: filter === "all" ? undefined : (filter as CollectionStatus),
    search: deferredSearch,
  });

  const collections = collectionsData?.collections || [];
  
    // Stats from real data
  const stats = {
    total: collections.length,
    active: collections.filter((c) => c.status === "ACTIVE").length,
    completed: collections.filter((c) => c.status === "COMPLETED").length,
    totalRaised: collections.reduce((sum, c) => sum + c.currentAmount, 0),
  };

  return (
    <>
      {/* React 19 Document Metadata */}
      {getDashboardMetadata()}
      
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
          {/* Header */}
          <motion.div
            className="mb-6 md:mb-8 space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold">
              Mis Colectas 
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Gestiona tus colectas grupales</p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">
                Todas <span className="ml-1 text-xs">({stats.total})</span>
              </TabsTrigger>
              <TabsTrigger value="active">
                Activas <span className="ml-1 text-xs">({stats.active})</span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas <span className="ml-1 text-xs">({stats.completed})</span>
              </TabsTrigger>
            </TabsList>

            {/* Search with React 19 deferred value indicator */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar colectas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 transition-colors duration-200 focus:ring-2 focus:ring-primary/50"
                aria-label="Buscar colectas"
              />
              {isSearchPending && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <TabsContent value={filter} className="space-y-6">
              {/* Loading State with Skeleton */}
              {isLoading ? <CollectionSkeletonGrid count={6} /> : null}

              {/* Error State */}
              {isError && (
                <ErrorState
                  icon={<Filter className="h-12 w-12 md:h-16 md:w-16" />}
                  title="Error al cargar colectas"
                  description="Por favor, intenta recargar la página"
                />
              )}

              {/* Collections List */}
              {!isLoading && !isError && collections.length > 0 && (
                <div className="grid gap-4 md:gap-6">
                  {collections.map((collection, index) => {
                    const cardStatus = mapCollectionStatus(collection.status);

                    return (
                      <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <CollectCard
                          id={collection.id}
                          title={collection.title}
                          description={collection.description || 'Sin descripción'}
                          imageUrl={collection.imageUrl}
                          ownerId={collection.ownerId}
                          ownerName="Usuario" // TODO: Add creator info to Collection type
                          ownerAvatar=""
                          progress={collection.currentAmount}
                          goal={collection.goalAmount}
                          status={cardStatus}
                          deadline={collection.deadlineAt}
                          memberCount={collection.contributorsCount || 0}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && collections.length === 0 && (
                <EmptyState
                  icon={<Filter className="h-12 w-12 md:h-16 md:w-16" />}
                  title="No se encontraron colectas"
                  description={searchQuery ? "Intenta con otros términos de búsqueda" : "Crea tu primera vaquita para comenzar"}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
    </>
  );
}
