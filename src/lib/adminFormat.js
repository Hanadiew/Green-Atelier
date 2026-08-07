// Shared display helpers for the admin pages. Kept out of admin.js so that file
// stays about data access.

export function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatMoney(value) {
  return `RM ${Number(value ?? 0).toFixed(2)}`
}

/** 'pending_review' -> 'Pending Review' */
export function titleCase(value) {
  if (!value) return '-'
  return String(value)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const ORDER_STATUS_VARIANT = {
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export const PAYMENT_STATUS_VARIANT = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'default',
}

export const REPORT_STATUS_VARIANT = {
  pending: 'warning',
  investigating: 'info',
  resolved: 'success',
  dismissed: 'default',
}

export const TRUSTCHECK_STATUS_VARIANT = {
  likely_consistent: 'success',
  needs_review: 'warning',
  insufficient_evidence: 'danger',
}