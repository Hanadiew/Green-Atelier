<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-end">
      <button
        @click="toggleForm"
        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        {{ showCreate ? 'Close' : 'New promo code' }}
      </button>
    </div>

    <div v-if="showCreate" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="font-bold text-gray-900">
          {{ editingCode ? `Edit ${editingCode}` : 'New promo code' }}
        </h3>
        <button v-if="editingCode" @click="cancelEdit"
          class="text-sm text-gray-500 hover:text-gray-700">Cancel edit</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Code</label>
          <input
            v-model="form.code"
            :disabled="Boolean(editingCode)"
            type="text"
            placeholder="RAYA25"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            v-model="form.discountType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="percent">Percent</option>
            <option value="fixed">Fixed (RM)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <input
            v-model.number="form.discountValue"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Min subtotal</label>
          <input
            v-model.number="form.minSubtotal"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Usage limit</label>
          <input
            v-model.number="form.usageLimit"
            type="number"
            min="1"
            placeholder="unlimited"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Valid until</label>
          <input
            v-model="form.validUntil"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <p v-if="formError" class="text-sm text-red-700">{{ formError }}</p>
      <button
        @click="submitPromo"
        :disabled="saving || !canSubmit"
        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {{ saving ? 'Saving...' : editingCode ? 'Save changes' : 'Create' }}
      </button>
    </div>

    <AdminTableFrame
      :loading="loading"
      :error="error"
      :empty="codes.length === 0"
      loading-text="Loading promo codes..."
      empty-text="No promo codes"
      :page="page"
      :per-page="perPage"
      :total="total"
      @update:page="page = $event"
    @update:per-page="perPage = $event; page = 1"
    >
      <table class="w-full">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Min spend</th>
            <th>Used</th>
            <th>Valid until</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in codes" :key="promo.code">
            <td>
              <p class="font-mono font-medium text-gray-900">{{ promo.code }}</p>
              <p v-if="promo.description" class="text-xs text-gray-500">{{ promo.description }}</p>
            </td>
            <td>
              <p class="text-sm text-gray-900">
                {{ promo.discountType === 'percent' ? `${promo.discountValue}%` : formatMoney(promo.discountValue) }}
              </p>
            </td>
            <td>
              <p class="text-sm text-gray-600">{{ formatMoney(promo.minSubtotal) }}</p>
            </td>
            <td>
              <p class="text-sm text-gray-600">
                {{ promo.timesUsed }}{{ promo.usageLimit ? ` / ${promo.usageLimit}` : '' }}
              </p>
            </td>
            <td>
              <p class="text-sm text-gray-600">{{ formatDate(promo.validUntil) }}</p>
            </td>
            <td>
              <AdminBadge
                :label="promo.isActive ? 'Active' : 'Inactive'"
                :variant="promo.isActive ? 'success' : 'default'"
                size="sm"
              />
            </td>
            <td>
              <button
                @click="startEdit(promo)"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium mr-4"
              >
                Edit
              </button>
              <button
                @click="toggleActive(promo)"
                :disabled="togglingCode === promo.code"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50"
              >
                {{ promo.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </AdminTableFrame>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AdminBadge from '../../components/admin/AdminBadge.vue'
import AdminTableFrame from '../../components/admin/AdminTableFrame.vue'
import { getPromoCodes, createPromoCode, updatePromoCode } from '../../lib/admin.js'
import { formatDate, formatMoney } from '../../lib/adminFormat.js'

const codes = ref([])
const loading = ref(false)
const error = ref(null)
const page = ref(1)
const total = ref(0)
const perPage = ref(20)

const showCreate = ref(false)
// null when creating, the promo's code when editing an existing one.
const editingCode = ref(null)
const saving = ref(false)
const formError = ref(null)
const togglingCode = ref(null)

const emptyForm = () => ({
  code: '',
  description: '',
  discountType: 'percent',
  discountValue: null,
  minSubtotal: 0,
  usageLimit: null,
  validUntil: '',
})
const form = ref(emptyForm())

const canSubmit = computed(
  () => form.value.code.trim().length > 0 && Number(form.value.discountValue) > 0,
)

function toggleForm() {
  showCreate.value = !showCreate.value
  if (!showCreate.value) cancelEdit()
}

function startEdit(promo) {
  editingCode.value = promo.code
  formError.value = null
  form.value = {
    code: promo.code,
    description: promo.description ?? '',
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minSubtotal: promo.minSubtotal,
    usageLimit: promo.usageLimit,
    // The input is type=date, which needs YYYY-MM-DD rather than a timestamp.
    validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : '',
  }
  showCreate.value = true
}

function cancelEdit() {
  editingCode.value = null
  form.value = emptyForm()
  formError.value = null
}

watch([page, perPage], fetchCodes)
onMounted(fetchCodes)

async function fetchCodes() {
  loading.value = true
  error.value = null

  try {
    const result = await getPromoCodes({ page: page.value, perPage: perPage.value })
    codes.value = result.codes
    total.value = result.total
  } catch (err) {
    error.value = `Failed to load promo codes: ${err.message}`
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function submitPromo() {
  saving.value = true
  formError.value = null

  try {
    // The table has a `code = upper(code)` check constraint.
    const fields = {
      description: form.value.description.trim() || null,
      discount_type: form.value.discountType,
      discount_value: Number(form.value.discountValue),
      min_subtotal: Number(form.value.minSubtotal) || 0,
      usage_limit: form.value.usageLimit || null,
      valid_until: form.value.validUntil || null,
    }

    if (editingCode.value) {
      // The code itself is never updated: it is the primary key and placed orders
      // reference it, so changing it would orphan their promo_code.
      await updatePromoCode(editingCode.value, fields)
    } else {
      await createPromoCode({ ...fields, code: form.value.code.trim().toUpperCase() })
    }

    cancelEdit()
    showCreate.value = false
    await fetchCodes()
  } catch (err) {
    formError.value = err.code === '23505' ? 'That code already exists.' : err.message
  } finally {
    saving.value = false
  }
}

async function toggleActive(promo) {
  togglingCode.value = promo.code
  error.value = null

  try {
    await updatePromoCode(promo.code, { is_active: !promo.isActive })
    promo.isActive = !promo.isActive
  } catch (err) {
    error.value = err.message
  } finally {
    togglingCode.value = null
  }
}
</script>