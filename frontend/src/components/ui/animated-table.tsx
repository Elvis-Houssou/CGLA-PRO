/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table"

// Animation variants pour les éléments du tableau
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

// Composants animés
const AnimatedTableRow = motion(TableRow)
const AnimatedTableBody = motion(TableBody)

interface AnimatedTableProps {
  headers: string[]
  renderRow: (item: any, index: number) => ReactNode
  data: any[]
  tableKey?: number
  className?: string
}

export function AnimatedTable({ headers, renderRow, data, tableKey = 0, className = "" }: AnimatedTableProps) {
  return (
    <motion.div key={tableKey} initial="hidden" animate="visible" variants={tableVariants} className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <AnimatedTableBody variants={tableVariants}>
          {data.map((item, index) => (
            <AnimatedTableRow key={index} variants={rowVariants} custom={index}>
              {renderRow(item, index)}
            </AnimatedTableRow>
          ))}
        </AnimatedTableBody>
      </Table>
    </motion.div>
  )
}
