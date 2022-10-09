import {defineStore, storeToRefs} from 'pinia'
import {useTickerList} from "./useTickerList.js";
import {computed, ref} from "vue";
import global from "../global.js";

export const useSockets = defineStore('cryptocompare', () => {

    const URL = "wss://streamer.cryptocompare.com/v2?api_key=fdb9579108906a3c0023a8ce3c4fd0feb6186309a813aef77e02962dac9c99e9"
    let socket = new WebSocket(URL);

    const tickerStore = useTickerList()
    const { tickerList } = storeToRefs(tickerStore)

    const subsGoals = computed(() => {
        return tickerList.value.map(el => `0~Coinbase~${el}~USD`)
    })
    tickerStore.$subscribe((mutation, state) => {
        if (mutation.storeId === 'tickerList') {
            localStorage.setItem(global.STORAGE_KEY, JSON.stringify(state.tickerList))
            close()
            setTimeout(() => {
                open()
                socket.send()
            }, 6000)

        }

    })
    function open() {
        socket.onopen = (e) => {
            const subscribe = {
                "action": "SubAdd",
                "subs": subsGoals.value
            }
            socket.send(JSON.stringify(subscribe))
            console.log(e, 'asssssssssssssssda')
        }
        socket.onclose = function (event) {
            if (event.wasClean) {
                console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
            } else {
                console.log('[close] Соединение прервано');
            }
        };

        socket.onmessage = function (event) {
            console.log(`[message] Данные получены с сервера: ${event.data}`);
        };

        socket.onerror = function (error) {
            console.log(`[error] ${error}`);
            console.log(error);
        };
    }

    function close() {
        socket.close()
    }

    return {close, open}
})