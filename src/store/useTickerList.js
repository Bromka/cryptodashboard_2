import {defineStore, storeToRefs} from 'pinia'
import {computed, ref} from "vue";
import global from "../global.js";
import {usePaginationStore} from "./usePagination.js";

export const useTickerList = defineStore('tickerList', () => {
    const tickerList = ref(JSON.parse(localStorage.getItem(global.STORAGE_KEY)) ?? [])

    const pageStore = usePaginationStore()
    const {page, filter} = storeToRefs(pageStore)


    async function addTicker(tickerName) {
        const ticker = tickerName.trim().toUpperCase()
        const isAvailable = await isTickerAvailable(ticker)
        if (ticker.length && !tickerList.value.includes(ticker) && isAvailable)
            tickerList.value.push(ticker)
    }

    function removeTicker(tickerName) {
        const ticker = tickerName.trim().toUpperCase()
        tickerList.value = tickerList.value.filter(tickerElement => tickerElement !== ticker)
    }

    async function isTickerAvailable(tickerName) {
        const response = await fetch(`${global.API_URL}price?fsym=${tickerName}&tsyms=USD`)
        const body = await response.json();
        if ('USD' in body) {
            return true
        }
        return false
    }

    const filteredTickers = computed(() => {
        const filtered = tickerList.value.filter(ticker => {
            if (filter.value.trim().toLowerCase()) {
                return ticker.toLowerCase().includes(filter.value)
            } else {
                return ticker
            }
        })

        return filtered
    })

    const currentPageTickers = computed(() => {
        const pageLimit = 6;
        return filteredTickers.value.slice(page.value * pageLimit, (page.value + 1) * pageLimit)
    })


    return {tickerList, addTicker, removeTicker, currentPageTickers, filteredTickers}
})