/**
 * Runtime Type Safety Hook
 *
 * This hook fetches doctype metadata at runtime and provides type-safe field access.
 * Useful for handling custom fields dynamically without regenerating types.
 */

// import { useDoctype } from '@frappe-ui/neobrutalism' // Deprecated in apps/web
import { useFrappeGet } from '@/lib/hooks/useFrappeCall'
import { useMemo } from 'react'

export interface FieldMeta {
  fieldname: string
  fieldtype: string
  label: string
  reqd?: number
  options?: string
  description?: string
  hidden?: number
  read_only?: number
  default?: any
  is_custom_field?: number
}

export interface DoctypeFields {
  fields: Record<string, FieldMeta>
  getField: (fieldname: string) => FieldMeta | undefined
  hasField: (fieldname: string) => boolean
  getRequiredFields: () => FieldMeta[]
  getCustomFields: () => FieldMeta[]
  isFieldRequired: (fieldname: string) => boolean
  getFieldOptions: (fieldname: string) => string[] | undefined
  isLoading: boolean
  error: any
}

/**
 * Hook to get runtime doctype field metadata
 *
 * @example
 * ```typescript
 * const { fields, hasField, isFieldRequired } = useDoctypeFields('Lead')
 *
 * // Check if custom field exists before using
 * if (hasField('custom_field_1')) {
 *   // Safe to use custom_field_1
 * }
 *
 * // Get field options for Select field
 * const statusOptions = getFieldOptions('status')
 * ```
 */
export function useDoctypeFields(doctype: string): DoctypeFields {
  // Use TanStack Query to fetch metadata
  const { data: meta, isLoading, error } = useFrappeGet<{ fields: FieldMeta[] }>(
    'frappe.desk.form.load.getdoctype',
    { doctype }
  )

  const doctypeFields = useMemo(() => {
    // If no fields, return empty state
    // Note: getdoctype returns { docs: [ { fields: [...] } ] } usually, but useFrappeGet returns message.
    // Actually standard frappe.client.get_value doesn't get full meta.
    // We should use 'frappe.desk.form.load.getdoctype' which returns a complex object.
    // Or better, use `frappe.client.get` on 'DocType'.

    const fieldsList = (meta as any)?.docs?.[0]?.fields || (meta as any)?.fields || []

    if (!fieldsList || fieldsList.length === 0) {
      return {
        fields: {},
        getField: () => undefined,
        hasField: () => false,
        getRequiredFields: () => [],
        getCustomFields: () => [],
        isFieldRequired: () => false,
        getFieldOptions: () => undefined,
        isLoading,
        error
      }
    }

    // Convert array to map for faster lookups
    const fieldsMap: Record<string, FieldMeta> = {}
    fieldsList.forEach((field: any) => {
      if (field.fieldname) {
        fieldsMap[field.fieldname] = field
      }
    })

    return {
      fields: fieldsMap,

      getField: (fieldname: string) => fieldsMap[fieldname],

      hasField: (fieldname: string) => fieldname in fieldsMap,

      getRequiredFields: () =>
        fieldsList.filter((f: any) => f.reqd === 1),

      getCustomFields: () =>
        fieldsList.filter((f: any) =>
          f.fieldname?.startsWith('custom_') || f.is_custom_field
        ),

      isFieldRequired: (fieldname: string) =>
        fieldsMap[fieldname]?.reqd === 1,

      getFieldOptions: (fieldname: string) => {
        const field = fieldsMap[fieldname]
        if (field?.fieldtype === 'Select' && field.options) {
          return field.options.split('\n').filter(Boolean).map((o: string) => o.trim())
        }
        return undefined
      },
      isLoading,
      error
    }
  }, [meta, isLoading, error])

  return doctypeFields
}

/**
 * Type-safe document with runtime field checking
 *
 * @example
 * ```typescript
 * function LeadForm() {
 *   const { fields, hasField } = useDoctypeFields('Lead')
 *   const { doc } = useDoc<Lead>({ doctype: 'Lead', name: 'LEAD-001' })
 *
 *   return (
 *     <>
 *       <Input value={doc.lead_name} />
 *
 *       {hasField('custom_source_detail') && (
 *         <Input value={doc.custom_source_detail} />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export function useSafeDocumentFields<T extends Record<string, any>>(
  doctype: string,
  document: T | null
) {
  const { fields, hasField, getField } = useDoctypeFields(doctype)

  return {
    fields,
    hasField,
    getField,

    /**
     * Safely get field value with fallback
     */
    getValue: (fieldname: string, fallback?: any) => {
      if (!document || !hasField(fieldname)) {
        return fallback
      }
      return document[fieldname] ?? fallback
    },

    /**
     * Get all field values that exist in both doc and metadata
     */
    getValidFields: () => {
      if (!document) return {}

      const validFields: Record<string, any> = {}
      Object.keys(document).forEach(key => {
        if (hasField(key)) {
          validFields[key] = document[key]
        }
      })
      return validFields
    },

    /**
     * Check if document has all required fields filled
     */
    hasRequiredFields: () => {
      if (!document) return false

      const requiredFields = Object.values(fields).filter(f => f.reqd === 1)
      return requiredFields.every(field => {
        const value = document[field.fieldname]
        return value !== null && value !== undefined && value !== ''
      })
    },
  }
}
