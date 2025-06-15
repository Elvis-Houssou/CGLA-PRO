"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Fonction pour générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = []

    // Toujours afficher la première page
    pageNumbers.push(1)

    // Calculer la plage de pages à afficher autour de la page actuelle
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Ajouter des ellipses si nécessaire avant la plage
    if (startPage > 2) {
      pageNumbers.push("ellipsis-start")
    }

    // Ajouter les pages dans la plage
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    // Ajouter des ellipses si nécessaire après la plage
    if (endPage < totalPages - 1) {
      pageNumbers.push("ellipsis-end")
    }

    // Toujours afficher la dernière page si elle existe
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <PaginationPrevious
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Page précédente"
      />

      {getPageNumbers().map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return <PaginationEllipsis key={`ellipsis-${index}`} disabled />
        }

        return (
          <PaginationItem
            key={page}
            active={currentPage === page}
            onClick={() => onPageChange(Number(page))}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </PaginationItem>
        )
      })}

      <PaginationNext
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
      />
    </div>
  )
}

interface PaginationItemProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  "aria-label"?: string
  "aria-current"?: "page" | undefined
}

export function PaginationItem({
  active,
  onClick,
  children,
  "aria-label": ariaLabel,
  "aria-current": ariaCurrent,
}: PaginationItemProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </Button>
  )
}

interface PaginationEllipsisProps {
  disabled?: boolean
}

export function PaginationEllipsis({ disabled }: PaginationEllipsisProps) {
  return (
    <Button variant="outline" size="icon" disabled={disabled}>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )
}

interface PaginationPreviousProps {
  onClick: () => void
  disabled?: boolean
  "aria-label": string
}

export function PaginationPrevious({ onClick, disabled, "aria-label": ariaLabel }: PaginationPreviousProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
  )
}

interface PaginationNextProps {
  onClick: () => void
  disabled?: boolean
  "aria-label": string
}

export function PaginationNext({ onClick, disabled, "aria-label": ariaLabel }: PaginationNextProps) {
  return (
    <Button variant="outline" size="icon" onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}

export const PaginationContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center justify-center space-x-2", className)} {...props} />
  },
)
PaginationContent.displayName = "PaginationContent"

export const PaginationLink = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => {
    return <Button ref={ref} variant="outline" size="icon" className={className} {...props} />
  },
)
PaginationLink.displayName = "PaginationLink"
