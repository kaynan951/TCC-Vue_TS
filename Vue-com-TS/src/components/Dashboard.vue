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
          <h1 class="text-3xl font-bold text-gray-800">Painel COVID-19 no Nordeste Brasileiro</h1>
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
           <h2 class="text-xl font-semibold mb-4 text-gray-800">
            {{ 
              filters.province !== 'All'
                ? `Tabela de Resultados do estado: ${filters.province} entre (${dateRangeTitle})`
                : `Tabela de Resultados do Nordeste em: (${dateRangeTitle})`
            }}
          </h2>
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
      <!-- Footer -->
      <div class="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-600 flex items-center justify-around  flex-col md:flex-row gap-8">
        <div class="flex items-center justify-center gap-2">
          <a 
            href="https://vuejs.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
          >
          <img :src="LogoVue" alt="Vue 3 Logo" class="w-10 h-10" />
                <span class="font-semibold">Vue 3</span>
          </a>
        </div>
      
        <div class="flex flex-col items-center justify-center">
          <div class="mt-2">
            Desenvolvido com Vue 3, TypeScript e Tailwind CSS.
          </div>
          <div class="mt-2">
            Dados fornecidos por <a href="https://covid-api.com/" target="_blank" class="text-blue-500 underline">COVID-API</a>.
          </div>
          <div class="mt-2">
            Desenvolvedor: Kaynan Pereira de Sousa.
          </div>
        </div>
      
        <div class="flex items-center justify-center gap-2">
          <a 
            href="https://www.typescriptlang.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img :src="LogoTS" alt="TypeScript Logo" class="w-10 h-10" />
            <span class="font-semibold">TypeScript</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted,nextTick } from 'vue';
import { computed } from 'vue';
import type { FilterState, StatsCard, TableRow } from '../types';
import LogoVue from '../assets/Vue.svg';
import LogoTS from '../assets/TypeScript.svg';

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

// ===== FORMATAÇÃO E DATAS =====

// Formata data ISO (YYYY-MM-DD) para DD/MM/YYYY
const formatDateDisplay = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

// Gera array de 7 datas: 3 dias antes, dia central, 3 dias depois
const getDateRange = (centerDate: string): string[] => {
  const dates: string[] = [];
  const center = new Date(centerDate + 'T00:00:00'); // Evita problemas de timezone
  
  for (let offset = -3; offset <= 3; offset++) {
    const date = new Date(center);
    date.setDate(center.getDate() + offset);
    dates.push(date.toISOString().slice(0, 10));
  }
  
  return dates;
};

// Título da tabela mostrando intervalo de datas
const dateRangeTitle = computed(() => {
  const dates = getDateRange(filters.specificDate);
  return `${formatDateDisplay(dates[0]!)} - ${formatDateDisplay(dates[6]!)}`;
});

// ===== BUSCA DE DADOS =====

// Busca dados de uma data específica
const fetchDataForDate = async (isoDate: string) => {
  try {
    const response = await fetch(
      `https://covid-api.com/api/reports?date=${isoDate}&iso=${filters.country}`
    );
    const json = await response.json();
    
    if (!json.data?.length) {
      return { confirmed: 0, deaths: 0, recovered: 0, active: 0 };
    }

    // Filtra por província se necessário
    const filteredData = json.data.filter((item: any) => {
      if (!item.region) return false;
      if (filters.province === 'All') return true;
      return normalizeStr(item.region.province || '') === normalizeStr(filters.province);
    });

    // Agrega os dados
    return filteredData.reduce(
      (acc: any, item: any) => ({
        confirmed: acc.confirmed + (item.confirmed || 0),
        deaths: acc.deaths + (item.deaths || 0),
        recovered: acc.recovered + (item.recovered || 0),
        active: acc.active + (item.active || 0)
      }),
      { confirmed: 0, deaths: 0, recovered: 0, active: 0 }
    );
  } catch (error) {
    console.error(`Erro ao buscar dados para ${isoDate}:`, error);
    return { confirmed: 0, deaths: 0, recovered: 0, active: 0 };
  }
};

// Busca dados da janela de 7 dias
const fetchCovidData = async () => {
  loading.value = true;
  
  try {
    // Gera as 7 datas
    const dates = getDateRange(filters.specificDate);
    
    // Faz as 7 requisições em paralelo
    const results = await Promise.all(
      dates.map(async (date) => ({
        date,
        data: await fetchDataForDate(date)
      }))
    );

    // Popula a tabela (datas já estão ordenadas)
    tableData.value = results.map(({ date, data }) => ({
      date: formatDateDisplay(date),
      cases: formatNumber(data.confirmed),
      deaths: formatNumber(data.deaths),
      recovered: formatNumber(data.recovered),
      active: formatNumber(data.active)
    }));

    // Atualiza estatísticas usando o dia central (índice 3)
    const centerData = results[3]!.data;
    
    stats.total = formatNumber(centerData.confirmed);
    stats.deaths = formatNumber(centerData.deaths);
    stats.recovered = formatNumber(centerData.recovered);
    stats.active = formatNumber(centerData.active);

    // Atualiza cards de estatísticas
    const cards = statsCards.value;
    if (cards?.length >= 4) {
      cards[0]!.value = stats.total;
      cards[1]!.value = stats.deaths;
      cards[2]!.value = stats.recovered;
      cards[3]!.value = stats.active;
    }

    await nextTick();
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  } finally {
    loading.value = false;
  }
};

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