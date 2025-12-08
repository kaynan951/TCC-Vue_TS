<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center gap-3 justify-center">
          <div class="bg-blue-500 rounded-full p-3">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800">Painel COVID-19 no Nordeste</h1>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between ">
            <h2 class="text-2xl font-semibold text-gray-800 gap-2">Filtros de Busca</h2>
              <div class="flex items-end gap-4 w-full md:w-auto md:flex-row flex-col">
                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex-wrap">Estado</label>
                  <select v-model="filters.province" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="All">Todos os estados</option>
                    <option value="Alagoas">Alagoas</option>
                    <option value="Bahia">Bahia</option>
                    <option value="Ceará">Ceará</option>
                    <option value="Maranhão">Maranhão</option>
                    <option value="Paraíba">Paraíba</option>
                    <option value="Pernambuco">Pernambuco</option>
                    <option value="Piauí">Piauí</option>
                    <option value="Rio Grande do Norte">Rio Grande do Norte</option>
                    <option value="Sergipe">Sergipe</option>
                  </select>
                </div>
              <div class="w-full">
                <label class="block text-sm font-medium text-gray-700 mb-2">Data específica</label>
                <div class="flex gap-2">
                  <input 
                    type="date" 
                    v-model="filters.specificDate"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
                <button 
                @click="fetchCovidData"
                :disabled="loading"
                class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ loading ? 'Carregando...' : 'Buscar' }}
                </button>
            </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="(card, index) in statsCards" :key="index" class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-4">
            <div :class="card.bgColor" class="rounded-full p-4">
              <svg :class="card.iconColor" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.iconPath" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ card.title }}</p>
              <p class="text-3xl font-bold text-gray-800">{{ card.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <!-- Table -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Tabela de Resultados ({{ dateRangeTitle }})</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Casos</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mortes</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recup.</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ativos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in tableData" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ row.date }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ row.cases }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ row.deaths }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ row.recovered }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800">{{ row.active }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,nextTick } from 'vue';
import { computed } from 'vue';
import type { FilterState, StatsCard, TableRow } from '../types';

const loading = ref(false);

const filters = reactive<FilterState>({
  country: 'BRA',
  province: 'All',
  city: 'Todas',
  specificDate: '2022-07-01'
});

const stats = reactive({
  total: '0',
  deaths: '0',
  recovered: '0',
  active: '0'
});


const tableData = ref<TableRow[]>([]);

// Inicializa os cards com valores padrão (serão atualizados após a requisição)
const statsCards = ref<StatsCard[]>([
  {
    title: 'Total de Casos',
    value: stats.total,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
    iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Óbitos',
    value: stats.deaths,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
    iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Recuperados',
    value: stats.recovered,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-500',
    iconPath: 'M5 13l4 4L19 7'
  },
  {
    title: 'Ativos',
    value: stats.active,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
    iconPath: 'M3 3h18v18H3z'
  }
]);

// Helper: normaliza strings para comparação sem acentos
const normalizeStr = (s?: string) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Methods
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Helper: format ISO date (YYYY-MM-DD) to DD/MM/YYYY for display
const formatDateDisplay = (isoDate: string) => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper: return array of ISO dates (YYYY-MM-DD) for center +/- 3 days
const getDateRange = (centerIso: string) => {
  const center = new Date(centerIso);
  const dates: string[] = [];
  for (let offset = -2; offset <= 4; offset++) {
    const d = new Date(center);
    d.setDate(center.getDate() + offset);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

// Title for the table showing start - end in DD/MM/YYYY
const dateRangeTitle = computed(() => {
  try {
    const arr = getDateRange(filters.specificDate).map(iso => formatDateDisplay(iso));
    return `${arr[0]} - ${arr[arr.length - 1]}`;
  } catch (e) {
    return '';
  }
});

// Fetch data for 7-day window (3 before, day, 3 after) and populate tableData.
const fetchCovidData = async () => {
  loading.value = true;
  try {
    const dates = getDateRange(filters.specificDate);

    const fetchForDate = async (iso: string) => {
      try {
        const res = await fetch(`https://covid-api.com/api/reports?date=${iso}&iso=${filters.country}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Filtra por estado/province quando aplicável
          const relevant = json.data.filter((item: any) => {
            if (!item.region) return false;
            if (filters.province === 'All') return true;
            const prov = item.region.province || '';
            return normalizeStr(prov) === normalizeStr(filters.province);
          });

          const aggregated = relevant.reduce((acc: any, item: any) => ({
            confirmed: acc.confirmed + (item.confirmed || 0),
            deaths: acc.deaths + (item.deaths || 0),
            recovered: acc.recovered + (item.recovered || 0),
            active: acc.active + (item.active || 0)
          }), { confirmed: 0, deaths: 0, recovered: 0, active: 0 });

          return { iso, aggregated };
        }
      } catch (err) {
        console.error('Erro ao buscar dados para', iso, err);
      }
      return { iso, aggregated: { confirmed: 0, deaths: 0, recovered: 0, active: 0 } };
    };

    const results = await Promise.all(dates.map(d => fetchForDate(d)));

    // Sort by iso increasing (oldest -> newest)
    results.sort((a, b) => a.iso.localeCompare(b.iso));

    tableData.value = results.map(r => ({
      date: formatDateDisplay(r.iso),
      cases: formatNumber(r.aggregated.confirmed),
      deaths: formatNumber(r.aggregated.deaths),
      recovered: formatNumber(r.aggregated.recovered),
      active: formatNumber(r.aggregated.active)
    }));

    // Update stats using the center date (the selected date)6
    const centerResult = results.find(r => r.iso === filters.specificDate) ?? results[Math.floor(results.length / 2)];
    if (centerResult) {
      stats.total = formatNumber(centerResult.aggregated.confirmed);
      stats.deaths = formatNumber(centerResult.aggregated.deaths);
      stats.recovered = formatNumber(centerResult.aggregated.recovered);
      stats.active = formatNumber(centerResult.aggregated.active);

      
      const sc = statsCards.value;
      if (sc && sc.length >= 4) {
        sc[0]!.value = stats.total;
        sc[1]!.value = stats.deaths;
        sc[2]!.value = stats.recovered;
        sc[3]!.value = stats.active;
      }
    }

    await nextTick();
  } catch (error) {
    console.error('Erro ao buscar dados da janela de datas:', error);
  } finally {
    loading.value = false;
  }
};



// Lifecycle
onMounted(() => {
  fetchCovidData();
});

</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}
</style>