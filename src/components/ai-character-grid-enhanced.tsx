import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Heart, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Sparkles,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { db } from '@/server/db';
import { characters } from '@/server/db/schema';
import { desc, like, and, gt } from 'drizzle-orm';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to safely truncate text with emojis
const safeTruncate = (str: string, n: number) => {
  if (str.length <= n) return str;
  const subString = str.slice(0, n - 1);
  return (subString.match(/[\uD800-\uDBFF]$/) ? subString.slice(0, -1) : subString) + '…';
};

const AnimatedCharacterCard = ({ character, index }: { character: any, index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const truncatedTagline = useMemo(() => safeTruncate(character.tagline, 80), [character.tagline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Link href={`/chat/${character.id}`} passHref className="block">
        <Card className="w-full bg-white dark:bg-neutral-800 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 dark:hover:from-neutral-800 dark:hover:to-blue-900/20 transition-all duration-300 overflow-hidden border-0 shadow-md hover:shadow-xl">
          <CardContent className="p-0">
            {/* Header with gradient */}
            <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Character stats */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {character.interactionCount.toLocaleString()}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                  <Heart className="w-3 h-3 mr-1" />
                  {character.likeCount.toLocaleString()}
                </Badge>
              </div>
              
              {/* Popular badge for high interaction characters */}
              {character.interactionCount > 100 && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-yellow-500 text-yellow-900 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
            </div>

            {/* Avatar and content */}
            <div className="p-4 -mt-12 relative">
              <div className="w-24 h-24 mx-auto mb-3 relative">
                <motion.div 
                  className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {!imageLoaded && !imageError && (
                    <Skeleton className="w-full h-full rounded-full" />
                  )}
                  <img 
                    src={imageError ? "/default-avatar.jpg" : (character.avatar_image_url ?? "/default-avatar.jpg")} 
                    alt={character.name} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                </motion.div>
                
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {character.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-words overflow-hidden">
                  {truncatedTagline}
                </p>
                
                {/* Tags */}
                {character.tags && JSON.parse(character.tags).length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {JSON.parse(character.tags).slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {JSON.parse(character.tags).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{JSON.parse(character.tags).length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex gap-2 justify-center pt-2">
                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

async function getCharacters(filters: {
  search?: string;
  sortBy?: 'popular' | 'recent' | 'trending';
  limit?: number;
}) {
  const { search, sortBy = 'popular', limit = 50 } = filters;
  
  let query = db.query.characters;
  
  if (search) {
    // Add search condition
    query = query.findMany({
      where: and(
        like(characters.name, `%${search}%`),
        gt(characters.interactionCount, 0)
      ),
      orderBy: [
        sortBy === 'popular' ? desc(characters.interactionCount) :
        sortBy === 'recent' ? desc(characters.createdAt) :
        desc(characters.interactionCount)
      ],
      limit,
    });
  } else {
    query = query.findMany({
      orderBy: [
        sortBy === 'popular' ? desc(characters.interactionCount) :
        sortBy === 'recent' ? desc(characters.createdAt) :
        desc(characters.interactionCount)
      ],
      limit,
    });
  }
  
  return await query;
}

const CharacterSkeleton = () => (
  <Card className="w-full bg-white dark:bg-neutral-800 overflow-hidden">
    <CardContent className="p-0">
      <div className="relative h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
      <div className="p-4 -mt-12 relative">
        <div className="w-24 h-24 mx-auto mb-3">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export async function AICharacterGrid() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'trending'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  
  const latestCharacters = await getCharacters({
    search,
    sortBy,
    limit: 100
  });

  return (
    <div className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-lg">
      {/* Header with search and filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI Characters
          </h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {latestCharacters.length} characters
          </Badge>
        </div>
        
        {/* Search and filters */}
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64 bg-gray-50 dark:bg-neutral-800"
            />
          </div>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <Button
              variant={sortBy === 'popular' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('popular')}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Popular
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('recent')}
            >
              <Clock className="w-4 h-4 mr-1" />
              Recent
            </Button>
          </div>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Characters grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CharacterSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {latestCharacters.map((character, index) => (
              <AnimatedCharacterCard 
                key={character.id} 
                character={character} 
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {latestCharacters.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No characters found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search or filters to find more characters.
          </p>
          <Button asChild>
            <Link href="/new">Create your first character</Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}