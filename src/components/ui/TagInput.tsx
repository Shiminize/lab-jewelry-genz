"use client"

import * as React from "react"
import { X } from "lucide-react"

interface TagInputProps {
    id: string
    name: string
    defaultValue?: string[] // Accepts array of strings
    placeholder?: string
    label?: string
}

export function TagInput({ id, name, defaultValue = [], placeholder = "Add tag...", label }: TagInputProps) {
    // Initialize with the provided default tags
    const [tags, setTags] = React.useState<string[]>(defaultValue)
    const [inputValue, setInputValue] = React.useState("")

    // Update hidden input when tags change
    const hiddenInputValue = tags.join(",")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag()
        } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const addTag = () => {
        const trimmedInput = inputValue.trim().replace(/,/g, "")
        if (trimmedInput && !tags.includes(trimmedInput)) {
            setTags([...tags, trimmedInput])
            setInputValue("")
        }
    }

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Hidden input to store the comma-separated value for form submission */}
            <input type="hidden" name={name} id={id} value={hiddenInputValue} />

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle bg-surface-panel px-4 py-3 text-sm text-text-primary shadow-soft focus-within:ring-2 focus-within:ring-accent-secondary/40">
                {tags.map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-2.5 py-1 text-xs font-medium text-accent-primary"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-accent-primary/20 text-accent-primary focus:outline-none"
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent outline-none placeholder:text-text-muted min-w-[120px]"
                />
            </div>
            <p className="text-[0.65rem] text-text-secondary">
                Press enter or comma to add a tag. Backspace to remove.
            </p>
        </div>
    )
}
