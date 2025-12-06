import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Tag, 
  Trash2, 
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BulkTaggingToolbarProps {
  selectedCount: number;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onDelete: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
  existingTags: string[];
}

export function BulkTaggingToolbar({
  selectedCount,
  onAddTag,
  onRemoveTag,
  onDelete,
  onClearSelection,
  onSelectAll,
  totalCount,
  existingTags,
}: BulkTaggingToolbarProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isRemoveTagOpen, setIsRemoveTagOpen] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag("");
      setIsAddTagOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="sticky top-0 z-10 bg-primary text-primary-foreground rounded-lg p-3 mb-4 shadow-lg"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                {selectedCount} selected
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                {selectedCount === totalCount ? (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Select All ({totalCount})
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Tag */}
              <Popover open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Add tag to selected</h4>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter tag name"
                        className="h-8"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button size="sm" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    {existingTags.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                          Quick add existing tags:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {existingTags.slice(0, 5).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => {
                                onAddTag(tag);
                                setIsAddTagOpen(false);
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Remove Tag */}
              {existingTags.length > 0 && (
                <Popover open={isRemoveTagOpen} onOpenChange={setIsRemoveTagOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Remove Tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Remove tag from selected</h4>
                      <div className="flex flex-wrap gap-1">
                        {existingTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              onRemoveTag(tag);
                              setIsRemoveTagOpen(false);
                            }}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-primary-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearSelection}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
