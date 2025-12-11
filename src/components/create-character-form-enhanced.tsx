"use client"

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Globe, Sparkles, Wand2, Settings, Eye } from 'lucide-react';
import Link from 'next/link';
import { SubmitButton } from '@/app/new/submit-button';
import { characters } from '@/server/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function CreateCharacterFormEnhanced({ 
  action, 
  character, 
  editMode = false 
}: { 
  action: (formData: FormData) => void, 
  character?: typeof characters.$inferSelect, 
  editMode?: boolean 
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [descriptionCharCount, setDescriptionCharCount] = useState<number>(character?.description.length ?? 0);
  const [activeTab, setActiveTab] = useState('basic');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (character) {
      setPreviewUrl(character.avatar_image_url ?? "/default-avatar.jpg")
    }
  }, [character])

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 5MB limit");
        setPreviewUrl(null);
        toast.error("File size exceeds 5MB limit");
        event.target.value = ''; // Reset the input
      } else {
        setFileError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          toast.success("Avatar preview updated!");
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 5MB limit");
        toast.error("File size exceeds 5MB limit");
      } else {
        setFileError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          toast.success("Avatar preview updated!");
        };
        reader.readAsDataURL(file);
      }
    } else {
      toast.error("Please upload an image file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-900/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowLeft size={20} />
            <span>Back to Characters</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editMode ? 'Edit Character' : 'Create New Character'}
            </h1>
          </div>
        </motion.div>

        <form action={action} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                AI Behavior
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Character Avatar
                  </CardTitle>
                  <CardDescription>
                    Upload an image that represents your character. Drag and drop or click to select.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-dashed transition-all ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {previewUrl ? (
                      <motion.img 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={previewUrl} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Upload size={32} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={!editMode}
                    />
                  </div>
                  {fileError && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-sm text-center"
                    >
                      {fileError}
                    </motion.p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Max file size: 5MB • Supported: JPG, PNG, GIF
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Character Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Albert Einstein, Sherlock Holmes, Your Custom Character"
                      className="text-base"
                      required
                      defaultValue={character ? character.name : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline" className="text-sm font-medium">
                      Character Tagline *
                    </Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      placeholder="A short, catchy description that captures your character's essence"
                      className="text-base"
                      required
                      defaultValue={character ? character.tagline : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Character Description *
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {descriptionCharCount} characters
                      </Badge>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your character's personality, background, expertise, and how they should behave in conversations. Be detailed and specific."
                      className="min-h-32 text-base"
                      required
                      defaultValue={character ? character.description : ""}
                      onKeyUp={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        setDescriptionCharCount(target.value.length);
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Tip: Be detailed about your character's personality, knowledge, speaking style, and behavioral traits.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="greeting" className="text-sm font-medium">
                      Initial Greeting *
                    </Label>
                    <Input
                      id="greeting"
                      name="greeting"
                      placeholder="e.g. Hello! I'm Albert Einstein. I'm excited to discuss physics, relativity, and the wonders of the universe with you. What would you like to explore today?"
                      className="text-base"
                      required
                      defaultValue={character ? character.greeting : ""}
                    />
                    <p className="text-xs text-gray-500">
                      This is the first message your character will send when someone starts a conversation.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Visibility:</strong> Public - All characters are public for now
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Behavior Tab */}
            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Response Settings
                  </CardTitle>
                  <CardDescription>
                    Fine-tune how your character responds to conversations. These settings affect creativity and response style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Temperature</Label>
                      <Badge variant="secondary">
                        {character?.temperature ?? 1.0}
                      </Badge>
                    </div>
                    <input
                      type="range"
                      name="temperature"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue={character?.temperature ?? 1.0}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Predictable (0.0)</span>
                      <span>Creative (2.0)</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Controls response variety. Lower = more consistent, Higher = more creative and diverse.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Top P</Label>
                      <Badge variant="secondary">
                        {character?.top_p ?? 1.0}
                      </Badge>
                    </div>
                    <input
                      type="range"
                      name="top_p"
                      min="0"
                      max="1"
                      step="0.05"
                      defaultValue={character?.top_p ?? 1.0}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Focused (0.0)</span>
                      <span>Diverse (1.0)</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Limits token choices to top percentage. Affects response creativity.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Top K</Label>
                      <Badge variant="secondary">
                        {character?.top_k ?? 0}
                      </Badge>
                    </div>
                    <input
                      type="range"
                      name="top_k"
                      min="0"
                      max="100"
                      step="1"
                      defaultValue={character?.top_k ?? 0}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>All choices (0)</span>
                      <span>Limited (100)</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Limits token choices to top K options. 0 considers all possible tokens.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Frequency Penalty</Label>
                        <Badge variant="secondary">
                          {character?.frequency_penalty ?? 0.0}
                        </Badge>
                      </div>
                      <input
                        type="range"
                        name="frequency_penalty"
                        min="-2"
                        max="2"
                        step="0.1"
                        defaultValue={character?.frequency_penalty ?? 0.0}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500">
                        Controls repetition based on frequency. Positive reduces repetition.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Presence Penalty</Label>
                        <Badge variant="secondary">
                          {character?.presence_penalty ?? 0.0}
                        </Badge>
                      </div>
                      <input
                        type="range"
                        name="presence_penalty"
                        min="-2"
                        max="2"
                        step="0.1"
                        defaultValue={character?.presence_penalty ?? 0.0}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500">
                        Adjusts repetition of used tokens. Positive encourages new topics.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Max Tokens</Label>
                      <Badge variant="secondary">
                        {character?.max_tokens ?? 600}
                      </Badge>
                    </div>
                    <input
                      type="range"
                      name="max_tokens"
                      min="50"
                      max="2000"
                      step="50"
                      defaultValue={character?.max_tokens ?? 600}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Short (50)</span>
                      <span>Long (2000)</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Maximum length of generated responses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Advanced Configuration
                  </CardTitle>
                  <CardDescription>
                    Additional settings for advanced users who want more control over character behavior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Repetition Penalty</Label>
                      <Input
                        type="number"
                        name="repetition_penalty"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue={character?.repetition_penalty ?? 1.0}
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500">
                        Controls repetition in generated text. Higher values reduce repetition.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Min P</Label>
                      <Input
                        type="number"
                        name="min_p"
                        min="0"
                        max="1"
                        step="0.01"
                        defaultValue={character?.min_p ?? 0.0}
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500">
                        Minimum probability for tokens to be considered.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Top A</Label>
                    <Input
                      type="number"
                      name="top_a"
                      min="0"
                      max="1"
                      step="0.01"
                      defaultValue={character?.top_a ?? 0.0}
                      className="text-base"
                    />
                    <p className="text-xs text-gray-500">
                      Alternative to Top P for nucleus sampling.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-6"
          >
            <SubmitButton editMode={editMode} />
          </motion.div>
        </form>
      </div>
    </div>
  );
}