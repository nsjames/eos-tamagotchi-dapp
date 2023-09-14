import { SessionKit, Session, Chains } from "@wharfkit/session";
import { WalletPluginPrivateKey } from "@wharfkit/wallet-plugin-privatekey";
import { TransactPluginResourceProvider } from "@wharfkit/transact-plugin-resource-provider";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";

export const sessionKit: Writable<SessionKit|null> = writable(null);
export const session: Writable<Session|null> = writable(null);
export const tamagotchi: Writable<any|null> = writable(null);
export const showingConfetti: Writable<boolean> = writable(false);

const CONTRACT = 'cifgcc1gfa5p';
const TICK = 20; // 432

export default class WalletService {
    static async init(){
        const { WebRenderer } = await import("@wharfkit/web-renderer");
        sessionKit.set(new SessionKit({
            appName: "tamagotchi",
            chains: [Chains.Jungle4],
            ui: new WebRenderer(),
            walletPlugins: [
                new WalletPluginPrivateKey('5JaWK8FTN7QW2g5VygxSV8Xnn9XPrBP3ruESF7sFN52DqFibQNf')
            ]
        }, {
            transactPlugins: [
                new TransactPluginResourceProvider()
            ]
        }));

        session.set(await get(sessionKit)?.restore());
        if(get(session)){
            await WalletService.refreshTamagotchi();
        }
    }

    static async login(){
        const loginResult = await get(sessionKit)?.login();
        if(loginResult) session.set(loginResult.session);
c
        if(get(session)){
            await WalletService.refreshTamagotchi();
        }
    }

    static async logout(){
        await get(sessionKit)?.logout();
        session.set(null);
    }

    static async interct(action: string, data: any){
        const _session:Session = get(session);
        const interacted = await _session.transact({
            actions: [{
                account: CONTRACT,
                name: action,
                authorization: [_session.permissionLevel],
                data
            }]
        }).then((result:any) => {
            console.log(result);
            return result;
        }).catch((error:any) => {
            console.error(error);
            return null;
        });

        if(interacted){
            showingConfetti.set(true);
            setTimeout(() => WalletService.refreshTamagotchi(), 1000);
            setTimeout(() => showingConfetti.set(false), 3000);
        } else {
            alert('Something went wrong, please try again.');
        }
    }

    static async create(){
        return await WalletService.interct('create', {
            owner: get(session)?.actor.toString()
        })
    }

    static async feed(){
        return await WalletService.interct('feed', {
            owner: get(session)?.actor.toString()
        })
    }

    static async play(){
        return await WalletService.interct('play', {
            owner: get(session)?.actor.toString()
        })
    }

    static async refreshTamagotchi(fetchNew:boolean = true){
        let newTamagotchi = get(tamagotchi);
        if(fetchNew || !newTamagotchi){
            const _session:Session = get(session);
            newTamagotchi = await _session.client.v1.chain.get_table_rows({
                code: CONTRACT,
                scope: _session.actor.toString(),
                table: 'pets',
                json: true
            }).then((result:any) => {
                console.log(result);
                return result.rows[0] || null;
            }).catch((error:any) => {
                console.error(error);
                return null;
            });
        }

        if(!newTamagotchi) return;

        let lastAligned = +new Date(newTamagotchi.last_aligned*1000) / 1000;
        let now = +new Date() / 1000;

        const loss = Math.floor((now - lastAligned) / TICK);
        newTamagotchi.calculated_happiness = Math.max(0, newTamagotchi.happiness - loss);
        newTamagotchi.calculated_food = Math.max(0, newTamagotchi.food - loss);

        tamagotchi.set(newTamagotchi);
    }

}