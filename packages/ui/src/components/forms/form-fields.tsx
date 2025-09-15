"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"

interface FormFieldProps {
  name: string
  label: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  disabled,
  error,
  value,
  onChange,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={error ? "border-red-500 focus:border-red-500" : ""}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface TextAreaFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
  className?: string
}

export function TextAreaField({
  name,
  label,
  placeholder,
  required,
  disabled,
  error,
  value,
  onChange,
  rows = 3,
  className = "",
}: TextAreaFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={error ? "border-red-500 focus:border-red-500" : ""}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  value?: string
  onChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}

export function SelectField({
  name,
  label,
  placeholder,
  required,
  disabled,
  error,
  value,
  onChange,
  options,
  className = "",
}: SelectFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? "border-red-500 focus:border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface CheckboxFieldProps {
  name: string
  label: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function CheckboxField({
  name,
  label,
  description,
  checked,
  onChange,
  disabled,
  className = "",
}: CheckboxFieldProps) {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Checkbox
        id={name}
        name={name}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label htmlFor={name} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

interface RadioFieldProps {
  name: string
  label: string
  value?: string
  onChange?: (value: string) => void
  options: Array<{ value: string; label: string; description?: string }>
  disabled?: boolean
  className?: string
}

export function RadioField({
  name,
  label,
  value,
  onChange,
  options,
  disabled,
  className = "",
}: RadioFieldProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-medium cursor-pointer"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
