"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void
  className?: string
}

export interface SearchFilters {
  lido?: boolean
  importante?: boolean
  hasAnexos?: boolean
  dataInicio?: Date
  dataFim?: Date
}

export function EmailSearch({ onSearch, className }: EmailSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    onSearch(query, Object.keys(filters).length > 0 ? filters : undefined)
  }

  const handleClearFilters = () => {
    setFilters({})
    onSearch(query)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined)

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Buscar emails..."
          className="pl-10"
        />
      </div>

      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {Object.values(filters).filter((v) => v !== undefined).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{"Filtros Avançados"}</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-auto p-1 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  {"Limpar"}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unread"
                  checked={filters.lido === false}
                  onCheckedChange={(checked) => setFilters({ ...filters, lido: checked ? false : undefined })}
                />
                <Label htmlFor="unread" className="cursor-pointer">
                  {"Apenas não lidos"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="important"
                  checked={filters.importante === true}
                  onCheckedChange={(checked) => setFilters({ ...filters, importante: checked ? true : undefined })}
                />
                <Label htmlFor="important" className="cursor-pointer">
                  {"Apenas importantes"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments"
                  checked={filters.hasAnexos === true}
                  onCheckedChange={(checked) => setFilters({ ...filters, hasAnexos: checked ? true : undefined })}
                />
                <Label htmlFor="attachments" className="cursor-pointer">
                  {"Com anexos"}
                </Label>
              </div>

              <div className="space-y-2 border-t pt-3">
                <Label>{"Data de início"}</Label>
                <Calendar
                  mode="single"
                  selected={filters.dataInicio}
                  onSelect={(date) => setFilters({ ...filters, dataInicio: date })}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>{"Data de fim"}</Label>
                <Calendar
                  mode="single"
                  selected={filters.dataFim}
                  onSelect={(date) => setFilters({ ...filters, dataFim: date })}
                  className="rounded-md border"
                />
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full">
              {"Aplicar Filtros"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button onClick={handleSearch}>{"Buscar"}</Button>
    </div>
  )
}
