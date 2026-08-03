<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="search"
            type="text"
            placeholder="Brand name..."
            @keyup.enter="runSearch"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="showCreate = true"
            class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Add brand
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreate" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 class="font-bold text-gray-900">New brand</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            :placeholder="slugFromName"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
          <input
            v-model="form.logoUrl"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <p v-if="formError" class="text-sm text-red-700">{{ formError }}</p>
      <div class="flex gap-2">
        <button
          @click="submitBrand"
          :disabled="saving || !form.name.trim()"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Create' }}
        </button>
        <button
          @click="cancelCreate"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>

    <AdminTableFrame
      :loading="loading"
      :error="error"
      :empty="brands.length === 0"
      loading-text="Loading brands..."
      empty-text="No brands found"
      :page="page"
      :per-page="perPage"
      :total="total"
      @update:page="page = $event"
    >
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Brand</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="brand in brands" :key="brand.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="brand.logo_url"
                  :src="brand.logo_url"
                  :alt="brand.name"
                  class="w-8 h-8 rounded object-contain bg-gray-50"
                />
                <p class="font-medium text-gray-900">{{ brand.name }}</p>
              </div>
            </td>
            <td class="px-6 py-4"><p class="text-sm text-gray-600">{{ brand.slug }}</p></td>
            <td class="px-6 py-4">
              <AdminBadge
                :label="brand.is_active ? 'Active' : 'Hidden'"
                :variant="brand.is_active ? 'success' : 'default'"
                size="sm"
              />
            </td>
            <td class="px-6 py-4">
              <button
                @click="toggleActive(brand)"
                :disabled="togglingId === brand.id"
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium disabled:opacity-50"
              >
                {{ brand.is_active ? 'Hide' : 'Activate' }}
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
import { getAdminBrands, createBrand, updateBrand } from '../../lib/admin.js'

const brands = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const page = ref(1)
const total = ref(0)
const perPage = 20

const showCreate = ref(false)
const saving = ref(false)
const formError = ref(null)
const togglingId = ref(null)
const form = ref({ name: '', slug: '', logoUrl: '' })

const slugFromName = computed(() =>
  form.value.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''),
)

watch(page, fetchBrands)
onMounted(fetchBrands)

function runSearch() {
  if (page.value === 1) fetchBrands()
  else page.value = 1
}

async function fetchBrands() {
  loading.value = true
  error.value = null

  try {
    const result = await getAdminBrands({ search: search.value, page: page.value, perPage })
    brands.value = result.brands
    total.value = result.total
  } catch (err) {
    error.value = 'Failed to load brands'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function cancelCreate() {
  showCreate.value = false
  formError.value = null
  form.value = { name: '', slug: '', logoUrl: '' }
}

async function submitBrand() {
  saving.value = true
  formError.value = null

  try {
    await createBrand(
      form.value.name.trim(),
      form.value.slug.trim() || slugFromName.value,
      form.value.logoUrl.trim() || null,
    )
    cancelCreate()
    await fetchBrands()
  } catch (err) {
    // name and slug both carry a unique index.
    formError.value = err.code === '23505' ? 'That brand or slug already exists.' : err.message
  } finally {
    saving.value = false
  }
}

async function toggleActive(brand) {
  togglingId.value = brand.id
  error.value = null

  try {
    await updateBrand(brand.id, { is_active: !brand.is_active })
    brand.is_active = !brand.is_active
  } catch (err) {
    error.value = err.message
  } finally {
    togglingId.value = null
  }
}
</script>