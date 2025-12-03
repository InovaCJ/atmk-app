"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
    value: string
    label: string
}

interface CreatableComboboxProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    emptyText?: string
}

export function CreatableCombobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    emptyText = "No option found.",
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {value
                        ? (options.find((option) => option.value === value)?.label || value)
                        : <span className="text-muted-foreground">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={placeholder} value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>
                            <div className="p-1">
                                <div
                                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => {
                                        if (inputValue.trim()) {
                                            onChange(inputValue)
                                            setOpen(false)
                                            setInputValue("")
                                        }
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar "{inputValue}"
                                </div>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value)
                                        setOpen(false)
                                        setInputValue("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
