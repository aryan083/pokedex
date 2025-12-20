import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const shortcuts = [
  { keys: ['←', '→', '↑', '↓'], description: 'Navigate grid' },
  { keys: ['Enter'], description: 'Open Pokémon details' },
  { keys: ['Shift', 'C'], description: 'Toggle compare mode' },
  { keys: ['C'], description: 'Add/remove from compare (in compare mode)' },
  { keys: ['Esc'], description: 'Exit compare mode' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-30 p-3 rounded-full bg-secondary hover:bg-secondary/80 border border-border shadow-lg transition-all hover:scale-105"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Keyboard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50"
                >
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <kbd className={cn(
                          "px-2 py-1 text-xs font-mono rounded bg-background border border-border shadow-sm",
                          key.length === 1 && "min-w-[28px] text-center"
                        )}>
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-muted-foreground">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-secondary border border-border">?</kbd> anywhere to toggle this help
            </p>
          </div>
        </div>
      )}
    </>
  );
}
