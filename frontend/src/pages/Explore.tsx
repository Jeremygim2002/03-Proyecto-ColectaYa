"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CollectCard } from "@/components/common/CollectCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Globe, Loader2 } from "lucide-react";
import { CollectionSkeletonGrid } from "@/components/common/skeletons";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { useExploreCollections } from "@/hooks/queries";
import { useDebounced } from "@/hooks/useReact19";
import { getExploreMetadata, prefetchPage } from "@/lib/utils";
import { mapCollectionStatus } from "@/constants/status";

type FilterType = "active" | "completed";

export default function Explore() {
  const [filter, setFilter] = useState<FilterType>("active");
  const [searchQuery, setSearchQuery] = useState("");
  
  // React 19: Debounced search with useDeferredValue
  const { deferredValue: deferredSearch, isPending: isSearchPending } = useDebounced(searchQuery, 300);
  
  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: Record<string, string> = {};
    
    if (deferredSearch) {
      apiFilters.search = deferredSearch;
    }
    
    // Convert to uppercase for backend validation
    apiFilters.status = filter.toUpperCase();
    
    return Object.keys(apiFilters).length > 0 ? apiFilters : undefined;
  }, [deferredSearch, filter]);
  
  // Fetch public collections with TanStack Query
  const { data, isLoading, error } = useExploreCollections(filters);

  // Fetch all collections for stats (without filter)
  const allFilters = useMemo(() => {
    return deferredSearch ? { search: deferredSearch } : undefined;
  }, [deferredSearch]);
  
  const { data: allData } = useExploreCollections(allFilters);

  // Get collections from API response
  const collections = data?.collections || [];
  const allCollections = allData?.collections || [];
  
  // Stats from all collections (not filtered by tab)
  const stats = {
    total: allCollections.length,
    active: allCollections.filter((c) => c.status === "ACTIVE").length,
    completed: allCollections.filter((c) => c.status === "COMPLETED").length,
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
              Explorar Colectas
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Descubre colectas públicas y únete para contribuir</p>
          </motion.div>

          {/* Search with React 19 deferred value indicator */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar colectas públicas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 transition-colors duration-200 focus:ring-2 focus:ring-primary/50"
              aria-label="Buscar colectas"
            />
            {isSearchPending && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Tabs */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)} className="space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="active">
                Activas <span className="ml-1 text-xs">({stats.active})</span>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completadas <span className="ml-1 text-xs">({stats.completed})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-6">
              {/* Loading State with Skeleton */}
              {isLoading ? (
                <CollectionSkeletonGrid count={6} />
              ) : error ? (
                <ErrorState
                  icon={<Globe className="h-12 w-12 md:h-16 md:w-16" />}
                  title="Error al cargar colectas"
                  description="Por favor, intenta de nuevo más tarde"
                />
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
                        description={collection.description || 'Sin descripción'}
                        imageUrl={collection.imageUrl}
                        ownerId={collection.ownerId}
                        ownerName={collection.owner?.name || "Usuario"}
                        ownerAvatar={collection.owner?.avatar || ""}
                        progress={collection.currentAmount}
                        goal={collection.goalAmount}
                        status={mapCollectionStatus(collection.status)}
                        deadline={collection.deadlineAt}
                        memberCount={collection.contributorsCount || 0}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Globe className="h-12 w-12 md:h-16 md:w-16" />}
                  title="No se encontraron colectas"
                  description={searchQuery ? "Intenta con otros términos de búsqueda" : "No hay colectas públicas disponibles"}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
    </>
  );
}
