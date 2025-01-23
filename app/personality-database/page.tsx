'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// This would come from your database
const personalities = [
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    type: 'INTJ',
    category: 'Entrepreneur',
    image: '/personalities/elon-musk.jpg',
    description: 'Entrepreneur, CEO of Tesla and SpaceX',
  },
  {
    id: 'sasuke-uchiha',
    name: 'Sasuke Uchiha',
    type: 'INTJ',
    category: 'Fictional',
    image: '/personalities/sasuke-uchiha.jpg',
    description: 'Character from Naruto series',
  },
  // Add more personalities...
];

const categories = ['All', 'Entrepreneur', 'Fictional', 'Historical', 'Artist', 'Scientist'];
const types = ['All', 'INTJ', 'ENTJ', 'INTP', 'ENTP', 'INFJ', 'ENFJ', 'INFP', 'ENFP'];

export default function PersonalityDatabase() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const filteredPersonalities = personalities.filter((personality) => {
    const matchesSearch = personality.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || personality.category === selectedCategory;
    const matchesType = selectedType === 'All' || personality.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Personality Database</h1>
          <p className="text-gray-400">
            Explore and chat with personalities based on MBTI types
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-12">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search personalities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 bg-transparent border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Categories */}
            <div className="flex-1 space-y-2">
              <label className="text-sm text-gray-400">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      ${selectedCategory === category 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* MBTI Types */}
            <div className="flex-1 space-y-2">
              <label className="text-sm text-gray-400">MBTI Type</label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                    className={`
                      ${selectedType === type 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonalities.map((personality) => (
            <Link
              key={personality.id}
              href={`/personality-database/${personality.id}`}
              className="group"
            >
              <div className="rounded-lg border border-white/20 overflow-hidden hover:border-white/40 transition-colors">
                <div className="aspect-[3/2] relative">
                  <Image
                    src={personality.image}
                    alt={personality.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{personality.name}</h3>
                    <span className="px-2 py-1 text-sm bg-white/10 rounded-full">
                      {personality.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{personality.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}