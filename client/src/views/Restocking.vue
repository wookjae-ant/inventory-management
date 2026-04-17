<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Budget card -->
    <div class="card budget-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('restocking.budgetCardTitle') }}</h3>
      </div>
      <div class="budget-display">
        {{ currencySymbol }}{{ budget.toLocaleString() }}
      </div>
      <div class="budget-controls">
        <input
          type="range"
          min="0"
          max="100000"
          step="1000"
          v-model.number="budget"
          class="budget-slider"
        />
        <input
          type="number"
          min="0"
          max="100000"
          step="1000"
          v-model.number="budget"
          class="budget-number-input"
        />
      </div>
      <p class="budget-hint">{{ t('restocking.budgetHint') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <template v-else>
      <!-- Recommendations table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.recommendationsTitle') }}</h3>
        </div>

        <div v-if="rows.length === 0" class="empty-state">
          {{ t('restocking.emptyState') }}
        </div>
        <div v-else class="table-container">
          <table class="restock-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.item') }}</th>
                <th>{{ t('restocking.table.trend') }}</th>
                <th class="col-num">{{ t('restocking.table.currentStock') }}</th>
                <th class="col-num">{{ t('restocking.table.forecast') }}</th>
                <th class="col-num">{{ t('restocking.table.unitCost') }}</th>
                <th class="col-qty">{{ t('restocking.table.quantity') }}</th>
                <th class="col-num">{{ t('restocking.table.subtotal') }}</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.sku">
                <td><code class="sku">{{ row.sku }}</code></td>
                <td>{{ row.item_name }}</td>
                <td>
                  <span :class="['badge', row.trend]">{{ row.trend }}</span>
                </td>
                <td class="col-num">{{ row.current_stock.toLocaleString() }}</td>
                <td class="col-num">{{ row.forecasted_demand.toLocaleString() }}</td>
                <td class="col-num">{{ currencySymbol }}{{ row.unit_cost.toLocaleString() }}</td>
                <td class="col-qty">
                  <input
                    type="number"
                    min="0"
                    :max="row.shortfall"
                    v-model.number="row.quantity"
                    class="qty-input"
                  />
                </td>
                <td class="col-num subtotal">
                  {{ currencySymbol }}{{ (row.unit_cost * row.quantity).toLocaleString() }}
                </td>
                <td class="col-action">
                  <button
                    class="remove-btn"
                    :title="t('restocking.remove')"
                    @click="removeRow(row.sku)"
                  >&#x2715;</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary bar -->
        <div v-if="rows.length > 0" class="summary-bar">
          <div class="stats-grid summary-stats">
            <div class="stat-card">
              <div class="stat-label">{{ t('restocking.allocatedTotal') }}</div>
              <div class="stat-value">{{ currencySymbol }}{{ allocatedTotal.toLocaleString() }}</div>
            </div>
            <div :class="['stat-card', remainingBudget < 0 ? 'danger' : 'success']">
              <div class="stat-label">{{ t('restocking.remainingBudget') }}</div>
              <div class="stat-value">{{ currencySymbol }}{{ remainingBudget.toLocaleString() }}</div>
            </div>
            <div class="stat-card info">
              <div class="stat-label">{{ t('restocking.itemsSelected') }}</div>
              <div class="stat-value">{{ activeRowCount }}</div>
            </div>
          </div>

          <div v-if="remainingBudget < 0" class="over-budget-warning">
            {{ t('restocking.overBudget') }}
          </div>

          <div v-if="confirmation" class="confirmation-banner">
            {{ confirmation }}
          </div>

          <div class="place-order-row">
            <button
              class="place-order-btn"
              :disabled="activeRowCount === 0 || allocatedTotal > budget || placing"
              @click="placeOrder"
            >
              {{ placing ? t('restocking.placingOrder') : t('restocking.placeOrder') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Restocking',
  setup() {
    const router = useRouter()
    const { t, currentCurrency } = useI18n()
    const { selectedLocation, selectedCategory } = useFilters()

    const currencySymbol = computed(() => currentCurrency.value === 'JPY' ? '¥' : '$')

    const budget = ref(25000)
    // rows is a mutable clone of response.items so edits don't trigger refetch
    const rows = ref([])
    const loading = ref(false)
    const error = ref(null)
    const placing = ref(false)
    const confirmation = ref(null)

    // Recomputed locally from rows so quantity edits don't trigger API calls
    const allocatedTotal = computed(() =>
      rows.value.reduce((sum, r) => sum + r.unit_cost * r.quantity, 0)
    )
    const remainingBudget = computed(() => budget.value - allocatedTotal.value)
    const activeRowCount = computed(() => rows.value.filter(r => r.quantity > 0).length)

    // Keep a reference to the active AbortController so we can cancel in-flight slider requests
    let abortController = null
    let debounceTimer = null

    const fetchRecommendations = async ({ debounce = false } = {}) => {
      // Cancel any in-flight request before starting a new one
      if (abortController) {
        abortController.abort()
      }

      const doFetch = async () => {
        abortController = new AbortController()
        loading.value = true
        error.value = null
        try {
          const response = await api.getRestockingRecommendations({
            budget: budget.value,
            warehouse: selectedLocation.value,
            category: selectedCategory.value,
            signal: abortController.signal
          })
          // Clone items so local quantity edits are independent of the fetched data
          rows.value = (response.items || []).map(item => ({
            ...item,
            quantity: item.recommended_quantity
          }))
        } catch (err) {
          // AbortError means a newer request superseded this one — not a real error
          if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return
          error.value = t('common.error') + ': ' + err.message
          console.error(err)
        } finally {
          loading.value = false
        }
      }

      if (debounce) {
        // Debounce slider input: wait 300 ms idle before fetching
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(doFetch, 300)
      } else {
        doFetch()
      }
    }

    const removeRow = (sku) => {
      rows.value = rows.value.filter(r => r.sku !== sku)
    }

    const placeOrder = async () => {
      placing.value = true
      error.value = null
      confirmation.value = null
      try {
        const items = rows.value
          .filter(r => r.quantity > 0)
          .map(r => ({ sku: r.sku, quantity: r.quantity }))
        const order = await api.submitRestockingOrder({ items })
        confirmation.value = t('restocking.orderPlaced', {
          orderNumber: order.order_number,
          expectedDelivery: order.expected_delivery
        })
        setTimeout(() => router.push('/orders'), 1200)
      } catch (err) {
        error.value = t('restocking.placeOrderFailed') + ': ' + err.message
        console.error(err)
      } finally {
        placing.value = false
      }
    }

    // Slider changes are debounced; filter changes fetch immediately
    watch(budget, () => fetchRecommendations({ debounce: true }))
    watch([selectedLocation, selectedCategory], () => fetchRecommendations())

    onMounted(() => fetchRecommendations())

    return {
      t,
      currencySymbol,
      budget,
      rows,
      loading,
      error,
      placing,
      confirmation,
      allocatedTotal,
      remainingBudget,
      activeRowCount,
      removeRow,
      placeOrder
    }
  }
}
</script>

<style scoped>
.restocking {
  padding-bottom: 2rem;
}

/* Budget card */
.budget-card .card-header {
  margin-bottom: 0.75rem;
}

.budget-display {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
}

.budget-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.budget-slider {
  flex: 1;
  accent-color: #2563eb;
  height: 4px;
  cursor: pointer;
}

.budget-number-input {
  width: 110px;
  padding: 0.375rem 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.938rem;
  color: #0f172a;
  background: #f8fafc;
  text-align: right;
  outline: none;
}

.budget-number-input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.budget-hint {
  font-size: 0.813rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Table */
.restock-table {
  table-layout: auto;
  width: 100%;
}

.col-num {
  text-align: right;
  white-space: nowrap;
}

.col-qty {
  text-align: center;
  width: 90px;
}

.col-action {
  width: 40px;
  text-align: center;
}

.sku {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.813rem;
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  color: #334155;
}

.qty-input {
  width: 72px;
  padding: 0.25rem 0.375rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
  color: #0f172a;
  outline: none;
}

.qty-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.subtotal {
  font-weight: 600;
  color: #0f172a;
}

.remove-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}

.remove-btn:hover {
  color: #dc2626;
  background: #fef2f2;
}

/* Empty state */
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #64748b;
  font-size: 0.938rem;
}

/* Summary bar */
.summary-bar {
  border-top: 1px solid #e2e8f0;
  padding-top: 1.25rem;
  margin-top: 1rem;
}

.summary-stats {
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  margin-bottom: 1rem;
}

.over-budget-warning {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.confirmation-banner {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.place-order-row {
  display: flex;
  justify-content: flex-end;
}

.place-order-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.place-order-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.place-order-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
