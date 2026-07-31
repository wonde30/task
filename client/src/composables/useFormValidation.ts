import { reactive } from 'vue'

export interface ValidationRules {
  [key: string]: (value: any, allValues?: any) => string | undefined
}

export function useFormValidation<T extends Record<string, any>>(rules: ValidationRules) {
  const touched = reactive<Record<string, boolean>>({})
  const errors = reactive<Record<string, string>>({})

  function touch(field: keyof T) {
    touched[field as string] = true
    validate(field)
  }

  function validate(field: keyof T, allValues?: T): boolean {
    const rule = rules[field as string]
    if (!rule) return true

    const error = rule(allValues?.[field], allValues)
    if (error) {
      errors[field as string] = error
    } else {
      delete errors[field as string]
    }
    return !error
  }

  function validateAll(values: T): boolean {
    Object.keys(rules).forEach(field => {
      touched[field] = true
      validate(field as keyof T, values)
    })
    return Object.keys(errors).length === 0
  }

  function reset() {
    Object.keys(touched).forEach(k => { touched[k] = false })
    Object.keys(errors).forEach(k => { delete errors[k] })
  }

  return {
    touched,
    errors,
    touch,
    validate,
    validateAll,
    reset,
  }
}

export const TASK_VALIDATION_RULES: ValidationRules = {
  title: (value: string) => {
    const v = String(value || '').trim()
    if (!v) return 'Title is required'
    if (v.length < 2) return 'Title must be at least 2 characters'
    if (value && value.length > 150) return 'Title cannot exceed 150 characters'
    return undefined
  },
  description: (value: string) => {
    if (value && value.length > 1000) return 'Description cannot exceed 1000 characters'
    return undefined
  },
  end_date: (value: string, allValues: any) => {
    if (value && allValues?.start_date && new Date(value) <= new Date(allValues.start_date)) {
      return 'Due date must be after start date'
    }
    return undefined
  },
}