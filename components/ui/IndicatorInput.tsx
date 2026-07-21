"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface IndicatorInputProps {
  indicator: any
  defaultValue?: string
  onChange?: (val: string) => void
}

export function IndicatorInput({ indicator, defaultValue = "", onChange }: IndicatorInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    if (onChange) onChange(val)
  }

  const numVal = parseFloat(value)
  const isFilled = value.trim() !== "" && !isNaN(numVal)
  const isAbnormal = isFilled && (
    (indicator.minValue !== null && numVal < Number(indicator.minValue)) ||
    (indicator.maxValue !== null && numVal > Number(indicator.maxValue))
  )
  const isNormal = isFilled && !isAbnormal

  return (
    <div className="flex flex-col gap-1 w-full">
      <Label className="text-xs font-semibold text-gray-700">
        {indicator.label} {indicator.unit ? `(${indicator.unit})` : ""}
      </Label>
      <Input
        name={indicator.name}
        type="number"
        step="any"
        placeholder="—"
        value={value}
        onChange={handleChange}
        className={`mt-1 transition-colors ${isAbnormal ? 'border-red-400 focus-visible:ring-red-400 bg-red-50/30' : isNormal ? 'border-green-400 focus-visible:ring-green-400 bg-green-50/30' : ''}`}
      />
      
      <div className="flex justify-between items-center text-[10px] sm:text-xs mt-1">
        <span className="text-gray-400">
          {(indicator.minValue !== null || indicator.maxValue !== null) ? (
            <>Batas Normal: {indicator.minValue ?? '0'} - {indicator.maxValue ?? '∞'}</>
          ) : (
            <>Batas Normal: Tidak ditentukan</>
          )}
        </span>
        {isFilled && (
          <span className={`font-bold ${isAbnormal ? 'text-red-500' : 'text-green-600'}`}>
            {isAbnormal ? 'Abnormal' : 'Normal'}
          </span>
        )}
      </div>
    </div>
  )
}
