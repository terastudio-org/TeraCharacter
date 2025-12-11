import { auth } from "@/server/auth";
import { AICharacterGrid } from "@/components/ai-character-grid-enhanced";
import { Search, Settings } from 'lucide-react';
import CreateCharacterCardMarketing from "@/components/create-character-card-marketing";
import SignInButton from "@/components/signin-button";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ProviderSelector from "@/components/provider-selector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const runtime = "edge";

export default async function Page() {
  const session = await auth();

  console.log("userID: ", session?.user?.id)
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
        <div className="py-8 text-white w-full overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-6">
            <div className="flex items-center space-x-3">
              {session?.user ?
                <div className="flex md:flex-col items-center gap-2">
                  <h1 className="text-lg font-light text-black dark:text-white">Welcome back!</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {session?.user?.name?.[0] || 'G'}
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {session?.user?.name || 'Guest'}
                    </p>
                  </div> 
                </div>
                : (
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-black dark:text-white">Welcome to TeraCharacter</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Create and chat with AI characters</p>
                    </div>
                    <SignInButton />
                  </div>
                )
              }
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Characters"
                className="w-full md:w-64 py-2 px-10 bg-white dark:bg-neutral-800 text-black dark:text-white rounded-full text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            {/* Settings Sheet */}
            <div className="mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    AI Settings
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">AI Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure your AI providers and model preferences
                      </p>
                    </div>
                    <ProviderSelector />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <AICharacterGrid />
            <CreateCharacterCardMarketing />
          </div>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}