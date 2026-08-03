<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex justify-end">
      <button
        @click="showCreate = !showCreate"
        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        {{ showCreate ? 'Close' : 'New promo code' }}
      </button>
    </div>

    <div v-if="showCreate" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 class="font-bold text-gray-900">New promo code</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Code</label>
          <input
            v-model="form.code"
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
        {{ saving ? 'Saving...' : 'Create' }}
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
    >
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Discount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Min spend</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Used</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Valid until</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="promo in codes" :key="promo.code" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <p class="font-mono font-medium text-gray-900">{{ promo.code }}</p>
              <p v-if="promo.description" class="text-xs text-gray-500">{{ promo.description }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900">
                {{ promo.discountType === 'percent' ? `${promo.discountValue}%` : formatMoney(promo.discountValue) }}
              </p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ formatMoney(promo.minSubtotal) }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">
                {{ promo.timesUsed }}{{ promo.usageLimit ? ` / ${promo.usageLimit}` : '' }}
              </p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-gray-600">{{ formatDate(promo.validUntil) }}</p>
            </td>
            <td class="px-6 py-4">
              <AdminBadge
                :label="promo.isActive ? 'Active' : 'Inactive'"
                :variant="promo.isActive ? 'success' : 'default'"
                size="sm"
              />
            </td>
            <td class="px-6 py-4">
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
const perPage = 20

const showCreate = ref(false)
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

watch(page, fetchCodes)
onMounted(fetchCodes)

async function fetchCodes() {
  loading.value = true
  error.value = null

  try {
    const result = await getPromoCodes({ page: page.value, perPage })
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
    await createPromoCode({
      code: form.value.code.trim().toUpperCase(),
      description: form.value.description.trim() || null,
      discount_type: form.value.discountType,
      discount_value: Number(form.value.discountValue),
      min_subtotal: Number(form.value.minSubtotal) || 0,
      usage_limit: form.value.usageLimit || null,
      valid_until: form.value.validUntil || null,
    })
    form.value = emptyForm()
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