"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CollectCard } from "@/components/common/CollectCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, Loader2 } from "lucide-react";
import { useExploreCollections } from "@/hooks/queries";
import { useDebounced } from "@/hooks/useReact19";
import { getExploreMetadata, prefetchPage } from "@/lib/utils";
import type { CollectionStatus } from "@/types";

type FilterType = "all" | "active" | "completed";

export default function Explore() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // React 19: Debounced search with useDeferredValue
  const { deferredValue: deferredSearch, isPending: isSearchPending } = useDebounced(searchQuery, 300);
  
  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: Record<string, string> = {};
    
    if (deferredSearch) {
      apiFilters.search = deferredSearch;
    }
    
    if (filter !== "all") {
      apiFilters.status = filter;
    }
    
    return Object.keys(apiFilters).length > 0 ? apiFilters : undefined;
  }, [deferredSearch, filter]);
  
  // Fetch public collections with TanStack Query
  const { data, isLoading, error } = useExploreCollections(filters);

  // Get collections from API response
  const collections = data?.collections || [];
  
  // Map collection status to CollectCard status format
  const mapStatus = (status: CollectionStatus): "active" | "completed" => {
    if (status === "COMPLETED") return "completed";
    return "active"; // ACTIVE
  };
  
  // Stats for tabs
  const stats = {
    total: collections.length,
    active: collections.filter((c) => c.status === "ACTIVE").length,
    completed: collections.filter((c) => c.status === "COMPLETED").length,
  };
  
  // Handle prefetch on hover (React 19 pattern)
  const handleCardHover = (collectionId: string) => {
    prefetchPage(`/collection/${collectionId}`);
  };

  return (
    <>
      {/* React 19 Document Metadata */}
      {getExploreMetadata()}
      
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
          {/* Header */}
          <motion.div
            className="mb-6 md:mb-8 space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="flex items-center gap-2 text-2xl lg:text-3xl font-bold">
              <Globe className="h-7 w-7 lg:h-8 lg:w-8 text-accent" />
              Explorar Colectas
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Descubre vaquitas públicas y únete para contribuir</p>
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar colectas públicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-colors duration-200 focus:ring-2 focus:ring-primary/50"
              />
              {isSearchPending && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <TabsContent value={filter} className="space-y-6">
              {/* Loading State with Skeleton */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-48 w-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <motion.div
                  className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-8 md:p-12 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Globe className="mb-4 h-12 w-12 md:h-16 md:w-16 text-destructive/50" />
                  <h3 className="mb-2 text-lg md:text-xl font-semibold text-destructive">Error al cargar colectas</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Por favor, intenta de nuevo más tarde</p>
                </motion.div>
              ) : collections.length > 0 ? (
                <div className="grid gap-4 md:gap-6">
                  {collections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onMouseEnter={() => handleCardHover(collection.id)}
                    >
                      <CollectCard
                        id={collection.id}
                        title={collection.title}
                        description={collection.description}
                        imageUrl={collection.imageUrl}
                        ownerId={collection.ownerId}
                        ownerName="Usuario" // TODO: Agregar nombre de usuario al tipo Collection
                        ownerAvatar=""
                        progress={collection.currentAmount}
                        goal={collection.goalAmount}
                        status={mapStatus(collection.status)}
                        deadline={collection.deadlineAt}
                        memberCount={collection.contributorsCount || 0}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 md:p-12 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Globe className="mb-4 h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg md:text-xl font-semibold">No se encontraron colectas</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {searchQuery ? "Intenta con otros términos de búsqueda" : "No hay colectas públicas disponibles"}
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
    </>
  );
}
